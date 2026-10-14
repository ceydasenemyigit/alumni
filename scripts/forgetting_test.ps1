# ==============================================================================
# The Forgetting Test (Data Persistence Verification Script for PowerShell)
# ==============================================================================
# Demonstrates container persistence vs. ephemeral storage:
# 1. Start containers (docker compose up -d)
# 2. Insert a new record into PostgreSQL
# 3. Destroy and recreate containers (docker compose down -> docker compose up -d)
# 4. Check whether the database retained (remembered) the record.
# ==============================================================================

$ErrorActionPreference = "Stop"

$DB_CONTAINER = "alumni_postgres"
$DB_USER = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "alumni_user" }
$DB_NAME = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "alumni_db" }

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "        RUNNING THE FORGETTING TEST (DOCKER PERSISTENCE)       " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# 1. Start Docker Containers
Write-Host "`n[Step 1/5] Starting Docker Compose services..." -ForegroundColor Yellow
docker compose up -d

Write-Host "`n[Step 2/5] Waiting for PostgreSQL container to become healthy..." -ForegroundColor Yellow
$healthy = $false
for ($i = 0; $i -lt 30; $i++) {
    $status = docker exec $DB_CONTAINER pg_isready -U $DB_USER -d $DB_NAME 2>$null
    if ($LASTEXITCODE -eq 0) {
        $healthy = $true
        break
    }
    Start-Sleep -Seconds 2
}

if (-not $healthy) {
    Write-Host "PostgreSQL container failed to become healthy in time." -ForegroundColor Red
    exit 1
}
Write-Host "✓ PostgreSQL is healthy and accepting connections." -ForegroundColor Green

# 2. Insert Record Before 'docker compose down'
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$TEST_TITLE = "Forgetting Test Record - $timestamp"
$TEST_CONTENT = "This record proves persistent named volume storage across container teardown."
$TEST_AUTHOR = "PowerShell Persistence Test"
$TEST_CATEGORY = "Academic"

Write-Host "`n[Step 3/5] Inserting a new record into 'announcements' table..." -ForegroundColor Yellow
docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "INSERT INTO announcements (title, content, author, category) VALUES ('$TEST_TITLE', '$TEST_CONTENT', '$TEST_AUTHOR', '$TEST_CATEGORY');"

Write-Host "`nVerifying record exists before teardown:"
docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT id, title, category, created_at FROM announcements WHERE title = '$TEST_TITLE';"
Write-Host "✓ Record created successfully." -ForegroundColor Green

# 3. Simulate Teardown ('docker compose down')
Write-Host "`n[Step 4/5] Executing 'docker compose down' (Destroying containers & network)..." -ForegroundColor Yellow
docker compose down

Write-Host "`nRe-launching containers with 'docker compose up -d'..."
docker compose up -d

Write-Host "`nWaiting for PostgreSQL to be ready..."
for ($i = 0; $i -lt 30; $i++) {
    docker exec $DB_CONTAINER pg_isready -U $DB_USER -d $DB_NAME 2>$null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 2
}

# 4. Check Record After 'docker compose up'
Write-Host "`n[Step 5/5] Checking if the record survived container teardown (The Forgetting Test)..." -ForegroundColor Yellow
$output = docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -A -c "SELECT COUNT(*) FROM announcements WHERE title = '$TEST_TITLE';"
$count = [int]($output.Trim())

if ($count -ge 1) {
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "🎉 TEST PASSED: THE DATABASE DID NOT FORGET THE RECORD!        " -ForegroundColor Green
    Write-Host "Data survived container teardown thanks to named volume:       " -ForegroundColor Green
    Write-Host "'postgres_data -> /var/lib/postgresql/data'                   " -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT id, title, author, category, created_at FROM announcements WHERE title = '$TEST_TITLE';"
    exit 0
} else {
    Write-Host "================================================================" -ForegroundColor Red
    Write-Host "❌ TEST FAILED: The database forgot the record!               " -ForegroundColor Red
    Write-Host "Ephemeral storage detected (No persistent volume configured).   " -ForegroundColor Red
    Write-Host "================================================================" -ForegroundColor Red
    exit 1
}
