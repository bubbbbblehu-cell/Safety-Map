# 修复城市切换功能的 PowerShell 脚本

$filePath = "d:/Safety-Map/index.html"
$content = Get-Content $filePath -Raw -Encoding UTF8

# 修复 selectCity 函数
$oldPattern = @"
            setTimeout\(\(\) => \{
                console\.log\('切换到地图页面，当前城市:', currentCity\);
                // 只调用 switchPage，它会自动调用 initMap
                switchPage\('mapPage'\);
            \}, 100\);
"@

$newCode = @"
            // 检查是否已经在地图页面
            if (currentPage !== 'mapPage') {
                // 不在地图页面，切换过去
                setTimeout(() => {
                    console.log('切换到地图页面');
                    switchPage('mapPage');
                }, 100);
            } else {
                // 已经在地图页面，直接重新初始化地图
                setTimeout(() => {
                    console.log('🔄 重新初始化地图，城市:', currentCity.name);
                    initMap(currentCity.id);
                    updateStats();
                }, 100);
            }
"@

$content = $content -replace [regex]::Escape($oldPattern), $newCode

# 保存文件
$content | Set-Content $filePath -Encoding UTF8 -NoNewline

Write-Host "✅ 修复完成！" -ForegroundColor Green
Write-Host "请刷新浏览器测试城市切换功能" -ForegroundColor Yellow

