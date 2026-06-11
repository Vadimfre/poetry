import { z } from 'zod';

export const commentSchema = z.object({
  text: z
    .string()
    .min(1, 'Комментарий не может быть пустым')
    .max(1000, 'Комментарий не может быть длиннее 1000 символов'),
});

export type CommentFormData = z.infer<typeof commentSchema>;
