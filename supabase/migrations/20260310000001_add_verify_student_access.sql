-- Migration to add RPC for verify_student_access replacing the silent fallback query

CREATE OR REPLACE FUNCTION verify_student_access(p_access_code text)
RETURNS TABLE (
  student_name text,
  access_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT sac.student_name, sac.access_code
  FROM student_access_codes sac
  WHERE sac.access_code = p_access_code
  LIMIT 1;
END;
$$;
