import { useState } from 'react';
import { Checkbox, DatePicker, Input, Select as AntSelect } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createStay, updateStay, type AdminGuest, type AdminStay, type CreateStayPayload,
} from '../api';
import { Modal, ModalFooter } from '@/shared/components/Modal';
import { shortStayStatus } from '@/shared/lib/presentation';
import { stayFormSchema, type StayFormValues } from '../schemas/stay-form-schema';
import { Toast } from '@/shared/components/Toast';

export function StayModal({
  accessToken,
  guests,
  layer = 'primary',
  onCancel,
  onSaved,
  operationHours,
  stay,
}: {
  accessToken: string;
  guests: AdminGuest[];
  layer?: 'primary' | 'secondary';
  onCancel: () => void;
  onSaved: () => void;
  operationHours?: { checkInTime: string; checkOutTime: string } | undefined;
  stay?: AdminStay;
}) {
  return (
    <Modal
      className="operational-form-modal stay-form-modal"
      layer={layer}
      onClose={onCancel}
      title={stay ? 'Editar estadia' : 'Nova estadia'}
      width={600}
    >
      <StayForm accessToken={accessToken} guests={guests} onCancel={onCancel} onSaved={onSaved} operationHours={operationHours} {...(stay ? { stay } : {})} />
    </Modal>
  );
}

function StayForm({
  accessToken,
  guests,
  onCancel,
  onSaved,
  operationHours,
  stay,
}: {
  accessToken: string;
  guests: AdminGuest[];
  onCancel: () => void;
  onSaved: () => void;
  operationHours?: { checkInTime: string; checkOutTime: string } | undefined;
  stay?: AdminStay;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [requestError, setRequestError] = useState<string | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<StayFormValues>({
    resolver: zodResolver(stayFormSchema),
    defaultValues: {
      useNewGuest: false,
      guestId: stay?.guest.id ?? '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      roomNumber: stay?.roomNumber ?? '',
      checkInDate: stay?.checkInDate ?? today,
      checkOutDate: stay?.checkOutDate ?? today,
      consumptionView: stay?.consumptionView ?? 'ready',
    },
  });
  const useNewGuest = useWatch({ control, name: 'useNewGuest' });

  async function submit(values: StayFormValues) {
    setRequestError(null);
    const stayFields = {
      roomNumber: values.roomNumber.trim(),
      checkInDate: values.checkInDate,
      checkOutDate: values.checkOutDate,
      consumptionEnabled: true,
      consumptionView: values.consumptionView,
    };

    try {
      if (stay) {
        await updateStay(accessToken, stay.id, { ...stayFields, guestId: values.guestId });
      } else {
        const payload: CreateStayPayload = {
          ...stayFields,
          ...(values.useNewGuest
            ? {
                guest: {
                  firstName: values.firstName.trim(),
                  lastName: values.lastName.trim(),
                  phoneNumber: values.phoneNumber.trim(),
                },
              }
            : { guestId: values.guestId }),
        };
        await createStay(accessToken, payload);
      }
      onSaved();
    } catch (cause) {
      setRequestError(cause instanceof Error ? cause.message : `Não foi possível ${stay ? 'editar' : 'criar'} estadia.`);
    }
  }

  return (
    <form className="stay-modal-form" noValidate onSubmit={handleSubmit(submit)}>
      {!stay ? (
        <label className="stay-form-toggle">
          <Controller
            control={control}
            name="useNewGuest"
            render={({ field }) => (
              <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
            )}
          />
          Cadastrar novo hóspede
        </label>
      ) : null}

      {useNewGuest ? (
        <>
          <label>Nome<Input {...register('firstName')} aria-invalid={Boolean(errors.firstName)} /></label>
          <FieldError message={errors.firstName?.message} />
          <label>Sobrenome<Input {...register('lastName')} aria-invalid={Boolean(errors.lastName)} /></label>
          <FieldError message={errors.lastName?.message} />
          <label className="stay-form-wide">Telefone<Input {...register('phoneNumber')} aria-invalid={Boolean(errors.phoneNumber)} inputMode="tel" /></label>
          <FieldError message={errors.phoneNumber?.message} />
        </>
      ) : (
        <label className="stay-form-wide">Hóspede
          <Controller
            control={control}
            name="guestId"
            render={({ field }) => (
              <AntSelect
                aria-invalid={Boolean(errors.guestId)}
                onChange={(value) => field.onChange(value ?? '')}
                options={guests.map((guest) => ({ key: guest.id, label: `${guest.firstName} ${guest.lastName}`, value: guest.id }))}
                placeholder="Selecione"
                value={field.value || null}
              />
            )}
          />
          <FieldError message={errors.guestId?.message} />
        </label>
      )}

      <label>Quarto<Input {...register('roomNumber')} aria-invalid={Boolean(errors.roomNumber)} /></label>
      <FieldError message={errors.roomNumber?.message} />

      <div className="stay-form-operation-hours stay-form-wide">
        <ClockCircleOutlined />
        <span>Horários do hotel (informativos)</span>
        <strong>Check-in {stay?.checkInTime ?? operationHours?.checkInTime ?? '14:00'} · Check-out {stay?.checkOutTime ?? operationHours?.checkOutTime ?? '12:00'}</strong>
      </div>

      <label>Check-in
        <Controller
          control={control}
          name="checkInDate"
          render={({ field }) => (
            <DatePicker format="DD/MM/YYYY" onChange={(value) => field.onChange(value?.format('YYYY-MM-DD') ?? '')} prefix={<CalendarOutlined />} suffixIcon={null} value={field.value ? dayjs(field.value) : null} />
          )}
        />
        <FieldError message={errors.checkInDate?.message} />
      </label>

      <label>Check-out
        <Controller
          control={control}
          name="checkOutDate"
          render={({ field }) => (
            <DatePicker format="DD/MM/YYYY" onChange={(value) => field.onChange(value?.format('YYYY-MM-DD') ?? '')} prefix={<CalendarOutlined />} suffixIcon={null} value={field.value ? dayjs(field.value) : null} />
          )}
        />
        <FieldError message={errors.checkOutDate?.message} />
      </label>

      <label className="stay-form-wide">Lançamento de consumos
        <Controller
          control={control}
          name="consumptionView"
          render={({ field }) => (
            <AntSelect
              onChange={field.onChange}
              options={[
                { label: 'Permitido', value: 'ready' },
                { label: 'Permitido, sem itens lançados', value: 'empty' },
                { label: 'Indisponível', value: 'unavailable' },
              ]}
              value={field.value}
            />
          )}
        />
      </label>

      <p className="stay-form-status">Status operacional: <strong>{stay ? shortStayStatus(stay.status) : 'Agendada'}</strong></p>
      {requestError ? <Toast message={requestError} onClose={() => setRequestError(null)} tone="error" /> : null}
      <ModalFooter isSubmitting={isSubmitting} onCancel={onCancel} submitLabel={stay ? 'Salvar alterações' : 'Cadastrar estadia'} />
    </form>
  );
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? <span className="form-error" role="alert">{message}</span> : null;
}
