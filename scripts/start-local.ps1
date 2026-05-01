# DoctrineRAG: Docker로 로컬 전체 기동 후 브라우저에서 http://localhost:3000 열기
$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker가 PATH에 없습니다. Docker Desktop을 설치한 뒤 다시 실행하세요: https://docs.docker.com/desktop/"
}

if (-not (Test-Path (Join-Path $Root ".env"))) {
    $example = Join-Path $Root ".env.example"
    if (Test-Path $example) {
        Copy-Item $example (Join-Path $Root ".env")
        Write-Host ""
        Write-Host "[알림] .env.example 을 복사해 .env 를 만들었습니다. OPENAI_API_KEY 를 반드시 설정하세요." -ForegroundColor Yellow
        Write-Host ""
    }
}

Write-Host "Docker Compose 기동 중... (최초 빌드는 수 분 걸릴 수 있습니다)" -ForegroundColor Cyan
docker compose up --build -d
if ($LASTEXITCODE -ne 0) {
    Write-Error "docker compose 가 실패했습니다 (exit $LASTEXITCODE)."
}

Write-Host "http://localhost:3000 응답 대기 중..." -ForegroundColor Cyan
$ok = $false
for ($i = 0; $i -lt 120; $i++) {
    try {
        $res = Invoke-WebRequest -Uri "http://127.0.0.1:3000/" -UseBasicParsing -TimeoutSec 5
        if ($res.StatusCode -eq 200) {
            $ok = $true
            break
        }
    } catch {
        # 연결 거부 등 — 컨테이너 기동 대기
    }
    Start-Sleep -Seconds 2
}

if ($ok) {
    Write-Host "준비 완료. 브라우저를 엽니다." -ForegroundColor Green
} else {
    Write-Host "[경고] 3000 포트 응답을 기다리다 중단했습니다. docker compose logs 를 확인하세요." -ForegroundColor Yellow
}

Start-Process "http://localhost:3000/"

Write-Host ""
Write-Host "  웹 UI : http://localhost:3000" -ForegroundColor White
Write-Host "  API   : http://localhost:8000/docs" -ForegroundColor White
Write-Host "  중지  : docker compose down" -ForegroundColor DarkGray
Write-Host "  로그  : docker compose logs -f" -ForegroundColor DarkGray
Write-Host ""
