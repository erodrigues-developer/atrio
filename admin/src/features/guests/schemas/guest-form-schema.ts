import { z } from 'zod';

export const guestFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Informe o nome.'),
  lastName: z.string().trim().min(1, 'Informe o sobrenome.'),
  phoneNumber: z.string().trim().min(8, 'Informe um telefone válido.'),
});

export type GuestFormValues = z.infer<typeof guestFormSchema>;
