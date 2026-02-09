import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const SUPABASE_URL = 'https://hmmruoankhohowlzajll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXJ1b2Fua2hvaG93bHphamxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5OTI2NzAsImV4cCI6MjA1NDU2ODY3MH0.sb_publishable_c7LCnNKtl3HgKdXjUWaunw_K4fts9ji';

// 创建 Supabase 客户端
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 导出配置
export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};

