-- =====================================================
-- ACTIVITY FEED & COMMENTS SYSTEM
-- =====================================================
-- This migration creates tables for:
-- 1. Comments on projects, tickets, and tasks
-- 2. Activity timeline for tracking all changes
-- 3. @mentions for team notifications
-- =====================================================

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What this comment is attached to
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'ticket', 'task', 'invoice')),
    entity_id UUID NOT NULL,
    
    -- Comment content
    content TEXT NOT NULL,
    
    -- Parent comment for threaded replies
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    
    -- Author
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL, -- Cached for performance
    
    -- Mentions
    mentions JSONB DEFAULT '[]'::jsonb, -- Array of user IDs mentioned
    
    -- Metadata
    edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.comments(created_at DESC);

-- =====================================================
-- ACTIVITY LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What entity this activity is for
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'ticket', 'task', 'invoice', 'attachment', 'comment')),
    entity_id UUID NOT NULL,
    
    -- Activity details
    action TEXT NOT NULL, -- e.g., 'created', 'updated', 'assigned', 'status_changed', 'commented', 'attached_file'
    description TEXT NOT NULL, -- Human-readable description
    
    -- Who performed the action
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL, -- Cached for performance
    
    -- Change details (for updates)
    changes JSONB, -- Stores before/after values for updates
    
    -- Related entities (for complex actions)
    related_entity_type TEXT,
    related_entity_id UUID,
    
    -- Metadata
    metadata JSONB, -- Additional contextual information
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_activity_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_action ON public.activity_log(action);

-- =====================================================
-- MENTIONS TABLE (for tracking @mentions)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Comment that contains the mention
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    
    -- User being mentioned
    mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Entity context
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Notification tracking
    notification_sent BOOLEAN DEFAULT false,
    notification_read BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at TIMESTAMPTZ
);

-- Indexes for mentions
CREATE INDEX IF NOT EXISTS idx_mentions_comment ON public.mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_mentions_user ON public.mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_entity ON public.mentions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_mentions_unread ON public.mentions(mentioned_user_id, notification_read) WHERE notification_read = false;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COMMENTS POLICIES
-- =====================================================

-- View comments: authenticated users can see comments on entities they have access to
CREATE POLICY "Users can view comments on accessible entities"
    ON public.comments FOR SELECT
    TO authenticated
    USING (
        -- Admin can see all
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
        OR
        -- Staff can see all
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'staff'
        )
        OR
        -- Customers can see comments on their projects/tickets/tasks
        (
            entity_type = 'project' AND
            EXISTS (
                SELECT 1 FROM public.projects
                WHERE id = entity_id AND customer_id = auth.uid()
            )
        )
        OR
        (
            entity_type = 'ticket' AND
            EXISTS (
                SELECT 1 FROM public.tickets
                WHERE id = entity_id AND customer_id = auth.uid()
            )
        )
        OR
        (
            entity_type = 'task' AND
            EXISTS (
                SELECT 1 FROM public.tasks t
                JOIN public.tickets tk ON t.ticket_id = tk.id
                WHERE t.id = entity_id AND tk.customer_id = auth.uid()
            )
        )
    );

-- Create comments: authenticated users can create comments on entities they have access to
CREATE POLICY "Users can create comments on accessible entities"
    ON public.comments FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid()
        AND
        (
            -- Admin can comment on anything
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            )
            OR
            -- Staff can comment on anything
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'staff'
            )
            OR
            -- Customers can comment on their projects/tickets/tasks
            (
                entity_type = 'project' AND
                EXISTS (
                    SELECT 1 FROM public.projects
                    WHERE id = entity_id AND customer_id = auth.uid()
                )
            )
            OR
            (
                entity_type = 'ticket' AND
                EXISTS (
                    SELECT 1 FROM public.tickets
                    WHERE id = entity_id AND customer_id = auth.uid()
                )
            )
            OR
            (
                entity_type = 'task' AND
                EXISTS (
                    SELECT 1 FROM public.tasks t
                    JOIN public.tickets tk ON t.ticket_id = tk.id
                    WHERE t.id = entity_id AND tk.customer_id = auth.uid()
                )
            )
        )
    );

-- Update comments: users can only update their own comments
CREATE POLICY "Users can update their own comments"
    ON public.comments FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

-- Delete comments: users can delete their own comments, admins can delete any
CREATE POLICY "Users can delete own comments, admins can delete any"
    ON public.comments FOR DELETE
    TO authenticated
    USING (
        author_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- ACTIVITY LOG POLICIES
-- =====================================================

-- View activity: authenticated users can see activity for entities they have access to
CREATE POLICY "Users can view activity on accessible entities"
    ON public.activity_log FOR SELECT
    TO authenticated
    USING (
        -- Admin can see all
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
        OR
        -- Staff can see all
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'staff'
        )
        OR
        -- Customers can see activity on their projects/tickets/tasks
        (
            entity_type = 'project' AND
            EXISTS (
                SELECT 1 FROM public.projects
                WHERE id = entity_id AND customer_id = auth.uid()
            )
        )
        OR
        (
            entity_type = 'ticket' AND
            EXISTS (
                SELECT 1 FROM public.tickets
                WHERE id = entity_id AND customer_id = auth.uid()
            )
        )
        OR
        (
            entity_type = 'task' AND
            EXISTS (
                SELECT 1 FROM public.tasks t
                JOIN public.tickets tk ON t.ticket_id = tk.id
                WHERE t.id = entity_id AND tk.customer_id = auth.uid()
            )
        )
    );

-- Create activity: only authenticated users can create activity logs
CREATE POLICY "Authenticated users can create activity logs"
    ON public.activity_log FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- No updates or deletes on activity log (immutable audit trail)

-- =====================================================
-- MENTIONS POLICIES
-- =====================================================

-- View mentions: users can see mentions where they are mentioned
CREATE POLICY "Users can view their own mentions"
    ON public.mentions FOR SELECT
    TO authenticated
    USING (
        mentioned_user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- Create mentions: authenticated users can create mentions
CREATE POLICY "Authenticated users can create mentions"
    ON public.mentions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Update mentions: users can update their own mention read status
CREATE POLICY "Users can update their own mention read status"
    ON public.mentions FOR UPDATE
    TO authenticated
    USING (mentioned_user_id = auth.uid())
    WITH CHECK (mentioned_user_id = auth.uid());

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically log comment creation as activity
CREATE OR REPLACE FUNCTION log_comment_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.activity_log (
        entity_type,
        entity_id,
        action,
        description,
        user_id,
        user_name,
        related_entity_type,
        related_entity_id
    ) VALUES (
        NEW.entity_type,
        NEW.entity_id,
        'commented',
        'Added a comment',
        NEW.author_id,
        NEW.author_name,
        'comment',
        NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log comment creation
CREATE TRIGGER trigger_log_comment_activity
    AFTER INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION log_comment_activity();

-- Function to process mentions and create notifications
CREATE OR REPLACE FUNCTION process_comment_mentions()
RETURNS TRIGGER AS $$
DECLARE
    mention_user_id UUID;
    mention_record JSONB;
BEGIN
    -- Process each mention in the mentions array
    FOR mention_record IN SELECT * FROM jsonb_array_elements(NEW.mentions)
    LOOP
        mention_user_id := (mention_record->>'userId')::UUID;
        
        -- Create mention record
        INSERT INTO public.mentions (
            comment_id,
            mentioned_user_id,
            entity_type,
            entity_id
        ) VALUES (
            NEW.id,
            mention_user_id,
            NEW.entity_type,
            NEW.entity_id
        );
        
        -- Create notification for the mentioned user
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            link,
            metadata
        ) VALUES (
            mention_user_id,
            'mention',
            'You were mentioned',
            NEW.author_name || ' mentioned you in a comment',
            '/dashboard#' || NEW.entity_type || '-' || NEW.entity_id,
            jsonb_build_object(
                'comment_id', NEW.id,
                'entity_type', NEW.entity_type,
                'entity_id', NEW.entity_id,
                'author_id', NEW.author_id,
                'author_name', NEW.author_name
            )
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to process mentions when comment is created
CREATE TRIGGER trigger_process_mentions
    AFTER INSERT ON public.comments
    FOR EACH ROW
    WHEN (NEW.mentions IS NOT NULL AND jsonb_array_length(NEW.mentions) > 0)
    EXECUTE FUNCTION process_comment_mentions();

-- Function to update comment timestamps
CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    IF NEW.content != OLD.content THEN
        NEW.edited = true;
        NEW.edited_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update comment timestamps
CREATE TRIGGER trigger_update_comment_timestamp
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_timestamp();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get comment count for an entity
CREATE OR REPLACE FUNCTION get_comment_count(
    p_entity_type TEXT,
    p_entity_id UUID
)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.comments
        WHERE entity_type = p_entity_type
        AND entity_id = p_entity_id
        AND parent_id IS NULL -- Only count top-level comments
    )::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent activity for an entity
CREATE OR REPLACE FUNCTION get_entity_activity(
    p_entity_type TEXT,
    p_entity_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    action TEXT,
    description TEXT,
    user_name TEXT,
    changes JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.action,
        a.description,
        a.user_name,
        a.changes,
        a.created_at
    FROM public.activity_log a
    WHERE a.entity_type = p_entity_type
    AND a.entity_id = p_entity_id
    ORDER BY a.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.mentions TO authenticated;

-- Grant usage on functions
GRANT EXECUTE ON FUNCTION get_comment_count(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_entity_activity(TEXT, UUID, INTEGER) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.comments IS 'Comments on projects, tickets, tasks, and invoices';
COMMENT ON TABLE public.activity_log IS 'Activity timeline for tracking all changes';
COMMENT ON TABLE public.mentions IS 'Tracks @mentions in comments';
COMMENT ON FUNCTION get_comment_count(TEXT, UUID) IS 'Returns the number of top-level comments for an entity';
COMMENT ON FUNCTION get_entity_activity(TEXT, UUID, INTEGER) IS 'Returns recent activity for an entity';
