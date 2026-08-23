import { z } from 'zod';

export const stayFormSchema = z.object({
  useNewGuest: z.boolean(),
  guestId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  roomNumber: z.string().trim().min(1, 'Informe o quarto.'),
  checkInDate: z.string().min(1, 'Informe a data de check-in.'),
  checkOutDate: z.string().min(1, 'Informe a data de check-out.'),
  checkOutTime: z.string().min(1, 'Informe o horário de saída.'),
  consumptionView: z.enum(['ready', 'empty', 'unavailable']),
}).superRefine((data, context) => {
  if (data.checkOutDate < data.checkInDate) {
    context.addIssue({ code: 'custom', path: ['checkOutDate'], message: 'O check-out deve ocorrer após o check-in.' });
  }

  if (data.useNewGuest) {
    if (!data.firstName.trim()) context.addIssue({ code: 'custom', path: ['firstName'], message: 'Informe o nome.' });
    if (!data.lastName.trim()) context.addIssue({ code: 'custom', path: ['lastName'], message: 'Informe o sobrenome.' });
    if (!data.phoneNumber.trim()) context.addIssue({ code: 'custom', path: ['phoneNumber'], message: 'Informe o telefone.' });
  } else if (!data.guestId) {
    context.addIssue({ code: 'custom', path: ['guestId'], message: 'Selecione um hóspede.' });
  }
});

export type StayFormValues = z.infer<typeof stayFormSchema>;
