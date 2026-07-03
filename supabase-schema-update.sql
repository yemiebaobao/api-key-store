ALTER TABLE pending_payments DROP CONSTRAINT IF EXISTS pending_payments_status_check;
ALTER TABLE pending_payments ADD CONSTRAINT pending_payments_status_check 
  CHECK (status IN ('pending','paid_by_user','confirmed','rejected'));