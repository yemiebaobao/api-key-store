CREATE TABLE IF NOT EXISTS battery_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  plan TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration_hours INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','expired','rejected')),
  order_ref TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE battery_purchases DISABLE ROW LEVEL SECURITY;
