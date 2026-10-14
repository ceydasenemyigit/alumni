#!/usr/bin/env bash
# ==============================================================================
# The Forgetting Test (Data Persistence Verification Script)
# ==============================================================================
# Purpose:
# Demonstrates container persistence vs. ephemeral storage.
# 1. Start containers (docker compose up -d)
# 2. Insert a new record into PostgreSQL
# 3. Destroy and recreate containers (docker compose down -> docker compose up -d)
# 4. Check whether the database retained (remembered) the record.
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

DB_CONTAINER="alumni_postgres"
DB_USER="${POSTGRES_USER:-alumni_user}"
DB_NAME="${POSTGRES_DB:-alumni_db}"

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}        RUNNING THE FORGETTING TEST (DOCKER PERSISTENCE)       ${NC}"
echo -e "${BLUE}================================================================${NC}"

# 1. Start Docker Containers
echo -e "\n${YELLOW}[Step 1/5] Starting Docker Compose services...${NC}"
docker compose up -d

echo -e "\n${YELLOW}[Step 2/5] Waiting for PostgreSQL container to become healthy...${NC}"
until docker exec $DB_CONTAINER pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; do
  echo "Waiting for database connection..."
  sleep 2
done
echo -e "${GREEN}✓ PostgreSQL is healthy and accepting connections.${NC}"

# 2. Insert Record Before 'docker compose down'
TEST_TITLE="Forgetting Test Record - $(date +%s)"
TEST_CONTENT="This record proves persistent named volume storage across container teardown."
TEST_AUTHOR="Automated Persistence Test"
TEST_CATEGORY="Academic"

echo -e "\n${YELLOW}[Step 3/5] Inserting a new record into 'announcements' table...${NC}"
docker exec -i $DB_CONTAINER psql -U "$DB_USER" -d "$DB_NAME" -c \
  "INSERT INTO announcements (title, content, author, category) VALUES ('$TEST_TITLE', '$TEST_CONTENT', '$TEST_AUTHOR', '$TEST_CATEGORY');"

echo -e "\nVerifying record exists before teardown:"
docker exec -i $DB_CONTAINER psql -U "$DB_USER" -d "$DB_NAME" -c \
  "SELECT id, title, category, created_at FROM announcements WHERE title = '$TEST_TITLE';"
echo -e "${GREEN}✓ Record created successfully.${NC}"

# 3. Simulate Teardown ('docker compose down')
echo -e "\n${YELLOW}[Step 4/5] Executing 'docker compose down' (Destroying containers & network)...${NC}"
docker compose down

echo -e "\nRe-launching containers with 'docker compose up -d'..."
docker compose up -d

echo -e "\nWaiting for PostgreSQL to be ready..."
until docker exec $DB_CONTAINER pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; do
  sleep 2
done

# 4. Check Record After 'docker compose up'
echo -e "\n${YELLOW}[Step 5/5] Checking if the record survived container teardown (The Forgetting Test)...${NC}"
RECORD_COUNT=$(docker exec -i $DB_CONTAINER psql -U "$DB_USER" -d "$DB_NAME" -t -A -c \
  "SELECT COUNT(*) FROM announcements WHERE title = '$TEST_TITLE';")

if [ "$RECORD_COUNT" -ge 1 ]; then
  echo -e "${GREEN}================================================================${NC}"
  echo -e "${GREEN}🎉 TEST PASSED: THE DATABASE DID NOT FORGET THE RECORD!        ${NC}"
  echo -e "${GREEN}Data survived container teardown thanks to named volume:       ${NC}"
  echo -e "${GREEN}'postgres_data -> /var/lib/postgresql/data'                   ${NC}"
  echo -e "${GREEN}================================================================${NC}"
  docker exec -i $DB_CONTAINER psql -U "$DB_USER" -d "$DB_NAME" -c \
    "SELECT id, title, author, category, created_at FROM announcements WHERE title = '$TEST_TITLE';"
  exit 0
else
  echo -e "${RED}================================================================${NC}"
  echo -e "${RED}❌ TEST FAILED: The database forgot the record!               ${NC}"
  echo -e "${RED}Ephemeral storage detected (No persistent volume configured).   ${NC}"
  echo -e "${RED}================================================================${NC}"
  exit 1
fi
