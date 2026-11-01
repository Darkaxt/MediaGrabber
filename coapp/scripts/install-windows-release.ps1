param(
    [Parameter(Mandatory)][string]$ReleaseDirectory,
    [Parameter(Mandatory)][string]$ExtensionDirectory,
    [Parameter(Mandatory)][string]$ScratchDirectory,
    [switch]$ExtensionIsDisabled
)
$ErrorActionPreference = 'Stop'
if (-not $ExtensionIsDisabled) { throw 'Disable the MediaGrabber extension before updating its native host.' }
$releaseRoot = (Resolve-Path -LiteralPath $ReleaseDirectory).Path
$extensionRoot = (Resolve-Path -LiteralPath $ExtensionDirectory).Path
$installRoot = Join-Path $env:LOCALAPPDATA 'MediaGrabber'
foreach ($line in Get-Content -LiteralPath (Join-Path $releaseRoot 'SHA256SUMS.txt')) {
    $expected, $name = $line -split '  ', 2
    if ([IO.Path]::GetFileName($name) -ne $name) { throw 'Invalid release checksum member.' }
    $actual = (Get-FileHash -LiteralPath (Join-Path $releaseRoot $name) -Algorithm SHA256).Hash
    if ($actual -ne $expected) { throw "Release checksum mismatch: $name" }
}
$processes = @(Get-CimInstance Win32_Process)
$hosts = @($processes | Where-Object { $_.ExecutablePath -eq (Join-Path $installRoot 'coapp.exe') })
$hostIds = @($hosts.ProcessId)
$consoleHost = Join-Path $env:SystemRoot 'System32\conhost.exe'
if (@($processes | Where-Object { $_.ParentProcessId -in $hostIds -and $_.ExecutablePath -ne $consoleHost }).Count) {
    throw 'A MediaGrabber host still has an active child process. Finish its operation before updating.'
}
foreach ($ownedHost in $hosts) {
    # Only this application's idle old hosts are stopped; browser/gate processes are untouched.
    Stop-Process -Id $ownedHost.ProcessId
}
foreach ($ownedHost in $hosts) {
    Wait-Process -Id $ownedHost.ProcessId -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $ScratchDirectory -Force | Out-Null
$oldTemp, $oldTmp = $env:TEMP, $env:TMP
try {
    $env:TEMP = $ScratchDirectory
    $env:TMP = $ScratchDirectory
    $installer = Start-Process -FilePath (Join-Path $releaseRoot 'MediaGrabber-Setup-win-x64.exe') -ArgumentList 'install' -WorkingDirectory $releaseRoot -WindowStyle Hidden -Wait -PassThru
    if ($installer.ExitCode -ne 0) { throw "Installer failed with exit code $($installer.ExitCode)." }
} finally {
    $env:TEMP, $env:TMP = $oldTemp, $oldTmp
}
foreach ($pair in @(
    @('MediaGrabber-CoApp-win-x64.exe', 'coapp.exe'),
    @('yt-dlp-win-x64.exe', 'ytdlp\win\yt-dlp.exe'),
    @('ffmpeg-win-x64.exe', 'ffmpeg\win\ffmpeg.exe'),
    @('ffprobe-win-x64.exe', 'ffmpeg\win\ffprobe.exe')
)) {
    if ((Get-FileHash -LiteralPath (Join-Path $releaseRoot $pair[0])).Hash -ne
        (Get-FileHash -LiteralPath (Join-Path $installRoot $pair[1])).Hash) {
        throw "Installed runtime checksum mismatch: $($pair[1])"
    }
}
Expand-Archive -LiteralPath (Join-Path $releaseRoot 'MediaGrabber-extension.zip') -DestinationPath $extensionRoot -Force
$manifest = Get-Content -LiteralPath (Join-Path $extensionRoot 'manifest.json') -Raw | ConvertFrom-Json
if ($manifest.version -ne '1.1.2') { throw 'Installed extension version is unexpected.' }
Write-Output "Installed MediaGrabber $($manifest.version); preserved extension path $extensionRoot"
