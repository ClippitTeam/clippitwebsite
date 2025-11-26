import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string
  created_at: string
}

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const digestType = url.searchParams.get('type') || 'daily'

    if (!['daily', 'weekly'].includes(digestType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid digest type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: users, error: usersError } = await supabase
      .rpc('get_users_for_digest', { p_digest_type: digestType })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users need digest emails', sent: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${digestType} digest for ${users.length} users`)

    let successCount = 0
    let failureCount = 0

    for (const user of users) {
      try {
        const { data: notifications, error: notifError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.user_id)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(50)

        if (notifError || !notifications || notifications.length === 0) {
          continue
        }

        const emailHtml = generateDigestEmail(
          user.user_name || user.user_email,
          digestType,
          notifications as Notification[]
        )

        const result = await sendDigestEmail(
          user.user_email,
          user.user_name || user.user_email,
          digestType,
          emailHtml
        )

        if (result.success) {
          await supabase
            .from('profiles')
            .update({ last_digest_sent_at: new Date().toISOString() })
            .eq('id', user.user_id)

          successCount++
          console.log(`✓ Sent ${digestType} digest to ${user.user_email}`)
        } else {
          failureCount++
          console.error(`✗ Failed: ${result.error}`)
        }
      } catch (error) {
        console.error(`Error processing ${user.user_email}:`, error)
        failureCount++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        digestType,
        processed: users.length,
        successful: successCount,
        failed: failureCount
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function generateDigestEmail(userName: string, digestType: string, notifications: Notification[]): string {
  const greeting = digestType === 'daily' ? 'Daily' : 'Weekly'
  const notificationHtml = notifications.map(notif => `
    <div style="background-color: #f8f9fa; border-left: 4px solid #40E0D0; padding: 15px; margin-bottom: 15px; border-radius: 4px;">
      <div style="display: flex; align-items: start; gap: 10px;">
        <span style="font-size: 24px;">${getNotificationIcon(notif.type)}</span>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px 0; color: #40E0D0; font-size: 16px;">${notif.title}</h3>
          <p style="margin: 0 0 8px 0; color: #555; font-size: 14px;">${notif.message}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #999; font-size: 12px;">${formatTimeAgo(notif.created_at)}</span>
            ${notif.link ? `<a href="https://clippit.online${notif.link}" style="color: #40E0D0; text-decoration: none; font-size: 14px; font-weight: 600;">View →</a>` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #40E0D0, #36B8A8); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🚀 Your ${greeting} Digest</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Hi ${userName}, here's what you missed!</p>
        </div>
        
        <div style="padding: 30px;">
            <div style="background: linear-gradient(135deg, rgba(64, 224, 208, 0.1), rgba(54, 184, 168, 0.1)); padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
                <h2 style="margin: 0 0 8px 0; color: #40E0D0; font-size: 32px;">${notifications.length}</h2>
                <p style="margin: 0; color: #666; font-size: 14px;">unread notification${notifications.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                ${notificationHtml}
            </div>
            
            <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                <a href="https://clippit.online/dashboard" style="display: inline-block; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-bottom: 15px;">View All Notifications</a>
                <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
                    <a href="https://clippit.online/dashboard#settings" style="color: #40E0D0; text-decoration: none;">Manage notification preferences</a>
                </p>
            </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666;">
            <p style="margin: 0 0 10px 0;">This ${digestType} digest was sent by Clippit Project Management System.</p>
            <p style="margin: 0;">© ${new Date().getFullYear()} Clippit. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `
}

async function sendDigestEmail(
  recipientEmail: string,
  recipientName: string,
  digestType: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!RESEND_API_KEY) {
      return { success: false, error: 'Email service not configured' }
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Clippit <notifications@clippit.online>',
        to: [recipientEmail],
        subject: `Your ${digestType === 'daily' ? 'Daily' : 'Weekly'} Clippit Digest`,
        html: html,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to send email'
    }
  }
}

function getNotificationIcon(type: string): string {
  const icons: { [key: string]: string } = {
    'mention': '💬',
    'assignment': '👤',
    'status_change': '🔄',
    'comment': '💭',
    'project_update': '📋',
    'invoice': '💰',
    'task_completed': '✅',
    'deadline': '⏰'
  }
  return icons[type] || '📢'
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return past.toLocaleDateString()
}
