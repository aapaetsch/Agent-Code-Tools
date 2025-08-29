@echo off
setlocal

REM Windows CMD wrapper to invoke the PowerShell script
set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%docker-manage.ps1"

REM Prefer PowerShell 7 (pwsh) if available, fallback to Windows PowerShell
where pwsh >nul 2>&1
if %errorlevel%==0 (
  pwsh -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" %*
  exit /b %errorlevel%
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" %*
exit /b %errorlevel%

