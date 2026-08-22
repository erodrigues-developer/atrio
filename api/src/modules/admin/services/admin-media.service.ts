import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import { buildResourceId } from 'src/common/utils/id.util';
import { ExperienceCollection } from 'src/modules/experiences/entities/experience-collection.entity';
import { Experience } from 'src/modules/experiences/entities/experience.entity';
import { HotelUsefulInfo } from 'src/modules/stays/entities/hotel-useful-info.entity';
import { Hotel } from 'src/modules/stays/entities/hotel.entity';
import { StorageService } from 'src/modules/storage/services/storage.service';
import { Repository } from 'typeorm';
import { CreateAdminHotelUsefulInfoDto, UpdateAdminHotelWifiDto } from '../dto/admin-hotel-settings.dto';
import { AuditService } from './audit.service';

@Injectable()
export class AdminMediaService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(HotelUsefulInfo)
    private readonly hotelUsefulInfoRepository: Repository<HotelUsefulInfo>,
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
    @InjectRepository(ExperienceCollection)
    private readonly collectionRepository: Repository<ExperienceCollection>,
    private readonly storageService: StorageService,
    private readonly auditService: AuditService,
  ) {}

  async getHotelSettings(session: AdminSessionContext) {
    const hotel = await this.getRequiredHotel(session.hotelId);
    return this.mapHotel(hotel, await this.listUsefulInfo(hotel.publicId));
  }

  async updateHotelWifi(session: AdminSessionContext, input: UpdateAdminHotelWifiDto) {
    const hotel = await this.getRequiredHotel(session.hotelId);
    hotel.wifiNetwork = input.wifiNetwork;
    hotel.wifiPassword = input.wifiPassword;
    const saved = await this.hotelRepository.save(hotel);
    await this.record(session, 'hotel.wifi.update', 'hotel', hotel.publicId, 'updated hotel Wi-Fi');
    return this.mapHotel(saved, await this.listUsefulInfo(saved.publicId));
  }

  async createHotelUsefulInfo(session: AdminSessionContext, input: CreateAdminHotelUsefulInfoDto) {
    await this.getRequiredHotel(session.hotelId);
    const item = new HotelUsefulInfo();
    item.publicId = buildResourceId('info');
    item.hotelId = session.hotelId;
    item.scope = input.scope;
    item.title = input.title;
    item.description = input.description;
    item.position = input.position;
    const saved = await this.hotelUsefulInfoRepository.save(item);
    await this.record(session, 'hotel.useful_info.create', 'hotel_useful_info', saved.publicId, 'created hotel useful info');
    return this.mapUsefulInfo(saved);
  }

  async uploadHotelImage(session: AdminSessionContext, kind: 'logo' | 'hero-image', file: { buffer: Buffer; mimetype?: string; originalname?: string }) {
    const hotel = await this.getRequiredHotel(session.hotelId);
    const uploaded = await this.upload(file, `hotels/${hotel.publicId}/${kind}`);

    if (kind === 'logo') {
      hotel.logoUrl = uploaded.url;
    } else {
      hotel.heroImageUrl = uploaded.url;
    }

    const saved = await this.hotelRepository.save(hotel);
    await this.record(session, 'hotel.media.upload', 'hotel', hotel.publicId, `uploaded ${kind}`);
    return this.mapHotel(saved, await this.listUsefulInfo(saved.publicId));
  }

  async uploadExperienceImage(session: AdminSessionContext, experienceId: string, file: { buffer: Buffer; mimetype?: string; originalname?: string }) {
    const experience = await this.experienceRepository.findOne({ where: { publicId: experienceId } });

    if (!experience) {
      throw new ApiException(404, 'EXPERIENCE_NOT_FOUND', 'Experience was not found.');
    }

    const uploaded = await this.upload(file, `experiences/${experience.publicId}/image`);
    experience.imageUrl = uploaded.url;
    const saved = await this.experienceRepository.save(experience);
    await this.record(session, 'experience.media.upload', 'experience', saved.publicId, `uploaded image for ${saved.title}`);
    return { id: saved.publicId, imageUrl: saved.imageUrl };
  }

  async uploadCollectionImage(session: AdminSessionContext, collectionId: string, file: { buffer: Buffer; mimetype?: string; originalname?: string }) {
    const collection = await this.collectionRepository.findOne({ where: { publicId: collectionId } });

    if (!collection) {
      throw new ApiException(404, 'COLLECTION_NOT_FOUND', 'Experience collection was not found.');
    }

    const uploaded = await this.upload(file, `experience-collections/${collection.publicId}/image`);
    collection.imageUrl = uploaded.url;
    const saved = await this.collectionRepository.save(collection);
    await this.record(session, 'experience_collection.media.upload', 'experience_collection', saved.publicId, `uploaded image for ${saved.title}`);
    return { id: saved.publicId, imageUrl: saved.imageUrl };
  }

  private async upload(file: { buffer: Buffer; mimetype?: string; originalname?: string }, keyPrefix: string) {
    if (!file?.buffer) {
      throw new ApiException(400, 'MEDIA_FILE_REQUIRED', 'A media file is required.');
    }

    const extension = this.extensionFor(file);
    return this.storageService.uploadFile({
      key: `${keyPrefix}-${Date.now()}${extension}`,
      body: file.buffer,
      contentType: file.mimetype ?? 'application/octet-stream',
    });
  }

  private extensionFor(file: { mimetype?: string; originalname?: string }) {
    const fromName = file.originalname?.match(/\.[a-z0-9]+$/i)?.[0];
    if (fromName) {
      return fromName.toLowerCase();
    }

    if (file.mimetype === 'image/png') return '.png';
    if (file.mimetype === 'image/webp') return '.webp';
    if (file.mimetype === 'image/jpeg') return '.jpg';
    return '';
  }

  private async getRequiredHotel(hotelId: string) {
    const hotel = await this.hotelRepository.findOne({ where: { publicId: hotelId } });

    if (!hotel) {
      throw new ApiException(404, 'HOTEL_NOT_FOUND', 'Hotel was not found.');
    }

    return hotel;
  }

  private async listUsefulInfo(hotelId: string) {
    const items = await this.hotelUsefulInfoRepository.find({
      where: { hotelId },
      order: { scope: 'ASC', position: 'ASC' },
    });
    return items.map((item) => this.mapUsefulInfo(item));
  }

  private mapHotel(hotel: Hotel, usefulInfo: ReturnType<AdminMediaService['mapUsefulInfo']>[] = []) {
    return {
      id: hotel.publicId,
      name: hotel.name,
      logoUrl: hotel.logoUrl,
      heroImageUrl: hotel.heroImageUrl,
      wifiNetwork: hotel.wifiNetwork ?? '',
      wifiPassword: hotel.wifiPassword ?? '',
      usefulInfo,
    };
  }

  private mapUsefulInfo(item: HotelUsefulInfo) {
    return {
      id: item.publicId,
      scope: item.scope,
      title: item.title,
      description: item.description,
      position: item.position,
    };
  }

  private async record(session: AdminSessionContext, action: string, resourceType: string, resourceId: string, summary: string) {
    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action,
      resourceType,
      resourceId,
      summary: `${session.email} ${summary}.`,
    });
  }
}
