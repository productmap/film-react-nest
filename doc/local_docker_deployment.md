# Локальный запуск в Docker

### Шаг 1: Клонируйте репозиторий

```shell
git clone https://github.com/productmap/film-react-nest.git
```

### Шаг 2: Перейдите в корневую директорию проекта

```shell
cd film-react-nest
```

### Шаг 3: Создайте и настройте файл `.env`

Скопируйте файл с примером переменных окружения:
```shell
cp .env.local .env
```

### Шаг 4: Запустите Docker контейнеры

```shell
docker-compose up -d
```

### Шаг 5: Проверка

После выполнения команды приложение будет доступно по адресу `http://localhost`.
