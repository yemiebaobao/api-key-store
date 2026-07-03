-- ========================================
-- Supabase SQL Schema for API Key Store
-- 打开 https://supabase.com 注册后 ->
-- 创建项目 -> SQL Editor -> 粘贴执行
-- ========================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key 池（卖家放进去的 Key）
CREATE TABLE IF NOT EXISTS key_pool (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 已售出的 Key（记录归属）
CREATE TABLE IF NOT EXISTS assigned_keys (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_id TEXT REFERENCES key_pool(id) ON DELETE SET NULL,
  key TEXT NOT NULL,
  order_id TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引加快查询
CREATE INDEX IF NOT EXISTS idx_assigned_keys_user_id ON assigned_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_key_pool_status ON key_pool(status);
