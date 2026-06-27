-- Prevent DELETE on audit_logs (append-only)
CREATE OR REPLACE FUNCTION prevent_audit_delete() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are append-only and cannot be deleted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS no_delete_audit ON audit_logs;
CREATE TRIGGER no_delete_audit BEFORE DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_delete();

-- Prevent UPDATE on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS no_update_audit ON audit_logs;
CREATE TRIGGER no_update_audit BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_update();
