<#
.SYNOPSIS
  Enlaza este repo como modulo de Foundry VTT para desarrollo.

.DESCRIPTION
  Crea una junction <Data>\modules\<id> que apunta a la carpeta del repo, asi
  Foundry carga directamente los archivos que editas. El id se lee de
  module.json. Si ya existe algo con ese nombre en modules\, no lo toca.

  Sin -DataPath, la carpeta Data sale de dataPath en
  %LOCALAPPDATA%\FoundryVTT\Config\options.json (+ "\Data"), y si ese archivo
  no existe, de %LOCALAPPDATA%\FoundryVTT\Data.

  Compatible con Windows PowerShell 5.1. Este archivo es ASCII a proposito:
  PowerShell 5.1 lee los .ps1 sin BOM con la pagina de codigos del sistema.

.PARAMETER DataPath
  Carpeta Data de Foundry (la que contiene modules\, systems\, worlds\).

.EXAMPLE
  powershell -File tools/link-foundry.ps1

.EXAMPLE
  powershell -File tools/link-foundry.ps1 -DataPath "D:\FoundryData\Data"
#>
[CmdletBinding()]
param(
  [string]$DataPath
)

$ErrorActionPreference = 'Stop'

# A plain message and exit code 1: Write-Error under 'Stop' would print a
# full error record that buries the actual reason.
function Fail([string]$message) {
  $host.UI.WriteErrorLine($message)
  exit 1
}

$repo = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $repo 'module.json'
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
  Fail "No encuentro module.json en $repo"
}

$id = (Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json).id
if (-not $id -or $id -notmatch '^[a-z0-9-]+$') {
  Fail "El id de module.json no es valido: '$id'. Corriste antes 'node tools/init-module.mjs'?"
}

if (-not $DataPath) {
  $optionsPath = Join-Path $env:LOCALAPPDATA 'FoundryVTT\Config\options.json'
  if (Test-Path -LiteralPath $optionsPath -PathType Leaf) {
    $dataRoot = (Get-Content -LiteralPath $optionsPath -Raw -Encoding UTF8 | ConvertFrom-Json).dataPath
    if ($dataRoot) {
      $DataPath = Join-Path $dataRoot 'Data'
      Write-Host "Carpeta Data tomada de $optionsPath"
    }
  }
  if (-not $DataPath) {
    $DataPath = Join-Path $env:LOCALAPPDATA 'FoundryVTT\Data'
    Write-Host "Sin dataPath en options.json: uso $DataPath"
  }
}

$modulesDir = Join-Path $DataPath 'modules'
if (-not (Test-Path -LiteralPath $modulesDir -PathType Container)) {
  Fail "No existe $modulesDir. Pasa la carpeta Data correcta con -DataPath."
}

$target = Join-Path $modulesDir $id
# Get-Item -Force also sees a dangling junction, which Test-Path reports as
# missing; creating over it would fail half-way or replace someone's link.
$existing = Get-Item -LiteralPath $target -Force -ErrorAction SilentlyContinue
if ($existing -or (Test-Path -LiteralPath $target)) {
  $what = 'una carpeta'
  if ($existing -and $existing.LinkType) {
    $what = "un enlace ($($existing.LinkType)) a '$($existing.Target)'"
  }
  Fail "Ya existe $target ($what). No lo toco: borralo o renombralo tu si de verdad quieres reemplazarlo."
}

New-Item -ItemType Junction -Path $target -Target $repo | Out-Null
Write-Host "Junction creada:"
Write-Host "  $target"
Write-Host "  -> $repo"
Write-Host "Abre Foundry, entra a un mundo con PF2e y activa '$id' en Manage Modules."
