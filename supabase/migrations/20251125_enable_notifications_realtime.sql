-- Enable realtime for notifications table
-- This allows real-time updates when notifications are created, updated, or deleted

-- Enable realtime on the notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Grant necessary permissions for realtime
GRANT SELECT ON notifications TO authenticated;
GRANT SELECT ON notifications TO anon;

-- Ensure RLS is enabled (it should be from previous migration)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add comment explaining realtime is enabled
COMMENT ON TABLE notifications IS 'Notifications table with realtime enabled for instant updates';
