# LegacyBridge One-Command Launch Script (Windows PowerShell)
# HackIIITD 2026 - Team Aspirations

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   LegacyBridge: Describe the task. Keep the old system. " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Demo Legacy ERP Portal (Port 8080)
Write-Host "`n[1/2] Starting Acme Inventory v4.2 Demo ERP on http://localhost:8080..." -ForegroundColor Yellow
$erpProcess = Start-Process python -ArgumentList "-m http.server 8080 --directory demo-portal" -PassThru -WindowStyle Hidden

# 2. Start Unified Next.js Application (Port 3000)
Write-Host "[2/2] Starting LegacyBridge Next.js Application on http://localhost:3000..." -ForegroundColor Green
Write-Host "`nOpen your browser at:" -ForegroundColor White
Write-Host "  -> LegacyBridge Dashboard: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  -> Acme Legacy Portal:    http://localhost:8080" -ForegroundColor Cyan
Write-Host "  -> Live API Feed:         http://localhost:3000/api/feeds/task-q3-sales-acme/latest" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to terminate services." -ForegroundColor Gray

npm run dev
