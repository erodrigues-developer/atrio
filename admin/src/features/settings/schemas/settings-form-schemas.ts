import { z } from 'zod';

export const wifiFormSchema = z.object({
  wifiNetwork: z.string().trim().min(1, 'Informe o nome da rede.'),
  wifiPassword: z.string().min(1, 'Informe a senha da rede.'),
});

export const operationHoursFormSchema = z.object({
  checkInTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe um horário válido.'),
  checkOutTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe um horário válido.'),
});

export const usefulInfoFormSchema = z.object({
  scope: z.enum(['dashboard', 'stay']),
  title: z.string().trim().min(1, 'Informe o título.'),
  description: z.string().trim().min(1, 'Informe a descrição.'),
});

export type WifiFormValues = z.infer<typeof wifiFormSchema>;
export type OperationHoursFormValues = z.infer<typeof operationHoursFormSchema>;
export type UsefulInfoFormValues = z.infer<typeof usefulInfoFormSchema>;
