import { z } from 'zod';

export const serviceFormSchema = z.object({
  id: z.string().trim(),
  title: z.string().trim().min(1, 'Informe o título.'),
  description: z.string().trim().min(1, 'Informe a descrição.'),
  icon: z.string().trim().min(1, 'Informe o ícone.'),
  fulfillmentType: z.string().trim().min(1, 'Informe o tipo de atendimento.'),
  fieldName: z.string().trim().min(1, 'Informe o nome do campo.'),
  fieldLabel: z.string().trim().min(1, 'Informe o label do campo.'),
  fieldType: z.enum(['string', 'number']),
  fieldRequired: z.boolean(),
  published: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
