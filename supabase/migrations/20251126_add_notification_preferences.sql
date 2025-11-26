-- =====================================================
-- NOTIFICATION PREFERENCES & EMAIL SYSTEM
-- =====================================================
-- Add notification preferences to profiles table
-- =====================================================

-- Add notification preferences columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT jsonb_build_object(
    'email_enabled', true,
    'email_immediate', true,
    'email_digest', 'weekly',
    'email_mentions', true,
    'email_project_updates', true,
    'email_assignments', true,
    'email_comments', true,
    'email_status_changes', true,
    'push_enabled', true,
    'digest_day', 'monday',
    'digest_time', '09:00'
);

-- Add email tracking columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_digest_sent_at TIMESTAMPTZ;

-- Update existing profiles with default preferences
UPDATE public.profiles
SET notification_preferences = jsonb_build_object(
    'email_enabled', true,
    'email_immediate', true,
    'email_digest', 'weekly',
    'email_mentions', true,
    'email_project_updates', true,
    'email_assignments', true,
    'email_comments', true,
    'email_status_changes', true,
    'push_enabled', true,
    'digest_day', 'monday',
    'digest_time', '09:00'
)
WHERE notification_preferences IS NULL;

-- Add email queue table for reliable delivery
CREATE TABLE IF NOT EXISTS public.email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipient
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    
    -- Email details
    email_type TEXT NOT NULL CHECK (email_type IN (
        'notification', 'digest', 'mention', 'assignment', 
        'status_change', 'comment', 'invoice', 'password_reset'
    )),
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    
    -- Related notification (if applicable)
    notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
    
    -- Delivery tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_attempt_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for email queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON public.email_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_recipient ON public.email_queue(recipient_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_type ON public.email_queue(email_type);
CREATE INDEX IF NOT EXISTS idx_email_queue_notification ON public.email_queue(notification_id);

-- Enable RLS on email_queue
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Email queue policies (only system/admins can manage)
CREATE POLICY "Admins can view all email queue"
    ON public.email_queue FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can insert into email queue"
    ON public.email_queue FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "System can update email queue"
    ON public.email_queue FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- FUNCTIONS FOR EMAIL NOTIFICATIONS
-- =====================================================

-- Function to check if user wants email for notification type
CREATE OR REPLACE FUNCTION should_send_email_notification(
    p_user_id UUID,
    p_notification_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_prefs JSONB;
    v_email_enabled BOOLEAN;
    v_immediate BOOLEAN;
    v_type_enabled BOOLEAN;
BEGIN
    -- Get user preferences
    SELECT notification_preferences INTO v_prefs
    FROM public.profiles
    WHERE id = p_user_id;
    
    -- Default to false if no preferences
    IF v_prefs IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if email is enabled
    v_email_enabled := COALESCE((v_prefs->>'email_enabled')::boolean, true);
    v_immediate := COALESCE((v_prefs->>'email_immediate')::boolean, true);
    
    IF NOT v_email_enabled OR NOT v_immediate THEN
        RETURN false;
    END IF;
    
    -- Check type-specific preference
    v_type_enabled := CASE p_notification_type
        WHEN 'mention' THEN COALESCE((v_prefs->>'email_mentions')::boolean, true)
        WHEN 'assignment' THEN COALESCE((v_prefs->>'email_assignments')::boolean, true)
        WHEN 'comment' THEN COALESCE((v_prefs->>'email_comments')::boolean, true)
        WHEN 'status_change' THEN COALESCE((v_prefs->>'email_status_changes')::boolean, true)
        WHEN 'project_update' THEN COALESCE((v_prefs->>'email_project_updates')::boolean, true)
        ELSE true
    END;
    
    RETURN v_type_enabled;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue notification email
CREATE OR REPLACE FUNCTION queue_notification_email()
RETURNS TRIGGER AS $$
DECLARE
    v_profile RECORD;
    v_should_send BOOLEAN;
BEGIN
    -- Get recipient profile
    SELECT p.*, u.email
    INTO v_profile
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.id = NEW.user_id;
    
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Check if user wants email for this notification type
    v_should_send := should_send_email_notification(NEW.user_id, NEW.type);
    
    IF NOT v_should_send THEN
        RETURN NEW;
    END IF;
    
    -- Queue email
    INSERT INTO public.email_queue (
        recipient_id,
        recipient_email,
        recipient_name,
        email_type,
        subject,
        html_body,
        notification_id
    ) VALUES (
        NEW.user_id,
        v_profile.email,
        v_profile.full_name,
        NEW.type,
        NEW.title,
        format_notification_email(NEW),
        NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to format notification as email HTML
CREATE OR REPLACE FUNCTION format_notification_email(p_notification public.notifications)
RETURNS TEXT AS $$
DECLARE
    v_html TEXT;
BEGIN
    v_html := format($html$
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #40E0D0, #36B8A8); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .notification-box { background-color: #f8f9fa; border-left: 4px solid #40E0D0; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .notification-title { font-size: 18px; font-weight: 600; color: #40E0D0; margin-bottom: 10px; }
        .notification-message { color: #555; font-size: 16px; margin-bottom: 15px; }
        .button { display: inline-block; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827 !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 15px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .footer a { color: #40E0D0; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Clippit Notification</h1>
        </div>
        <div class="content">
            <div class="notification-box">
                <div class="notification-title">%s</div>
                <div class="notification-message">%s</div>
                <a href="https://clippit.online%s" class="button">View Details</a>
            </div>
        </div>
        <div class="footer">
            <p>This email was sent by Clippit Project Management System.</p>
            <p><a href="https://clippit.online/dashboard#settings">Manage notification preferences</a></p>
        </div>
    </div>
</body>
</html>
$html$,
        p_notification.title,
        p_notification.message,
        COALESCE(p_notification.link, '/dashboard')
    );
    
    RETURN v_html;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to queue email when notification is created
CREATE TRIGGER trigger_queue_notification_email
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION queue_notification_email();

-- Function to get users for digest emails
CREATE OR REPLACE FUNCTION get_users_for_digest(p_digest_type TEXT)
RETURNS TABLE (
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        u.email,
        p.full_name,
        COUNT(n.id) as unread_count
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    LEFT JOIN public.notifications n ON n.user_id = p.id AND n.read = false
    WHERE 
        (p.notification_preferences->>'email_enabled')::boolean = true
        AND (p.notification_preferences->>'email_digest') = p_digest_type
        AND (
            p_digest_type = 'daily' 
            OR (
                p_digest_type = 'weekly' 
                AND LOWER(p.notification_preferences->>'digest_day') = LOWER(to_char(CURRENT_DATE, 'Day'))
            )
        )
    GROUP BY p.id, u.email, p.full_name
    HAVING COUNT(n.id) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION should_send_email_notification(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_for_digest(TEXT) TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.email_queue TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.email_queue IS 'Queue for outgoing notification emails';
COMMENT ON COLUMN public.profiles.notification_preferences IS 'User email and notification preferences';
COMMENT ON FUNCTION should_send_email_notification(UUID, TEXT) IS 'Check if user wants email for notification type';
COMMENT ON FUNCTION get_users_for_digest(TEXT) IS 'Get users who should receive digest emails';
