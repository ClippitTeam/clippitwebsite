import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvoiceEmailRequest {
  invoiceId: string
  emailType?: 'initial' | 'reminder' | 'overdue' | 'thank_you'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user making the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only admins can send invoices')
    }

    const { invoiceId, emailType = 'initial' }: InvoiceEmailRequest = await req.json()

    // Get invoice details with client info
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        client:profiles!client_id(id, email, full_name, company),
        project:projects(name),
        line_items:invoice_line_items(*)
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found')
    }

    if (!invoice.client?.email) {
      throw new Error('Client email not found')
    }

    // Format email based on type
    let subject = ''
    let emailBody = ''

    const clientName = invoice.client.full_name || invoice.client.company || 'Valued Client'
    const dueDate = new Date(invoice.due_date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const formattedTotal = `$${parseFloat(invoice.total_amount).toFixed(2)}`

    switch (emailType) {
      case 'initial':
        subject = `Invoice ${invoice.invoice_number} from Clippit`
        emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #40E0D0, #36B8A8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #111827; margin: 0; font-size: 28px;">New Invoice</h1>
              <p style="color: #1F2937; margin: 10px 0 0 0; font-size: 16px;">Invoice ${invoice.invoice_number}</p>
            </div>
            
            <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #111827; font-size: 16px; margin-bottom: 20px;">Hi ${clientName},</p>
              
              <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
                Thank you for your business! Please find your invoice details below:
              </p>
              
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Invoice Number:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${invoice.invoice_number}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Issue Date:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${new Date(invoice.issue_date).toLocaleDateString('en-AU')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Due Date:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${dueDate}</td>
                  </tr>
                  ${invoice.project ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Project:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${invoice.project.name}</td>
                  </tr>
                  ` : ''}
                  <tr style="border-top: 2px solid #e5e7eb;">
                    <td style="padding: 15px 0 8px 0; color: #111827; font-size: 18px; font-weight: 700;">Total Amount:</td>
                    <td style="padding: 15px 0 8px 0; color: #40E0D0; font-size: 24px; font-weight: 800; text-align: right;">${formattedTotal}</td>
                  </tr>
                </table>
              </div>
              
              ${invoice.notes ? `
              <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                <p style="color: #92400E; font-size: 14px; margin: 0; font-weight: 600;">Note:</p>
                <p style="color: #78350F; font-size: 14px; margin: 8px 0 0 0; line-height: 1.6;">${invoice.notes}</p>
              </div>
              ` : ''}
              
              ${invoice.payment_instructions ? `
              <div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
                <p style="color: #1E40AF; font-size: 14px; margin: 0; font-weight: 600;">Payment Instructions:</p>
                <p style="color: #1E3A8A; font-size: 14px; margin: 8px 0 0 0; line-height: 1.6; white-space: pre-line;">${invoice.payment_instructions}</p>
              </div>
              ` : ''}
              
              <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin-top: 20px;">
                If you have any questions about this invoice, please don't hesitate to contact us.
              </p>
              
              <p style="color: #111827; font-size: 14px; margin-top: 30px;">
                Best regards,<br>
                <strong>Clippit Team</strong>
              </p>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #9CA3AF; font-size: 12px;">
              <p style="margin: 0;">This is an automated message from Clippit</p>
            </div>
          </div>
        `
        break

      case 'reminder':
        subject = `Payment Reminder: Invoice ${invoice.invoice_number}`
        emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #111827; margin: 0; font-size: 28px;">Payment Reminder</h1>
              <p style="color: #1F2937; margin: 10px 0 0 0; font-size: 16px;">Invoice ${invoice.invoice_number}</p>
            </div>
            
            <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #111827; font-size: 16px; margin-bottom: 20px;">Hi ${clientName},</p>
              
              <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
                This is a friendly reminder that invoice <strong>${invoice.invoice_number}</strong> is due on <strong>${dueDate}</strong>.
              </p>
              
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Amount Due:</td>
                    <td style="padding: 8px 0; color: #F59E0B; font-size: 24px; font-weight: 800; text-align: right;">${formattedTotal}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Due Date:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${dueDate}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
                If you've already sent payment, please disregard this reminder. If you have any questions or need to discuss payment arrangements, please reach out to us.
              </p>
              
              <p style="color: #111827; font-size: 14px; margin-top: 30px;">
                Thank you,<br>
                <strong>Clippit Team</strong>
              </p>
            </div>
          </div>
        `
        break

      case 'overdue':
        subject = `OVERDUE: Invoice ${invoice.invoice_number}`
        emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #EF4444, #DC2626); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Payment Overdue</h1>
              <p style="color: #FEE2E2; margin: 10px 0 0 0; font-size: 16px;">Invoice ${invoice.invoice_number}</p>
            </div>
            
            <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #111827; font-size: 16px; margin-bottom: 20px;">Hi ${clientName},</p>
              
              <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
                This is an important notice that invoice <strong>${invoice.invoice_number}</strong> is now overdue. The payment was due on <strong>${dueDate}</strong>.
              </p>
              
              <div style="background: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #991B1B; font-size: 14px; font-weight: 600;">Overdue Amount:</td>
                    <td style="padding: 8px 0; color: #DC2626; font-size: 24px; font-weight: 800; text-align: right;">${formattedTotal}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
                Please arrange payment as soon as possible. If there are any issues or you need to discuss payment options, please contact us immediately.
              </p>
              
              <p style="color: #111827; font-size: 14px; margin-top: 30px;">
                Thank you,<br>
                <strong>Clippit Team</strong>
              </p>
            </div>
          </div>
        `
        break

      case 'thank_you':
        subject = `Payment Received - Invoice ${invoice.invoice_number}`
        emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Payment Received!</h1>
              <p style="color: #D1FAE5; margin: 10px 0 0 0; font-size: 16px;">Invoice ${invoice.invoice_number}</p>
            </div>
            
            <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #111827; font-size: 16px; margin-bottom: 20px;">Hi ${clientName},</p>
              
              <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
                Thank you! We've received your payment for invoice <strong>${invoice.invoice_number}</strong>.
              </p>
              
              <div style="background: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #065F46; font-size: 14px;">Amount Paid:</td>
                    <td style="padding: 8px 0; color: #059669; font-size: 24px; font-weight: 800; text-align: right;">${formattedTotal}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #065F46; font-size: 14px;">Status:</td>
                    <td style="padding: 8px 0; color: #059669; font-size: 16px; font-weight: 600; text-align: right;">PAID</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
                We appreciate your prompt payment and look forward to continuing to work with you.
              </p>
              
              <p style="color: #111827; font-size: 14px; margin-top: 30px;">
                Best regards,<br>
                <strong>Clippit Team</strong>
              </p>
            </div>
          </div>
        `
        break
    }

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Clippit <invoices@clippit.ai>',
        to: [invoice.client.email],
        subject: subject,
        html: emailBody,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    const emailResult = await res.json()

    // Update invoice status and log email
    const updates: any = {
      sent_to_email: invoice.client.email,
    }

    if (emailType === 'initial') {
      updates.status = 'sent'
      updates.sent_at = new Date().toISOString()
    } else if (emailType === 'reminder' || emailType === 'overdue') {
      updates.last_reminder_sent_at = new Date().toISOString()
      updates.reminder_count = (invoice.reminder_count || 0) + 1
    }

    await supabaseClient
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)

    // Log the email
    await supabaseClient.from('invoice_emails').insert({
      invoice_id: invoiceId,
      email_type: emailType,
      sent_to: invoice.client.email,
      sent_by: user.id,
      subject: subject,
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invoice email sent successfully',
        emailId: emailResult.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending invoice:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
