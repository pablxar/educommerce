import { sendTemplateEmail } from '@/lib/email-templates/send-email'

export interface ContactInput {
  name: string
  email: string
  subject: string | null
  message: string
}

/**
 * Stores a contact submission and notifies the owner by email.
 * Server-only: uses the service role for the insert.
 */
export async function storeContactSubmission(input: ContactInput): Promise<{ id: string }> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const { data, error } = await supabaseAdmin
    .from('contact_submissions')
    .insert({
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    })
    .select('id')
    .single()
  if (error || !data) throw new Error('No pudimos guardar tu mensaje.')
  const { syncSiteActivity } = await import('./site-activity.server')
  await syncSiteActivity().catch(() => console.warn('[contact-sync] pending activity retained'))

  // Owner notification — fixed recipient and template, defined server-side.
  // A failed send (e.g. domain still verifying) must not lose the submission.
  try {
    await sendTemplateEmail('contact-notification', 'educommerce.admin@gmail.com', {
      templateData: {
        name: input.name,
        email: input.email,
        subject: input.subject ?? undefined,
        message: input.message,
      },
      idempotencyKey: `contact-notification-${data.id}`,
    })
  } catch (error) {
    console.error('Contact notification email failed:', error)
  }

  return { id: data.id }
}
