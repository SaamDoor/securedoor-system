# PowerShell deploy helper for Liara (Docker + prebuilt Next standalone)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host '→ Building Next.js standalone...' -ForegroundColor Cyan
npm run build

$standalone = Join-Path '.next\standalone\securedoor-system\frontend'
if (-not (Test-Path (Join-Path $standalone 'server.js'))) {
  throw "Standalone output missing at $standalone"
}

Write-Host '→ Preparing liara-release...' -ForegroundColor Cyan
Remove-Item -Recurse -Force liara-release -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path 'liara-release\.next\static' -Force | Out-Null
Copy-Item -Recurse -Force (Join-Path $standalone '*') 'liara-release\'
Copy-Item -Recurse -Force '.next\static\*' 'liara-release\.next\static\'
Copy-Item -Recurse -Force 'public' 'liara-release\public'

Write-Host '→ Packing node_modules as modules.tgz (Liara strips node_modules folders)...' -ForegroundColor Cyan
if (Test-Path 'liara-release\modules.tgz') { Remove-Item 'liara-release\modules.tgz' -Force }
tar -czf 'liara-release\modules.tgz' -C 'liara-release' node_modules
Remove-Item -Recurse -Force 'liara-release\node_modules'

Write-Host '→ Deploying to Liara (iran / docker)...' -ForegroundColor Cyan
liara deploy --platform docker --app mashuf --port 3000 --no-app-logs -b iran

Write-Host '✓ Done: https://mashuf.liara.run' -ForegroundColor Green
