# PowerShell script to zip the plugin for production
$pluginSlug = "coderscrown-crm-plugin"
$zipName = "coderscrown-crm.zip"
$exclude = @(
    ".git",
    ".gitignore",
    ".vscode",
    "node_modules",
    "src",
    "scripts",
    "release.ps1",
    "package.json",
    "package-lock.json",
    "README.md",
    "INSTALL.md",
    "webpack.config.js",
    "tailwind.config.js",
    "postcss.config.js"
)

# Remove old zip
if (Test-Path $zipName) {
    Remove-Item $zipName
}

# Create temp dir
$tempDir = "$env:TEMP\$pluginSlug"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy files
Copy-Item -Path . -Destination $tempDir -Recurse -Exclude $exclude

# Zip it
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName

# Cleanup
Remove-Item $tempDir -Recurse -Force

Write-Host "Plugin zipped to $zipName"
