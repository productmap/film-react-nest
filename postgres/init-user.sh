#!/bin/bash
set -e

# Этот скрипт выполняется при первом запуске контейнера PostgreSQL.
# Он создает нового пользователя и базу данных, используя переменные окружения.

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Создание пользователя (роли) из переменных окружения
    CREATE USER "$DB_USER" WITH PASSWORD '$DB_PASSWORD';

    -- Создание базы данных из переменных окружения
    CREATE DATABASE "$DB_NAME" WITH OWNER = "$DB_USER";

    -- Предоставление всех прав пользователю на созданную базу данных
    GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_USER";
EOSQL

# Теперь, когда база данных $DB_NAME создана, выполняем для нее скрипт prac.init.sql
# Скрипт выполняется от имени нового пользователя $DB_USER для созданной им базы
echo "Loading data into $DB_NAME from prac.init.sql"
psql -v ON_ERROR_STOP=1 --username "$DB_USER" --dbname "$DB_NAME" -f /docker-entrypoint-initdb.d/prac.init.sql
