# Login Security Test Script
# Usage: .\test-login-security.ps1

$BACE_URL = "http://localhost:8000/api/accounts/login/"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LOGIN ENDPOINT VULNERABILITY TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Normal Login (baseline)
Write-Host "[TEST 1] Normal login (baseline)" -ForegroundColor Yellow
$body = @{
    username = "guardia_test"
    password = "Test*2024*"
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri $BACE_URL -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($resp.Content)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: SQL Injection in username
Write-Host "[TEST 2] SQL Injection - username" -ForegroundColor Yellow
$body = @{
    username = "' OR '1'='1"
    password = "anything"
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri $BACE_URL -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    Write-Host "Status: $($resp.StatusCode)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
    Write-Host "Response: $($resp.Content)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host ""

# Test 3: SQL Injection in password
Write-Host "[TEST 3] SQL Injection - password" -ForegroundColor Yellow
$body = @{
    username = "guardia_test"
    password = "' OR '1'='1"
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri $BACE_URL -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    Write-Host "Status: $($resp.StatusCode)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
    Write-Host "Response: $($resp.Content)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host ""

# Test 4: XSS in username
Write-Host "[TEST 4] XSS - username" -ForegroundColor Yellow
$body = @{
    username = "<script>alert('XSS')</script>"
    password = "anything"
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri $BACE_URL -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    Write-Host "Status: $($resp.StatusCode)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
    Write-Host "Response: $($resp.Content)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host ""

# Test 5: XSS in password
Write-Host "[TEST 5] XSS - password" -ForegroundColor Yellow
$body = @{
    username = "guardia_test"
    password = "<script>alert('XSS')</script>"
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri $BACE_URL -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    Write-Host "Status: $($resp.StatusCode)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
    Write-Host "Response: $($resp.Content)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host ""

# Test 6: SQL Injection - admin bypass
Write-Host "[TEST 6] SQL Injection - admin bypass" -ForegroundColor Yellow
$body = @{
    username = "admin'--"
    password = "anything"
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri $BACE_URL -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    Write-Host "Status: $($resp.StatusCode)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
    Write-Host "Response: $($resp.Content)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host ""

# Test 7: Empty fields
Write-Host "[TEST 7] Empty fields" -ForegroundColor Yellow
$body = @{
    username = ""
    password = ""
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri $BACE_URL -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    Write-Host "Status: $($resp.StatusCode)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
    Write-Host "Response: $($resp.Content)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host ""

# Test 8: Long payload (DoS test)
Write-Host "[TEST 8] Long payload (DoS)" -ForegroundColor Yellow
$longString = "A" * 10000
$body = @{
    username = $longString
    password = $longString
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri $BACE_URL -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    Write-Host "Status: $($resp.StatusCode)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
    Write-Host "Response: $($resp.Content)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Test 9: Malformed JSON
Write-Host "[TEST 9] Malformed JSON" -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri $BACE_URL -Method POST -ContentType "application/json" -Body "{invalid json" -TimeoutSec 10
    Write-Host "Status: $($resp.StatusCode)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
    Write-Host "Response: $($resp.Content)" -ForegroundColor $(if ($resp.StatusCode -eq 200) { "Red" } else { "Green" })
} catch {
    Write-Host "Error expected: $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host ""

# Test 10: GET method (should fail)
Write-Host "[TEST 10] GET method (should fail with 405)" -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri $BACE_URL -Method GET -TimeoutSec 10
    Write-Host "Status: $($resp.StatusCode)" -ForegroundColor $(if ($resp.StatusCode -eq 405) { "Green" } else { "Red" })
    Write-Host "Response: $($resp.Content)" -ForegroundColor $(if ($resp.StatusCode -eq 405) { "Green" } else { "Red" })
    if ($resp.StatusCode -eq 405) {
        Write-Host "PASS: GET not allowed" -ForegroundColor Green
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTS COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Interpretation:" -ForegroundColor White
Write-Host "  Green = Secure behavior (expected)" -ForegroundColor Green
Write-Host "  Red = Possible vulnerability" -ForegroundColor Red
Write-Host "  Yellow = Test error" -ForegroundColor Yellow