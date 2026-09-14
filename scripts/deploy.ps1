# Script PowerShell para despliegue interactivo y modular en NPM
# Ecosistema @angelitosystems/nest-auth y nest-auth-kit
# Desarrollado para: Angelito Systems
#
# Uso:
#   .\scripts\deploy.ps1
#   .\scripts\deploy.ps1 -All
#   .\scripts\deploy.ps1 -Package core
#   .\scripts\deploy.ps1 -Package prisma -Otp "123456"
#   .\scripts\deploy.ps1 -DryRun -SkipTests

param(
    [string]$Package = "",
    [switch]$All,
    [switch]$DryRun,
    [switch]$SkipTests,
    [string]$Otp = "",
    [string]$Tag = "latest",
    [switch]$Yes
)

$ErrorActionPreference = "Stop"

function Show-Banner {
    Write-Host @"
    _                    _ _ _          
   / \   _ __   __ _  ___| (_) |_ ___   
  / _ \ | '_ \ / _` |/ _ \ | | __/ _ \  
 / ___ \| | | | (_| |  __/ | | || (_) | 
/_/   \_\_| |_|\__, |\___|_|_|\__\___/  
               |___/                    
"@ -ForegroundColor Cyan
    Write-Host "       Angelito Systems · NPM Deployment Engine" -ForegroundColor White
    Write-Host "       Ecosistema NestJS Auth · Publicación Independiente y Modular`n" -ForegroundColor DarkGray
}

Show-Banner

# Definición de paquetes y orden topológico de dependencias
$PACKAGES = @(
    @{
        id = "core"
        name = "@angelitosystems/nest-auth"
        dir = "packages/core"
        description = "Core Auth Ecosystem (JWT, RBAC, Sessions, 2FA, Audit)"
        dependsOn = @()
        priority = 1
    },
    @{
        id = "prisma"
        name = "@angelitosystems/nest-auth-prisma"
        dir = "packages/prisma"
        description = "Prisma ORM Database Adapter"
        dependsOn = @("@angelitosystems/nest-auth")
        priority = 2
    },
    @{
        id = "typeorm"
        name = "@angelitosystems/nest-auth-typeorm"
        dir = "packages/typeorm"
        description = "TypeORM Database Adapter (PostgreSQL / MySQL)"
        dependsOn = @("@angelitosystems/nest-auth")
        priority = 3
    },
    @{
        id = "sequelize"
        name = "@angelitosystems/nest-auth-sequelize"
        dir = "packages/sequelize"
        description = "Sequelize Database Adapter (MySQL / PostgreSQL)"
        dependsOn = @("@angelitosystems/nest-auth")
        priority = 4
    },
    @{
        id = "mongoose"
        name = "@angelitosystems/nest-auth-mongoose"
        dir = "packages/mongoose"
        description = "Mongoose Database Adapter (MongoDB)"
        dependsOn = @("@angelitosystems/nest-auth")
        priority = 5
    },
    @{
        id = "cli"
        name = "@angelitosystems/nest-auth-kit"
        dir = "packages/cli"
        description = "Official CLI Toolkit & Scaffolding Engine"
        dependsOn = @()
        priority = 6
    }
)

# 1. Verificar sesión en NPM
Write-Host "▶ Verificando sesión en npm..." -ForegroundColor Cyan
try {
    $npmUser = (npm whoami 2>$null).Trim()
    if (-not $npmUser -or $npmUser -match "ENEEDAUTH") {
        throw "No autenticado"
    }
    Write-Host "✔ Sesión activa en npm como: $npmUser" -ForegroundColor Green
} catch {
    Write-Host "✖ No has iniciado sesión en npm." -ForegroundColor Red
    Write-Host "Por favor ejecuta primero en tu terminal: npm login" -ForegroundColor Yellow
    exit 1
}

# 2. Selección de paquetes
$targetPackages = @()

if ($All) {
    $targetPackages = $PACKAGES | Sort-Object { $_.priority }
} elseif ($Package) {
    $q = $Package.ToLower().Trim()
    $found = $PACKAGES | Where-Object { $_.id -eq $q -or $_.name -eq $q -or $_.dir -like "*$q" }
    if (-not $found) {
        Write-Host "✖ Paquete no reconocido: '$Package'" -ForegroundColor Red
        Write-Host "Paquetes disponibles: $(($PACKAGES | ForEach-Object { $_.id }) -join ', ')" -ForegroundColor Yellow
        exit 1
    }
    $targetPackages = @($found)
} else {
    Write-Host "Selecciona qué paquete(s) deseas desplegar en NPM:`n" -ForegroundColor White
    Write-Host "  [1] 🚀 Todos los paquetes en orden de dependencias (Core -> Adaptadores -> CLI)" -ForegroundColor Cyan
    for ($i = 0; $i -lt $PACKAGES.Count; $i++) {
        $p = $PACKAGES[$i]
        $badge = if ($p.dependsOn.Count -gt 0) { "[depende de core]" } else { "[independiente]" }
        Write-Host "  [$($i + 2)] $($p.name) ($($p.id)) $badge" -ForegroundColor White
        Write-Host "      $($p.description)" -ForegroundColor DarkGray
    }
    Write-Host "  [0] Cancelar`n" -ForegroundColor DarkGray

    $selection = Read-Host "Ingresa el número de tu opción (0-$($PACKAGES.Count + 1))"
    if ($selection -eq "1") {
        $targetPackages = $PACKAGES | Sort-Object { $_.priority }
    } elseif ($selection -eq "0" -or -not $selection) {
        Write-Host "Despliegue cancelado." -ForegroundColor Yellow
        exit 0
    } else {
        $idx = [int]$selection - 2
        if ($idx -ge 0 -and $idx -lt $PACKAGES.Count) {
            $targetPackages = @($PACKAGES[$idx])
        } else {
            Write-Host "Opción inválida." -ForegroundColor Red
            exit 1
        }
    }
}

# 3. Quality Gates Globales
Write-Host "`n--- Quality Gates & Verificación de Monorepo ---" -ForegroundColor White

if (-not $SkipTests) {
    Write-Host "`n▶ Ejecutando suite de pruebas unitarias..." -ForegroundColor Cyan
    npm test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
    Write-Host "⚠ Omitiendo tests unitarios (-SkipTests)" -ForegroundColor Yellow
}

Write-Host "`n▶ Compilación global de workspaces..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# 4. Confirmación por lote si son varios
if ($targetPackages.Count -gt 1 -and -not $Yes -and -not $DryRun) {
    Write-Host "`n=======================================================" -ForegroundColor Yellow
    Write-Host "Se publicarán $($targetPackages.Count) paquetes en NPM en el siguiente orden:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $targetPackages.Count; $i++) {
        Write-Host "  $($i + 1). $($targetPackages[$i].name) ($($targetPackages[$i].dir))" -ForegroundColor White
    }
    Write-Host "Usuario: $npmUser" -ForegroundColor Green
    Write-Host "=======================================================" -ForegroundColor Yellow
    $confirm = Read-Host "Escribe 'si' para continuar con la publicación"
    if ($confirm -ne "si" -and $confirm -ne "y" -and $confirm -ne "s") {
        Write-Host "Operación cancelada." -ForegroundColor Yellow
        exit 0
    }
}

# 5. Publicar paquetes individuales
$results = @()
$currentOtp = $Otp

foreach ($pkg in $targetPackages) {
    $pkgDir = Resolve-Path $pkg.dir
    $pkgJsonPath = Join-Path $pkgDir "package.json"
    $pkgJson = Get-Content $pkgJsonPath | ConvertFrom-Json
    $version = $pkgJson.version

    Write-Host "`n=======================================================" -ForegroundColor Cyan
    Write-Host " 📦 Desplegando: $($pkg.name)@$version" -ForegroundColor Cyan
    Write-Host " 📁 Directorio: $($pkg.dir)" -ForegroundColor DarkGray
    Write-Host " 📝 Descripción: $($pkg.description)" -ForegroundColor DarkGray
    Write-Host "=======================================================" -ForegroundColor Cyan

    # Asegurar LICENSE
    if (Test-Path "LICENSE" -and -not (Test-Path (Join-Path $pkgDir "LICENSE"))) {
        Copy-Item "LICENSE" (Join-Path $pkgDir "LICENSE")
    }

    # Verificar dependencia core si se despliega adaptador individualmente (y no es dry-run)
    if ($pkg.dependsOn.Count -gt 0 -and $targetPackages.Count -eq 1 -and -not $DryRun -and -not $Yes) {
        foreach ($dep in $pkg.dependsOn) {
            Write-Host "🔍 Verificando dependencia requerida '$dep' en NPM..." -ForegroundColor DarkGray
            $depCheck = (npm view $dep version 2>$null)
            if (-not $depCheck) {
                Write-Host "`n⚠ ADVERTENCIA: '$($pkg.name)' depende de '$dep'." -ForegroundColor Yellow
                Write-Host "No se encontró '$dep' publicado en NPM." -ForegroundColor Yellow
                $ans = Read-Host "¿Deseas continuar de todas formas? (s/N)"
                if ($ans -ne "s" -and $ans -ne "si" -and $ans -ne "y") {
                    Write-Host "Despliegue de $($pkg.name) omitido." -ForegroundColor Yellow
                    $results += @{ pkg = $pkg; success = $false }
                    continue
                }
            } else {
                Write-Host "✔ Dependencia '$dep' encontrada en NPM (v$depCheck)." -ForegroundColor Green
            }
        }
    }

    # Dry-run pack
    Write-Host "`n▶ Verificando empaquetado (dry-run) de $($pkg.name)..." -ForegroundColor Cyan
    Push-Location $pkgDir
    try {
        npm pack --dry-run
        if ($LASTEXITCODE -ne 0) { throw "Error al verificar empaquetado" }
    } finally {
        Pop-Location
    }

    if ($DryRun) {
        Write-Host "`n🔍 MODO DRY-RUN: $($pkg.name)@$version verificado. No se publicó en NPM." -ForegroundColor Yellow
        $results += @{ pkg = $pkg; success = $true }
        continue
    }

    # Confirmación individual si sólo es 1 paquete
    if ($targetPackages.Count -eq 1 -and -not $Yes) {
        $ans = Read-Host "¿Deseas publicar $($pkg.name)@$version en NPM? (si/no)"
        if ($ans -ne "si" -and $ans -ne "y" -and $ans -ne "s") {
            Write-Host "Cancelado por el usuario." -ForegroundColor Yellow
            $results += @{ pkg = $pkg; success = $false }
            continue
        }
    }

    # Publicar
    $published = $false
    $attempts = 0
    while (-not $published -and $attempts -lt 3) {
        $attempts++
        $cmd = "publish --access public --tag $Tag"
        if ($currentOtp) {
            $cmd += " --otp=$currentOtp"
        }

        Write-Host "`n▶ Ejecutando: npm $cmd (en $($pkg.dir))..." -ForegroundColor Cyan
        Push-Location $pkgDir
        try {
            Invoke-Expression "npm $cmd"
            if ($LASTEXITCODE -eq 0) {
                $published = $true
                Write-Host "`n✔ ¡$($pkg.name)@$version publicado exitosamente en NPM!" -ForegroundColor Green
                Write-Host "🔗 URL: https://www.npmjs.com/package/$($pkg.name)" -ForegroundColor Cyan
            } else {
                Write-Host "`n✖ Error al publicar $($pkg.name)." -ForegroundColor Red
                $inputOtp = Read-Host "Si el error fue 2FA, ingresa el código OTP (o Enter para abortar)"
                if ($inputOtp) {
                    $currentOtp = $inputOtp.Trim()
                } else {
                    break
                }
            }
        } finally {
            Pop-Location
        }
    }

    $results += @{ pkg = $pkg; success = $published }
}

# 6. Resumen final
Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host " 🏁 RESUMEN DEL DESPLIEGUE EN NPM" -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Cyan

foreach ($res in $results) {
    $status = if ($res.success) { "✔ PUBLICADO" } else { "✖ NO PUBLICADO" }
    $color = if ($res.success) { "Green" } else { "Red" }
    Write-Host "• $($res.pkg.name.PadRight(35)) $status" -ForegroundColor $color
    if ($res.success -and -not $DryRun) {
        Write-Host "  🔗 https://www.npmjs.com/package/$($res.pkg.name)" -ForegroundColor Cyan
    }
}

Write-Host "`nProceso finalizado. Angelito Systems." -ForegroundColor Green
