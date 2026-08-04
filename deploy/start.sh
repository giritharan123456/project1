#!/usr/bin/env bash
set -uo pipefail

DB_PASSWORD="${DB_PASSWORD:-ConnectlyLocal@123}"
MYSQL_DIR="${MYSQL_DIR:-/var/lib/mysql}"
SOCKET=/tmp/mysqld.sock
PIDFILE=/tmp/mysqld.pid

mkdir -p /run/mysqld
chown mysql:mysql /run/mysqld 2>/dev/null || true

if [ ! -d "$MYSQL_DIR/mysql" ]; then
  echo "[db] initializing data directory"
  mariadb-install-db --no-defaults --user=mysql --datadir="$MYSQL_DIR" --auth-root-authentication-method=normal --skip-test-db >/tmp/initdb.log 2>&1
fi

echo "[db] starting mariadbd"
mariadbd --user=mysql --datadir="$MYSQL_DIR" --socket="$SOCKET" --pid-file="$PIDFILE" --port=3306 --bind-address=127.0.0.1 --skip-networking=0 --innodb-use-native-aio=0 --innodb-buffer-pool-size=64M --performance_schema=OFF --skip-log-bin >/tmp/mysqld.log 2>&1 &
MARIADB_PID=$!

setup_db() {
  local found=0
  for i in $(seq 1 360); do
    if timeout 15 mariadb-admin --socket="$SOCKET" -uroot ping >/dev/null 2>&1; then
      found=1
      echo "[db] mariadbd is up after ${i}s"
      break
    fi
    if ! kill -0 "$MARIADB_PID" 2>/dev/null; then
      echo "[db] mariadbd exited early:"
      cat /tmp/mysqld.log
      return 1
    fi
    sleep 1
  done
  if [ "$found" -eq 0 ]; then
    echo "[db] mariadbd never became ready:"
    cat /tmp/mysqld.log
    return 1
  fi

  timeout 30 mariadb --socket="$SOCKET" -uroot <<SQL
CREATE DATABASE IF NOT EXISTS connectly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'connectly'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS 'connectly'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON connectly.* TO 'connectly'@'127.0.0.1';
GRANT ALL PRIVILEGES ON connectly.* TO 'connectly'@'localhost';
FLUSH PRIVILEGES;
SQL

  TABLES=$(timeout 15 mariadb -h127.0.0.1 -P3306 -uconnectly -p"${DB_PASSWORD}" connectly -N -e "SHOW TABLES" 2>/dev/null | grep -c . || true)
  if [ "${TABLES:-0}" -eq 0 ]; then
    echo "[db] applying schema"
    timeout 60 mariadb -h127.0.0.1 -P3306 -uconnectly -p"${DB_PASSWORD}" < backend/sql/schema.sql
    echo "[db] seeding"
    (cd backend && DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=connectly DB_PASSWORD="${DB_PASSWORD}" DB_NAME=connectly timeout 120 node sql/seed.js)
  fi
  echo "[db] ready"
}

setup_db &
echo "[db] setup running in background, starting backend"
exec env DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=connectly DB_PASSWORD="${DB_PASSWORD}" DB_NAME=connectly node backend/server.js
