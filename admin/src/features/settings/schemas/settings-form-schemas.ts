import { z } from 'zod';

export const wifiFormSchema = z.object({
  wifiNetwork: z.string().trim().min(1, 'Informe o nome da rede.'),
  wifiPassword: z.string().min(1, 'Informe a senha da rede.'),
});

export const usefulInfoFormSchema = z.object({
  scope: z.enum(['dashboard', 'stay']),
  title: z.string().trim().min(1, 'Informe o título.'),
  description: z.string().trim().min(1, 'Informe a descrição.'),
});

export type WifiFormValues = z.infer<typeof wifiFormSchema>;
export type UsefulInfoFormValues = z.infer<typeof usefulInfoFormSchema>;
