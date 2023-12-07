import * as z from 'zod';

export const flickValidation = z.object({
    flick: z.string().min(1, { message: 'This field is required' }).min(3, { message: 'Minimum of 3 characters' }),
    accountId: z.string()
})

export const commentValidation = z.object({
    flick: z.string().min(1, { message: 'This field is required' }).min(3, { message: 'Minimum of 3 characters' }),
})