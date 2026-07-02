# USB deploy - bundle JS, build release APK, install on connected phone.
# Usage (from project root):
#   .\scripts\usb-deploy.ps1
#   .\scripts\usb-deploy.ps1 -UninstallFirst
#   .\scripts\usb-deploy.ps1 -DeviceId RZCT80S3DRE

param(
  [string]$DeviceId = "RZCT80S3DRE",
  [switch]$UninstallFirst
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$apk = Join-Path $root "android\app\build\outputs\apk\release\app-release.apk"
$pkg = "com.studentlearningapp"

if (-not (Test-Path $adb)) {
  Write-Error "adb not found at $adb - install Android SDK platform-tools."
}

Write-Host ">> Checking device $DeviceId ..."
& $adb devices

if ($UninstallFirst) {
  Write-Host ">> Uninstalling $pkg ..."
  & $adb -s $DeviceId uninstall $pkg | Out-Null
}

Write-Host ">> Bundling JavaScript ..."
Push-Location $root
npx react-native bundle `
  --platform android `
  --dev false `
  --entry-file index.js `
  --bundle-output android/app/src/main/assets/index.android.bundle `
  --assets-dest android/app/src/main/res

Write-Host ">> Building release APK ..."
Push-Location (Join-Path $root "android")
.\gradlew assembleRelease -x lint
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  Pop-Location
  Write-Error "Gradle build failed. Fix errors above before installing."
}
Pop-Location
Pop-Location

if (-not (Test-Path $apk)) {
  Write-Error "APK not found: $apk"
}

Write-Host ">> Installing on $DeviceId ..."
& $adb -s $DeviceId install -r $apk
Write-Host ">> Done. Open app and check login build label."
