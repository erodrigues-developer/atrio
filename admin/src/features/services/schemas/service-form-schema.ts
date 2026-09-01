import { z } from 'zod';

const serviceFormFieldSchema = z.object({
  kind: z.enum(['quantity', 'note']),
  label: z.string().trim().min(1, 'Informe o rótulo exibido ao hóspede.'),
  required: z.boolean(),
});

export const serviceFormSchema = z.object({
  id: z.string().trim(),
  title: z.string().trim().min(1, 'Informe o título.'),
  description: z.string().trim().min(1, 'Informe a descrição.'),
  icon: z.string().trim().min(1, 'Informe o ícone.'),
  fulfillmentType: z.string().trim().min(1, 'Informe o tipo de atendimento.'),
  fields: z.array(serviceFormFieldSchema).max(2, 'Adicione no máximo os dois campos disponíveis no app.'),
  published: z.boolean(),
}).superRefine((values, context) => {
  const usedKinds = new Set<string>();
  values.fields.forEach((field, index) => {
    if (usedKinds.has(field.kind)) {
      context.addIssue({
        code: 'custom',
        message: 'Este campo já foi adicionado ao formulário.',
        path: ['fields', index, 'kind'],
      });
    }
    usedKinds.add(field.kind);
  });
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
