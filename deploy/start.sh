#!/usr/bin/env bash
set -euo pipefail

DB_PASSWORD="${DB_PASSWORD:-ConnectlyLocal@123}"
MYSQL_DIR="${MYSQL_DIR:-/var/lib/mysql}"
SOCKET=/tmp/mysqld.sock

if [ ! -d "$MYSQL_DIR/mysql" ]; then
  echo "[db] initializing data directory"
  mariadb-install-db --user=root --datadir="$MYSQL_DIR" --auth-root-authentication-method=normal --skip-test-db >/tmp/initdb.log 2>&1 || true
fi

echo "[db] starting mariadbd"
mariadbd --user=root --datadir="$MYSQL_DIR" --socket="$SOCKET" --port=3306 --bind-address=127.0.0.1 --skip-networking=0 --innodb-buffer-pool-size=64M --performance_schema=OFF --skip-log-bin >/tmp/mysqld.log 2>&1 &
MARIADB_PID=$!

for i in $(seq 1 90); do
  if mariadb-admin --socket="$SOCKET" -uroot ping >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$MARIADB_PID" 2>/dev/null; then
    echo "[db] mariadbd exited early:"
    tail -n 40 /tmp/mysqld.log
    exit 1
  fi
  sleep 1
done

echo "[db] creating database and user"
mariadb --socket="$SOCKET" -uroot <<SQL
CREATE DATABASE IF NOT EXISTS connectly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'connectly'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS 'connectly'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON connectly.* TO 'connectly'@'127.0.0.1';
GRANT ALL PRIVILEGES ON connectly.* TO 'connectly'@'localhost';
FLUSH PRIVILEGES;
SQL

TABLES=$(mariadb -h127.0.0.1 -P3306 -uconnectly -p"${DB_PASSWORD}" connectly -N -e "SHOW TABLES" 2>/dev/null | grep -c . || true)
if [ "${TABLES:-0}" -eq 0 ]; then
  echo "[db] applying schema"
  mariadb -h127.0.0.1 -P3306 -uconnectly -p"${DB_PASSWORD}" < backend/sql/schema.sql
  echo "[db] seeding"
  (cd backend && DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=connectly DB_PASSWORD="${DB_PASSWORD}" DB_NAME=connectly node sql/seed.js)
fi

echo "[db] ready, starting backend"
exec env DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=connectly DB_PASSWORD="${DB_PASSWORD}" DB_NAME=connectly node backend/server.js
