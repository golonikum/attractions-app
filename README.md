# Attractions App

Приложение для создания и управления группами достопримечательностей с интерактивной картой.

## Описание проекта

Attractions App - это веб-приложение, которое позволяет пользователям:

- Создавать группы достопримечательностей
- Добавлять места на интерактивную карту
- Отмечать посещенные места
- Управлять своими коллекциями мест

## Технологии

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **База данных**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Карты**: Яндекс.Карты (ymap3-components)
- **Аутентификация**: JWT
- **Иконки**: Lucide React
- **Пакетный менеджер**: Yarn

## Начало работы

### Требования

- Node.js 18+
- Yarn

### Установка

1. Клонируйте репозиторий:

```bash
git clone https://github.com/your-username/attractions-app.git
cd attractions-app
```

2. Установите зависимости:

```bash
yarn
```

3. Получите переменные окружения из Vercel:

```bash
yarn global add vercel
vercel env pull .env.development.local
```

4. Если вы работаете локально без Vercel, создайте файл `.env` на основе `.env.example`:

```
DATABASE_URL="your_postgresql_database_url"
JWT_SECRET="your_jwt_secret"
YA_MAPS_API_KEY="your_yandex_maps_api_key"
```

5. Сгенерируйте Prisma клиент:

```bash
yarn prisma generate
```

6. Примените миграции базы данных:

```bash
yarn prisma db push
```

7. Запустите приложение в режиме разработки:

```bash
yarn dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

```
attractions-app/
├── prisma/               # Схема базы данных
├── public/               # Статические файлы
├── src/
│   ├── app/              # Страницы Next.js
│   ├── components/       # React компоненты
│   ├── contexts/         # React контексты
│   └── lib/              # Утилиты и конфигурации
├── .env                  # Переменные окружения
└── README.md             # Документация
```

## Основные компоненты

- **Navigation** - навигационная панель
- **ProtectedRoute** - компонент для защиты маршрутов
- **MarkerPin** - маркер на карте для обозначения достопримечательности
- **YMapComponents** - обертка для компонентов Яндекс.Карт

## База данных

Приложение использует PostgreSQL со следующими основными моделями:

- **User** - пользователи приложения
- **Group** - группы достопримечательностей
- **Attraction** - отдельные достопримечательности

Для работы с базой данных используется Prisma ORM. Дополнительная информация доступна в [официальной документации Prisma](https://www.prisma.io/docs/orm/reference/prisma-cli-reference).

## API

Приложение использует API Route Handlers Next.js для взаимодействия с базой данных.

## Лицензия

MIT
