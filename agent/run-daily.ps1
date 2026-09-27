# Runs master-machine for one business day, across all checkouts, and
# logs each run so a morning check has something to read.
#
# Defaults to yesterday (the business day that just closed) and checkouts
# 1,2,3 (Colon's current registers). Override for a manual/backfill run:
#   .\run-daily.ps1 -Date 2026-09-12
#   .\run-daily.ps1 -Date 2026-09-12 -Cajas 01,02
#   .\run-daily.ps1 -Date 2026-09-12 -IncludeChecked   # one-off remediation re-run
param(
    [string]$Date = (Get-Date).AddDays(-1).ToString('yyyy-MM-dd'),
    [string[]]$Cajas = @('01', '02', '03'),
    [switch]$IncludeChecked
)

# Task Scheduler invokes via `powershell.exe -File ... -Cajas 01,02,03,04`
# (no spaces). Windows splits argv on whitespace only, so -File's binder
# gets "01,02,03,04" as ONE token and $Cajas ends up a single-element array
# containing that whole string - PowerShell's own comma-splits-into-array
# parsing only kicks in when a human types it at an interactive prompt.
# Splitting here makes it work the same regardless of how it's invoked.
$Cajas = $Cajas | ForEach-Object { $_ -split ',' } | Where-Object { $_ }

$Root = $PSScriptRoot
$Exe = Join-Path $Root 'bin\master-machine.exe'
$Config = Join-Path $Root 'config.json'
$Queries = Join-Path $Root 'master-machine\queries\cash_report.sql'
$LogDir = Join-Path $Root 'log'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$LogFile = Join-Path $LogDir "$Date.log"

foreach ($caja in $Cajas) {
    "=== $(Get-Date -Format o) caja=$caja date=$Date ===" | Tee-Object -FilePath $LogFile -Append
    $exeArgs = @('-config', $Config, '-queries', $Queries, '-date', $Date, '-caja', $caja)
    if ($IncludeChecked) { $exeArgs += '-include-checked' }
    & $Exe @exeArgs 2>&1 | Tee-Object -FilePath $LogFile -Append
}
