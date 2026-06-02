# encode-service-account.ps1
# Generates the Base64 value needed for Render's FIREBASE_SERVICE_ACCOUNT_JSON env var.
# Run:  powershell -File scripts\encode-service-account.ps1
# Then copy the output and paste it into Render dashboard.

$json = Get-Content -Raw -LiteralPath "api\serviceAccountKey.json"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [System.Convert]::ToBase64String($bytes)
Write-Output $base64
