// 简单的数据库连接测试
// 在浏览器控制台中运行此代码

// 1. 测试直接 fetch
fetch('https://hmmruoankhohowlzajll.supabase.co/rest/v1/hotels?select=*&limit=5', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXJ1b2Fua2hvaG93bHphamxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjQxNjgsImV4cCI6MjA4NjEwMDE2OH0.nGVgFlrTPQh86Ba0doT_mmeHvCnF0NjJ6MUJEvQKV3g',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbXJ1b2Fua2hvaG93bHphamxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjQxNjgsImV4cCI6MjA4NjEwMDE2OH0.nGVgFlrTPQh86Ba0doT_mmeHvCnF0NjJ6MUJEvQKV3g'
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ 成功获取数据:', data);
  console.log('酒店数量:', data.length);
})
.catch(err => {
  console.error('❌ 获取失败:', err);
});





