import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Escribe tu nombre').max(100),
  email: z.string().trim().email('Correo no válido').max(255),
  subject: z.string().trim().max(150),
  message: z.string().trim().min(1, 'Escribe tu mensaje').max(2000),
})

export const submitContact = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const { storeContactSubmission } = await import('./contact.server')
    return storeContactSubmission({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
    })
  })
