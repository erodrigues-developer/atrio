import { z } from 'zod';

export const reservationFormSchema = z.object({
  stayId: z.string().trim().min(1, 'Selecione uma estadia.'),
  experienceId: z.string().trim().min(1, 'Selecione uma experiência.'),
  slotId: z.string().trim().min(1, 'Selecione um horário.'),
  guestNote: z.string().trim().max(500, 'A observação deve ter no máximo 500 caracteres.'),
});

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;
