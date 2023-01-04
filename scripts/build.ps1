npx tsc
if ( $lastexitcode -ne 0 ) { exit }

cd dist
del *.json
cd ..

Copy-Item -Path "./package.json" -Destination "./dist"
Copy-Item -Path "./config.example.json" -Destination "./dist"
Rename-Item -Path "./dist/config.example.json" -NewName "config.json"
Copy-Item -Path "./icon.ico" -Destination "./dist"

# Build
node scripts/build.js current
if ( $lastexitcode -ne 0 ) { exit }

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