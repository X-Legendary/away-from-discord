$package = Get-Content -Path package.json | ConvertFrom-Json
$version = $package.version

npm run build:ts # tsc
if ($lastexitcode -ne 0) { exit }

cd dist
del *.json
cd ..

cd build
del *.zip
cd ..

Copy-Item -Path "./package.json" -Destination "./dist"
Copy-Item -Path "./icon.ico" -Destination "./dist"

# If we have a custom config file in the project root, use that instead of the example
if ((Test-Path -Path "./config.json" -PathType Leaf) -And ($Args[0] -ne "all")) { # Only allow custom config to be used on current platform
    Write-Host "Custom config exists - using it"
    Copy-Item -Path "./config.json" -Destination "./dist"
} else {
    Write-Host "Custom config doesn't exist - using example config"
    Copy-Item -Path "./config.example.json" -Destination "./dist"
    Rename-Item -Path "./dist/config.example.json" -NewName "config.json"
}

# Build the app
if ($Args[0] -eq "all") {
    Write-Host "Building for all platforms..."
    node scripts/build.js win32 ia32
    node scripts/build.js win32 x64

    node scripts/build.js linux x64
    # TODO: Add more platforms!
} else {
    Write-Host "Building for current platform only..."
    node scripts/build.js
}
if ($lastexitcode -ne 0) { exit }

# Finish and copy over config
$builds = Get-ChildItem -Path "./build"
foreach($build in $builds) {
    Copy-Item -Path "./dist/config.json" -Destination $build.FullName
    Copy-Item -Path "./icon.ico" -Destination $build.FullName
}

Get-ChildItem -Path "./build" -Force -Recurse |
    Where-Object -FilterScript {
        try {
            Get-ChildItem $_.FullName | Set-ItemProperty -Name IsReadOnly -Value $false -Force -ErrorAction "silentlycontinue"
        } catch {}
    }

Function Check-Command {
    param($command)
    try {
        if(Get-Command $command) {
            return $true
        }
    } catch {
        return $false
    }
}

if(!(Check-Command 7z)) {
    Write-Host "Cannot zip builds - 7-Zip is not added to PATH"
    exit
}

if($Args[0] -eq "all") {
    foreach($build in $builds) {
        7z a -tzip "./build/$build-v$version.zip" $build.FullName
    }
}
