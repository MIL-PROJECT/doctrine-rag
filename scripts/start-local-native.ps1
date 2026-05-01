# Docker 없이 로컬 실행: 백엔드(8000) + 프론트(3000) 각각 새 PowerShell 창에서 기동
$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"

if (-not (Test-Path (Join-Path $Root ".env"))) {
    $example = Join-Path $Root ".env.example"
    if (Test-Path $example) {
        Copy-Item $example (Join-Path $Root ".env")
        Write-Host "[알림] .env 를 생성했습니다. OPENAI_API_KEY 를 설정하세요." -ForegroundColor Yellow
    }
}

$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) {
    Write-Error "python 이 PATH에 없습니다. Python 3.11+ 를 설치하세요."
}

$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
    Write-Error "npm 이 PATH에 없습니다. Node.js 20+ LTS 를 설치하세요."
}

$backendCmd = @"
Set-Location '$Backend'
if (-not (Test-Path '.venv')) { python -m venv .venv }
& .\.venv\Scripts\Activate.ps1
pip install -q -r requirements.txt
Write-Host 'Backend: http://localhost:8000/docs' -ForegroundColor Green
uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@

$frontendCmd = @"
Set-Location '$Frontend'
if (-not (Test-Path 'node_modules')) { npm install }
`$env:NEXT_PUBLIC_API_URL = 'http://localhost:8000'
Write-Host 'Frontend: http://localhost:3000' -ForegroundColor Green
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "백엔드·프론트 창이 열렸습니다. 잠시 후 브라우저를 엽니다..." -ForegroundColor Cyan
Start-Sleep -Seconds 8
Start-Process "http://localhost:3000/"
Write-Host "중지: 각 창에서 Ctrl+C" -ForegroundColor DarkGray
