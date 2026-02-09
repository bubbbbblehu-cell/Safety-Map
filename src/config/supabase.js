import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const SUPABASE_URL = 'https://hmmruoankhohowlzajll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXJ1b2Fua2hvaG93bHphamxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjQxNjgsImV4cCI6MjA4NjEwMDE2OH0.nGVgFlrTPQh86Ba0doT_mmeHvCnF0NjJ6MUJEvQKV3g';

// 创建 Supabase 客户端
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 测试连接
console.log('Supabase 客户端已初始化');
console.log('数据库 URL:', SUPABASE_URL);

// 导出配置
export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};

