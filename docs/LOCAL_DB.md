1. Создать контейнер для Postgres

```
docker compose up -d postgres_attractions
```

2. Заменить переменную в файле .env

```
DB_DATABASE_URL="postgresql://postgres_user:postgres_password_123@localhost:5433/postgres_db"
```

3. Накатить базу из конфига prisma

```
yarn prisma migrate dev --name init
```

4. Импортировать данные

```
docker cp .seed/users.csv attractions-app-postgres_attractions-1:/tmp/
docker cp .seed/groups.csv attractions-app-postgres_attractions-1:/tmp/
docker cp .seed/attractions.csv attractions-app-postgres_attractions-1:/tmp/

docker exec attractions-app-postgres_attractions-1 psql -U postgres_user -d postgres_db -c "COPY \"User\" FROM '/tmp/users.csv' WITH (FORMAT CSV, HEADER); COPY \"Group\" (id, \"userId\", name, description, coordinates, zoom, \"createdAt\", \"updatedAt\", tag) FROM '/tmp/groups.csv' WITH (FORMAT CSV, HEADER); COPY \"Attraction\" (id,\"groupId\",name,category,\"imageUrl\",description,\"createdAt\",\"updatedAt\",coordinates,\"isFavorite\",\"isVisited\",notes,\"order\",\"yaMapUrl\",\"userId\") FROM '/tmp/attractions.csv' WITH (FORMAT CSV, HEADER);"
```
