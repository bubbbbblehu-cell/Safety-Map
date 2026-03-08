@echo off
cd /d "%~dp0server"
(
echo SUPABASE_URL=https://hmmruoankhohowlzajll.supabase.co
echo SUPABASE_ANON_KEY=your_supabase_anon_key_here
echo DASHSCOPE_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
echo DASHSCOPE_API_KEY=sk-83a34f650e484b03a17710d87b28a725
echo PORT=3001
) > .env
echo ✅ .env文件已创建
echo.
echo 现在可以启动服务器了：
echo   npm install
echo   npm start
pause
















