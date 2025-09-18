#!/bin/bash

# Скрипт для автоматического развертывания приложения в Yandex Cloud.

# Выход при любой ошибке
set -e

# Определяем команду base64 для кодирования без переноса строк в зависимости от ОС
if [[ "$(uname)" == "Darwin" ]]; then
  # macOS
  BASE64_ENCODE="base64 -b 0"
else
  # Linux
  BASE64_ENCODE="base64 -w 0"
fi

# --- ЗАГРУЗКА ПЕРЕМЕННЫХ --- #
if [ -f .env.deploy ]; then
  echo "### Загрузка переменных из .env.deploy..."
  # Создаем временный "чистый" .env файл, чтобы избежать проблем с \r, BOM и комментариями.
  # Это самый надежный способ.
  CLEAN_ENV_FILE=$(mktemp)
  # Удаляем BOM (если есть), \r, комментарии и пустые строки
  sed '1s/^\xEF\xBB\xBF//' .env.deploy | tr -d '\r' | grep -v '^\s*#' | sed 's/[[:space:]]*#.*$//' | grep -v '^\s*$' > "${CLEAN_ENV_FILE}"

  # Используем set -a и source для надежной загрузки переменных из чистого файла.
  set -a
  source "${CLEAN_ENV_FILE}"
  set +a

  # Удаляем временный файл
  rm "${CLEAN_ENV_FILE}"
else
  echo "!!! ОШИБКА: Файл .env.deploy не найден."
  echo "!!! Пожалуйста, создайте его из .env.deploy.example и заполните значения."
  exit 1
fi

# Получаем имя проекта из URL для перехода в нужную директорию
PROJECT_DIR=$(basename -s .git "${GIT_REPO_URL}")

# --- СОЗДАНИЕ ВМ --- #
echo "### Создание виртуальной машины '${VM_NAME}'..."
yc compute instance create \
  --name "${VM_NAME}" \
  --hostname "${VM_NAME}" \
  --memory=2 \
  --cores=2 \
  --zone ru-central1-a \
  --network-interface subnet-name=default-ru-central1-a,nat-ip-version=ipv4 \
  --create-boot-disk image-folder-id=standard-images,image-family=ubuntu-2204-lts,size=10 \
  --service-account-name "${SA_NAME}" \
  --metadata "ssh-keys=${VM_USER}:$(cat "${SSH_KEY_PATH}")"

# Небольшая пауза, чтобы ВМ успела инициализироваться и получить IP
echo "### Ожидание назначения IP-адреса..."
sleep 15

# Получаем публичный IP-адрес созданной ВМ
VM_PUBLIC_IP=$(yc compute instance get --name ${VM_NAME} --format=json | jq -r '.network_interfaces[0].primary_v4_address.one_to_one_nat.address')

# Проверка, что IP-адрес получен
if [ "${VM_PUBLIC_IP}" = "null" ] || [ -z "${VM_PUBLIC_IP}" ]; then
  echo "!!! ОШИБКА: Не удалось получить публичный IP-адрес для ВМ '${VM_NAME}'."
  echo "!!! Проверьте квоты в Yandex Cloud или удалите ВМ вручную ('yc compute instance delete ${VM_NAME}') и попробуйте снова."
  exit 1
fi

echo "### ВМ создана. Публичный IP-адрес: ${VM_PUBLIC_IP}"
echo "### Ожидание ~45 секунд для полной загрузки ВМ и запуска SSH-сервера..."
sleep 45

# Готовим переменные окружения для безопасной передачи на сервер
APP_ENV_CONTENT=$(grep -vE '^(VM_NAME|SA_NAME|GIT_REPO_URL|SSH_KEY_PATH|VM_USER)' .env.deploy | sed 's/[[:space:]]*#.*$//' | grep -v '^\s*$' | tr -d '\r' | ${BASE64_ENCODE})

# --- НАСТРОЙКА СЕРВЕРА И ДЕПЛОЙ --- #
echo "### Подключение к ВМ и запуск настройки..."
ssh -o "StrictHostKeyChecking no" ${VM_USER}@${VM_PUBLIC_IP} \
  "GIT_REPO_URL='${GIT_REPO_URL}' PROJECT_DIR='${PROJECT_DIR}' APP_ENV_CONTENT='${APP_ENV_CONTENT}' bash -s" \
  << 'EOF'
  # Выход при любой ошибке внутри SSH сессии
  set -e

  echo "### Обновление пакетов..."
  sudo apt update && sudo apt upgrade -y

  echo "### Установка Docker, Docker Compose, Git и YC CLI..."
  sudo apt install -y apt-transport-https ca-certificates curl software-properties-common git jq lsb-release
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
  curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
  # Добавляем yc в PATH для текущей сессии
  export PATH="/home/${USER}/yandex-cloud/bin:$PATH"
  sudo apt update
  sudo apt install -y docker-ce
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker ${USER}
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose

  echo "### Клонирование репозитория..."
  git clone "${GIT_REPO_URL}"
  cd "${PROJECT_DIR}"

  echo "### Создание .env файла на сервере..."
  echo "${APP_ENV_CONTENT}" | base64 -d > .env

  echo "### Первоначальная настройка сервера завершена!"
  echo "### Теперь необходимо настроить секреты в GitHub и на сервере."
EOF

# --- ИНСТРУКЦИИ ДЛЯ ПОЛЬЗОВАТЕЛЯ --- #
echo "================================================================"
echo "СКРИПТ ЗАВЕРШЕН. НЕОБХОДИМЫ СЛЕДУЮЩИЕ РУЧНЫЕ ДЕЙСТВИЯ:"
echo "================================================================"
echo "1. Настройте CI/CD: Добавьте необходимые секреты в ваш GitHub-репозиторий (см. yandex_cloud_deployment.md)."
echo ""
echo "2. Настройте DNS: Создайте A-запись для вашего домена, указывающую на IP: ${VM_PUBLIC_IP}"
echo ""
echo "3. Запустите первый деплой: Сделайте коммит и пуш в ветку 'main'."
echo ""
echo "4. Настройте SSL: После первого успешного деплоя и настройки DNS, подключитесь к ВМ и выполните:"
echo "   ssh ${VM_USER}@${VM_PUBLIC_IP}"
echo "   sudo apt install -y certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d ВАШ_ДОМЕН"
echo "================================================================"
