# PowerShell Docker Management Script for MCP Servers (Windows)
# Usage: ./scripts/docker-manage.ps1 <build|start|stop|restart|logs|status|update|clean|shell|stats|help>

param(
  [Parameter(Position=0)]
  [ValidateSet('build','start','stop','restart','logs','status','update','clean','shell','stats','help')]
  [string]$Action = 'help'
)

$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Done($msg) { Write-Host "[OK]   $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[ERR]  $msg" -ForegroundColor Red }

# Resolve repo root and compose file path
$scriptDir = Split-Path -Parent $PSCommandPath
$repoRoot  = Split-Path -Parent $scriptDir
$composeFile = Join-Path $repoRoot 'docker-compose.minimal.yml'
$containerName = 'mcp-all-servers'
Write-Info "Using compose file: $composeFile"

if (-not (Test-Path $composeFile)) {
  Write-Err "Compose file not found: $composeFile"
  exit 1
}

# Ensure docker exists
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Err 'Docker is not installed or not on PATH.'
  exit 1
}

# Detect compose invocation: prefer `docker compose`, fallback to `docker-compose`
$global:UseDockerComposePlugin = $false
try {
  & docker compose version *> $null
  if ($LASTEXITCODE -eq 0) { $global:UseDockerComposePlugin = $true }
} catch { }

if (-not $UseDockerComposePlugin) {
  if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Err 'Neither "docker compose" nor "docker-compose" is available.'
    Write-Info 'Install Docker Desktop (includes compose) or docker-compose.'
    exit 1
  }
}

# replace the old Compose() with this
function Compose {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ComposeArgs
  )
  if ($UseDockerComposePlugin) {
    & docker compose @ComposeArgs
  } else {
    & docker-compose @ComposeArgs
  }
}


function Show-Help {
  Write-Host "MCP Servers Docker Management (Windows)" -ForegroundColor White
  Write-Host ""
  Write-Host "Usage: scripts/docker-manage.ps1 <command>" -ForegroundColor Gray
  Write-Host ""
  Write-Host "Commands:" -ForegroundColor Gray
  Write-Host "  build   - Build the container image"
  Write-Host "  start   - Start all MCP servers"
  Write-Host "  stop    - Stop all MCP servers"
  Write-Host "  restart - Restart all MCP servers"
  Write-Host "  logs    - Show server logs (follow)"
  Write-Host "  status  - Show server status"
  Write-Host "  update  - Pull latest code, build, restart"
  Write-Host "  clean   - Remove containers, images, volumes"
  Write-Host "  shell   - Open shell in container"
  Write-Host "  stats   - Show container resource usage"
}

try {
  switch ($Action) {
    'build' {
      Write-Info 'Building MCP servers container...'
      Compose -ComposeArgs @('-f', $composeFile, 'build', '--no-cache')
      Write-Done 'Build complete.'
    }

    'start' {
      Write-Info 'Starting MCP servers...'
      Compose -ComposeArgs @('-f', $composeFile, 'up', '-d')
      Write-Done 'All servers started.'
      Compose  -ComposeArgs @('-f', $composeFile, 'ps')
    }

    'stop' {
      Write-Info 'Stopping MCP servers...'
      Compose  -ComposeArgs @('-f', $composeFile, 'down')
      Write-Done 'All servers stopped.'
    }

    'restart' {
      Write-Info 'Restarting MCP servers...'
      Compose  -ComposeArgs @('-f', $composeFile, 'restart')
      Write-Done 'All servers restarted.'
    }

    'logs' {
      Write-Info 'Showing logs (Ctrl+C to exit)...'
      Compose  -ComposeArgs @('-f', $composeFile, 'logs', '-f')
    }

    'status' {
      Write-Info 'MCP Servers status:'
      Compose  -ComposeArgs @('-f', $composeFile, 'ps')
      Write-Host ''
      Write-Info 'PM2 process list inside container:'
      try {
        & docker exec $containerName pm2 list
      } catch {
        Write-Warn "Unable to query PM2. Is the container running? ($containerName)"
      }
    }

    'update' {
      Write-Info 'Updating repository and containers...'
      Push-Location $repoRoot
      try {
        if (Get-Command git -ErrorAction SilentlyContinue) {
          & git pull origin main
        } else {
          Write-Warn 'Git not found; skipping git pull.'
        }
        if (Get-Command npm -ErrorAction SilentlyContinue) {
          & npm run build
        } else {
          Write-Warn 'npm not found; skipping npm build.'
        }
      } finally {
        Pop-Location
      }
      Compose  -ComposeArgs @('-f', $composeFile, 'up', '-d', '--build')
      Write-Done 'Servers updated and restarted.'
    }

    'clean' {
      Write-Info 'Cleaning up Docker resources...'
      Compose  -ComposeArgs @('-f', $composeFile, 'down', '--rmi', 'all', '--volumes', '--remove-orphans')
      & docker system prune -f
      Write-Done 'Cleanup complete.'
    }

    'shell' {
      Write-Info "Opening shell in container '$containerName'..."
      & docker exec -it $containerName /bin/sh
    }

    'stats' {
      Write-Info 'Container resource usage:'
      & docker stats $containerName --no-stream
    }

    Default {
      Show-Help
      if ($Action -ne 'help') { exit 1 }
    }
  }
} catch {
  Write-Err $_.Exception.Message
  exit 1
}

