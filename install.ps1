# Instalador do FreakJS — Windows
#
# Uso (PowerShell como administrador ou usuario normal):
#   irm https://raw.githubusercontent.com/lucas-s-santos/FreakJS/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

$Repo        = "lucas-s-santos/FreakJS"
$InstallDir  = "$env:USERPROFILE\.freakjs\bin"
$BinName     = "freakjs.exe"
$Target      = "windows-x64"
$DownloadUrl = "https://github.com/$Repo/releases/latest/download/freakjs-$Target.exe"

Write-Host ""
Write-Host "  FreakJS Installer"
Write-Host "  Sistema: Windows x64"
Write-Host ""

# Cria o diretório de instalação
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
}

# Baixa o binário
Write-Host "  Baixando freakjs..."
Invoke-WebRequest -Uri $DownloadUrl -OutFile "$InstallDir\$BinName" -UseBasicParsing
Write-Host "  instalado em $InstallDir\$BinName"

# Adiciona ao PATH do usuario (permanente, sem precisar de admin)
$UserPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*\.freakjs\bin*") {
    [System.Environment]::SetEnvironmentVariable(
        "Path",
        "$InstallDir;$UserPath",
        "User"
    )
    Write-Host "  PATH atualizado"
}

# Disponibiliza na sessão atual também
$env:Path = "$InstallDir;$env:Path"

Write-Host ""
Write-Host "  Instalacao concluida!"
Write-Host ""
Write-Host "  Abra um novo terminal e use:"
Write-Host "    freakjs create meu-projeto"
Write-Host "    cd meu-projeto"
Write-Host "    bun run dev"
Write-Host ""
