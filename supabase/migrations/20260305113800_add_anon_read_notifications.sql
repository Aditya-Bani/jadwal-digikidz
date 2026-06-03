-- Allow public read access to admin_notifications so the Parent Portal can see announcements
CREATE POLICY "Enable read access for all users" ON "public"."admin_notifications"
AS PERMISSIVE FOR SELECT
TO public
USING (true);
