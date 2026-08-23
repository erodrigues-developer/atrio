import { z } from 'zod';

export const experienceFormSchema = z.object({
  id: z.string().trim(),
  title: z.string().trim().min(1, 'Informe o título.'),
  description: z.string().trim().min(1, 'Informe a descrição.'),
  category: z.string().trim().min(1, 'Informe a categoria.'),
  timeLabel: z.string().trim().min(1),
  priceLabel: z.string().trim().min(1, 'Informe o preço.'),
  imageUrl: z.string().url('Informe uma URL de imagem válida.'),
  locationLabel: z.string().trim().min(1),
  included: z.string(),
  published: z.boolean(),
});

export const collectionFormSchema = z.object({
  id: z.string().trim(),
  title: z.string().trim().min(1, 'Informe o título.'),
  description: z.string().trim().min(1, 'Informe a descrição.'),
  imageUrl: z.union([z.literal(''), z.string().url('Informe uma URL de imagem válida.')]),
  featured: z.boolean(),
  published: z.boolean(),
});

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;
export type CollectionFormValues = z.infer<typeof collectionFormSchema>;
