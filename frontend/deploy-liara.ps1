# Liara deploy: local Next standalone -> Docker runtime
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host 'Building Next.js standalone...' -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw 'npm run build failed' }

$standalone = Join-Path $PSScriptRoot '.next\standalone\securedoor-system\frontend'
$serverJs = Join-Path $standalone 'server.js'
$buildId = Join-Path $standalone '.next\BUILD_ID'

if (-not (Test-Path $serverJs)) {
  throw "Standalone output missing: $serverJs"
}
if (-not (Test-Path $buildId)) {
  throw "Standalone BUILD_ID missing: $buildId"
}

Write-Host 'Preparing liara-release...' -ForegroundColor Cyan
$release = Join-Path $PSScriptRoot 'liara-release'
Remove-Item -Recurse -Force $release -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $release -Force | Out-Null
Copy-Item -Path (Join-Path $standalone '*') -Destination $release -Recurse -Force

$staticSrc = Join-Path $PSScriptRoot '.next\static'
$staticDst = Join-Path $release '.next\static'
Copy-Item -Path $staticSrc -Destination $staticDst -Recurse -Force

$publicSrc = Join-Path $PSScriptRoot 'public'
$publicDst = Join-Path $release 'public'
Copy-Item -Path $publicSrc -Destination $publicDst -Recurse -Force

# Liara Docker may run npm start from package.json; force standalone server
$pkgPath = Join-Path $release 'package.json'
$pkgText = [System.IO.File]::ReadAllText($pkgPath)
$pkgText = [regex]::Replace($pkgText, '"start"\s*:\s*"next start"', '"start": "node server.js"')
[System.IO.File]::WriteAllText($pkgPath, $pkgText)
if ($pkgText -notmatch '"start"\s*:\s*"node server.js"') {
  throw 'Failed to rewrite package.json start script'
}

Write-Host 'Packing node_modules and .next archives...' -ForegroundColor Cyan
$modulesTgz = Join-Path $release 'modules.tgz'
$nextTgz = Join-Path $release 'next-build.tgz'
if (Test-Path $modulesTgz) { Remove-Item $modulesTgz -Force }
if (Test-Path $nextTgz) { Remove-Item $nextTgz -Force }

Push-Location $release
try {
  tar -czf modules.tgz node_modules
  if ($LASTEXITCODE -ne 0) { throw 'tar modules.tgz failed' }
  Remove-Item -Recurse -Force node_modules

  tar -czf next-build.tgz .next
  if ($LASTEXITCODE -ne 0) { throw 'tar next-build.tgz failed' }
  Remove-Item -Recurse -Force .next
}
finally {
  Pop-Location
}

Write-Host 'Deploying to Liara (docker / germany)...' -ForegroundColor Cyan
liara deploy --platform docker --app mashuf --port 3000 --no-app-logs -b germany
if ($LASTEXITCODE -ne 0) { throw 'liara deploy failed' }

Write-Host 'Done: https://mashuf.liara.run' -ForegroundColor Green
