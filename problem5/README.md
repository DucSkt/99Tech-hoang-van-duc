# Problem 5: CRUD Server

Express + TypeScript + SQLite CRUD API.

## Run

```bash
npm install
npm run dev
```

Server: `http://127.0.0.1:3000`

SQLite DB is created automatically at `./data/resources.db`.

Delete uses soft delete: records stay in the database with `deleted_at` set, and normal read/list/update APIs ignore deleted records.

Create supports `Idempotency-Key` to avoid duplicate records when the client retries the same request. The key is stored in SQLite table `idempotency_keys` with the created `resource_id`; the same key returns the original resource instead of creating a new one.

## Test

```bash
npm test
npm run build
```

## API

- `POST /resources`
- `GET /resources?q=demo&status=active&page=1&limit=20`
- `GET /resources?q=demo&status=active&cursor=<cursor>&limit=20`
- `GET /resources/:id`
- `PUT /resources/:id`
- `DELETE /resources/:id`

## Curl

Create:

```bash
curl -X POST http://127.0.0.1:3000/resources \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: <unique-request-id>" \
  -d '{"name":"Demo Resource","description":"Created by curl","status":"active"}'
```

Use the same `Idempotency-Key` when retrying the same create request. The API returns the original resource instead of creating a duplicate.

List:

```bash
curl "http://127.0.0.1:3000/resources?q=Demo&status=active&page=1&limit=20"
```

Use `page` and `limit` for normal admin-style pagination with total count.

List with cursor:

```bash
curl "http://127.0.0.1:3000/resources?q=Demo&status=active&cursor=<cursor-from-list-response>&limit=20"
```

Use `cursor` for load-more or infinite-scroll screens. The cursor value comes from `data.pagination.nextCursor` in the previous list response.

Get detail:

```bash
curl http://127.0.0.1:3000/resources/<resource-id>
```

Update:

```bash
curl -X PUT http://127.0.0.1:3000/resources/<resource-id> \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated by curl"}'
```

Delete:

```bash
curl -X DELETE http://127.0.0.1:3000/resources/<resource-id>
```

## Postman

Import [postman_collection.json](./postman_collection.json).

Run `Create Resource` first. It saves the created `id` for get/update/delete requests.

The collection also includes `List Resources With Cursor`.

`q` is prefix search on `name`.

## Improvement

Add authentication tokens to every API. After that, update/delete should only allow the owner of that token to modify their own resources, not another user's data.
