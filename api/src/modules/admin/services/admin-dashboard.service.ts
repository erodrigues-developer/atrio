import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getDashboard(session: AdminSessionContext) {
    const [hotel] = await this.dataSource.query(
      'SELECT public_id AS id, name FROM hotels WHERE public_id = $1 LIMIT 1',
      [session.hotelId],
    );
    const [activeStays] = await this.dataSource.query(
      "SELECT COUNT(*)::int AS count FROM stays WHERE hotel_id = $1 AND status = 'active'",
      [session.hotelId],
    );
    const [checkIns] = await this.dataSource.query(
      'SELECT COUNT(*)::int AS count FROM stays WHERE hotel_id = $1 AND check_in_date = CURRENT_DATE',
      [session.hotelId],
    );
    const [checkOuts] = await this.dataSource.query(
      'SELECT COUNT(*)::int AS count FROM stays WHERE hotel_id = $1 AND check_out_date = CURRENT_DATE',
      [session.hotelId],
    );
    const [openRequests] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count
       FROM stay_requests sr
       INNER JOIN stays s ON s.public_id = sr.stay_id
       WHERE s.hotel_id = $1
         AND s.status = 'active'
         AND sr.status NOT IN ('completed', 'cancelled', 'rejected')
         AND sr.created_at >= NOW() - INTERVAL '7 days'`,
      [session.hotelId],
    );
    const [overdueRequests] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count
       FROM stay_requests sr
       INNER JOIN stays s ON s.public_id = sr.stay_id
       WHERE s.hotel_id = $1
         AND s.status = 'active'
         AND sr.status NOT IN ('completed', 'cancelled', 'rejected')
         AND sr.created_at >= NOW() - INTERVAL '7 days'
         AND sr.created_at <= NOW() - INTERVAL '30 minutes'`,
      [session.hotelId],
    );
    const [pendingReservations] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count
       FROM reservations r
       INNER JOIN stays s ON s.public_id = r.stay_id
       WHERE s.hotel_id = $1
         AND r.status IN ('requested', 'waitlisted')
         AND r.scheduled_at >= CURRENT_DATE`,
      [session.hotelId],
    );
    const [pendingConcierge] = await this.dataSource.query(
      `WITH conversation_activity AS (
         SELECT
           s.public_id,
           MAX(cm.created_at) FILTER (WHERE cm.sender = 'guest') AS last_guest_message_at,
           MAX(cm.created_at) FILTER (WHERE cm.sender = 'hotel') AS last_hotel_message_at
         FROM stays s
         LEFT JOIN concierge_messages cm ON cm.stay_id = s.public_id
         WHERE s.hotel_id = $1
         GROUP BY s.public_id
       )
       SELECT
         COUNT(*) FILTER (
           WHERE last_guest_message_at IS NOT NULL
             AND (last_hotel_message_at IS NULL OR last_guest_message_at > last_hotel_message_at)
         )::int AS count,
         COUNT(*) FILTER (
           WHERE last_guest_message_at IS NOT NULL
             AND (last_hotel_message_at IS NULL OR last_guest_message_at > last_hotel_message_at)
             AND last_guest_message_at <= NOW() - INTERVAL '15 minutes'
         )::int AS delayed
       FROM conversation_activity`,
      [session.hotelId],
    );
    const pendingRequests = await this.dataSource.query(
      `SELECT
         sr.public_id AS id,
         sr.title,
         sr.status,
         CASE
           WHEN sr.created_at <= NOW() - INTERVAL '30 minutes' THEN 'Atrasada'
           WHEN sr.status IN ('in_progress', 'on_the_way') THEN 'Em atendimento'
           ELSE 'Aguardando'
         END AS "statusLabel",
         sr.room_number AS "roomNumber",
         CONCAT(g.first_name, ' ', g.last_name) AS "guestName",
         CASE
           WHEN sr.created_at <= NOW() - INTERVAL '30 minutes' THEN 'critical'
           WHEN sr.status IN ('in_progress', 'on_the_way') THEN 'normal'
           ELSE 'warning'
         END AS priority,
         FLOOR(EXTRACT(EPOCH FROM (NOW() - sr.created_at)) / 60)::int AS "waitMinutes",
         sr.created_at AS "createdAt"
       FROM stay_requests sr
       INNER JOIN stays s ON s.public_id = sr.stay_id
       INNER JOIN guests g ON g.public_id = s.guest_id
       WHERE s.hotel_id = $1
         AND s.status = 'active'
         AND sr.status NOT IN ('completed', 'cancelled', 'rejected')
         AND sr.created_at >= NOW() - INTERVAL '7 days'
       ORDER BY
         CASE WHEN sr.created_at <= NOW() - INTERVAL '30 minutes' THEN 0 ELSE 1 END,
         CASE WHEN sr.status IN ('received', 'accepted') THEN 0 ELSE 1 END,
         sr.created_at ASC
       LIMIT 5`,
      [session.hotelId],
    );
    const pendingExperiences = await this.dataSource.query(
      `SELECT
         r.public_id AS id,
         r.title,
         r.status,
         'Aguardando confirmação' AS "statusLabel",
         r.scheduled_at AS "scheduledAt",
         s.room_number AS "roomNumber",
         CONCAT(g.first_name, ' ', g.last_name) AS "guestName",
         TO_CHAR(r.scheduled_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM · HH24:MI') AS helper,
         CASE WHEN r.created_at <= NOW() - INTERVAL '2 hours' THEN 'warning' ELSE 'normal' END AS priority
       FROM reservations r
       INNER JOIN stays s ON s.public_id = r.stay_id
       INNER JOIN guests g ON g.public_id = s.guest_id
       WHERE s.hotel_id = $1
         AND r.status IN ('requested', 'waitlisted')
         AND r.scheduled_at >= CURRENT_DATE
       ORDER BY r.created_at ASC
       LIMIT 3`,
      [session.hotelId],
    );
    const conciergeConversations = await this.dataSource.query(
      `WITH conversation_activity AS (
         SELECT
           s.public_id AS id,
           s.room_number AS "roomNumber",
           CONCAT(g.first_name, ' ', g.last_name) AS "guestName",
           MAX(cm.created_at) FILTER (WHERE cm.sender = 'guest') AS last_guest_message_at,
           MAX(cm.created_at) FILTER (WHERE cm.sender = 'hotel') AS last_hotel_message_at
         FROM stays s
         INNER JOIN guests g ON g.public_id = s.guest_id
         LEFT JOIN concierge_messages cm ON cm.stay_id = s.public_id
         WHERE s.hotel_id = $1
         GROUP BY s.public_id, s.room_number, g.first_name, g.last_name
       )
       SELECT
         id,
         'Concierge' AS title,
         'waiting_reply' AS status,
         'Aguardando resposta' AS "statusLabel",
         "roomNumber",
         "guestName",
         FLOOR(EXTRACT(EPOCH FROM (NOW() - last_guest_message_at)) / 60)::int AS "waitMinutes",
         CASE WHEN last_guest_message_at <= NOW() - INTERVAL '15 minutes' THEN 'warning' ELSE 'normal' END AS priority,
         last_guest_message_at AS "createdAt"
       FROM conversation_activity
       WHERE last_guest_message_at IS NOT NULL
         AND (last_hotel_message_at IS NULL OR last_guest_message_at > last_hotel_message_at)
       ORDER BY last_guest_message_at ASC
       LIMIT 3`,
      [session.hotelId],
    );
    const upcomingMovements = await this.dataSource.query(
      `(SELECT
          CONCAT('checkin-', s.public_id) AS id,
          'Hoje' AS "timeLabel",
          'check-in' AS type,
          CONCAT(g.first_name, ' ', g.last_name) AS title,
          CONCAT('Quarto ', s.room_number) AS helper,
          NULL::timestamptz AS "scheduledAt"
        FROM stays s
        INNER JOIN guests g ON g.public_id = s.guest_id
        WHERE s.hotel_id = $1 AND s.check_in_date = CURRENT_DATE)
       UNION ALL
       (SELECT
          CONCAT('checkout-', s.public_id) AS id,
          s.check_out_time AS "timeLabel",
          'check-out' AS type,
          CONCAT(g.first_name, ' ', g.last_name) AS title,
          CONCAT('Quarto ', s.room_number) AS helper,
          (CURRENT_DATE + s.check_out_time::time)::timestamptz AS "scheduledAt"
        FROM stays s
        INNER JOIN guests g ON g.public_id = s.guest_id
        WHERE s.hotel_id = $1 AND s.check_out_date = CURRENT_DATE)
       UNION ALL
       (SELECT
          CONCAT('experience-', r.public_id) AS id,
          TO_CHAR(r.scheduled_at AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI') AS "timeLabel",
          'experience' AS type,
          r.title,
          CONCAT(g.first_name, ' ', g.last_name, ' · Quarto ', s.room_number) AS helper,
          r.scheduled_at AS "scheduledAt"
        FROM reservations r
        INNER JOIN stays s ON s.public_id = r.stay_id
        INNER JOIN guests g ON g.public_id = s.guest_id
        WHERE s.hotel_id = $1 AND r.scheduled_at::date = CURRENT_DATE)
       ORDER BY "scheduledAt" ASC NULLS FIRST
       LIMIT 5`,
      [session.hotelId],
    );
    const normalizedUpcomingMovements = upcomingMovements.map(
      ({ scheduledAt, ...movement }: { scheduledAt?: Date | string | null; [key: string]: unknown }) => (
        scheduledAt
          ? { ...movement, scheduledAt: new Date(scheduledAt).toISOString() }
          : movement
      ),
    );
    const alerts = [
      ...pendingRequests
        .filter((request: { priority: string }) => request.priority === 'critical')
        .slice(0, 1)
        .map((request: { id: string; title: string; roomNumber: string; waitMinutes: number }) => ({
          id: `request-${request.id}`,
          tone: 'critical',
          title: `${request.title} · Quarto ${request.roomNumber}`,
          helper: 'Crítico · aguardando há',
          actionLabel: 'Abrir',
          targetView: 'requests',
          waitMinutes: request.waitMinutes,
        })),
      ...(Number(pendingReservations.count) > 0
        ? [{
            id: 'pending-experiences',
            tone: 'warning',
            title: `${Number(pendingReservations.count)} ${Number(pendingReservations.count) === 1 ? 'experiência' : 'experiências'} aguardando confirmação`,
            helper: 'Experiências pendentes de revisão',
            actionLabel: 'Revisar',
            targetView: 'reservations',
          }]
        : []),
      ...(Number(pendingConcierge.delayed) > 0
        ? [{
            id: 'pending-concierge',
            tone: 'warning',
            title: `${Number(pendingConcierge.delayed)} ${Number(pendingConcierge.delayed) === 1 ? 'conversa' : 'conversas'} sem resposta há +15 min`,
            helper: 'Concierge aguardando retorno',
            actionLabel: 'Responder',
            targetView: 'concierge',
          }]
        : []),
    ];
    const todayMetrics = [
      { label: 'Hóspedes hospedados', value: Number(activeStays.count), helper: Number(activeStays.count) === 0 ? 'Nenhuma estadia em andamento' : 'Estadias em andamento', actionLabel: 'Ver estadias', targetView: 'stays' },
      { label: 'Check-ins hoje', value: Number(checkIns.count), helper: Number(checkIns.count) === 0 ? 'Nenhum check-in previsto' : 'Entradas previstas para hoje', actionLabel: 'Ver check-ins', targetView: 'stays' },
      { label: 'Check-outs hoje', value: Number(checkOuts.count), helper: Number(checkOuts.count) === 0 ? 'Nenhum check-out previsto' : 'Saídas previstas para hoje', actionLabel: 'Ver check-outs', targetView: 'stays' },
    ];
    const attentionMetrics = [
      { label: 'Solicitações', value: Number(openRequests.count), helper: Number(openRequests.count) === 0 ? 'Nenhuma solicitação aberta' : 'abertas', detail: Number(overdueRequests.count) > 0 ? `${Number(overdueRequests.count)} ${Number(overdueRequests.count) === 1 ? 'atrasada' : 'atrasadas'}` : 'Nenhuma atrasada', tone: Number(overdueRequests.count) > 0 ? 'critical' : 'neutral', actionLabel: 'Ver solicitações', targetView: 'requests' },
      { label: 'Experiências pendentes', value: Number(pendingReservations.count), helper: Number(pendingReservations.count) === 0 ? 'Nenhuma experiência aguardando confirmação' : 'Aguardando confirmação', actionLabel: 'Ver experiências', targetView: 'reservations' },
      { label: 'Concierge pendente', value: Number(pendingConcierge.count), helper: Number(pendingConcierge.count) === 0 ? 'Tudo em dia. Nenhuma conversa pendente.' : Number(pendingConcierge.delayed) > 0 ? `${Number(pendingConcierge.delayed)} ${Number(pendingConcierge.delayed) === 1 ? 'conversa' : 'conversas'} há +15 min` : 'Conversas aguardando resposta', actionLabel: 'Ver concierge', targetView: 'concierge' },
    ];

    return {
      hotelId: session.hotelId,
      hotelName: hotel?.name ?? session.hotelId,
      metrics: [...todayMetrics, ...attentionMetrics],
      todayMetrics,
      attentionMetrics,
      alerts,
      pendingRequests,
      pendingExperiences,
      conciergeConversations,
      upcomingMovements: normalizedUpcomingMovements,
    };
  }
}
