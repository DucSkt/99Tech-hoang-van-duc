import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";

import { createApp } from "../src/app.js";

test("resource API supports CRUD and filters", async () => {
  const handle = createApp({ databasePath: ":memory:" });

  try {
    const api = request(handle.app);

    await api.get("/health").expect(200);
    await api.get("/health/ready").expect(200);

    const created = await api
      .post("/resources")
      .send({
        name: "Laptop",
        description: "Office machine",
        status: "active"
      })
      .expect(201);

    const id = created.body.data.id as string;
    assert.match(id, /^[0-9a-f-]{36}$/);
    assert.equal(created.body.data.name, "Laptop");

    await api
      .post("/resources")
      .send({
        name: "Monitor",
        description: "lap keyword only in description",
        status: "active"
      })
      .expect(201);

    const list = await api.get("/resources?q=lap&status=active").expect(200);
    assert.equal(list.body.success, true);
    assert.equal(list.body.data.pagination.total, 1);
    assert.equal(list.body.data.pagination.mode, "page");
    assert.equal(list.body.data.items[0].id, id);

    const detail = await api.get(`/resources/${id}`).expect(200);
    assert.equal(detail.body.data.description, "Office machine");

    const updated = await api
      .put(`/resources/${id}`)
      .send({ status: "inactive" })
      .expect(200);

    assert.equal(updated.body.data.status, "inactive");
    assert.equal(updated.body.data.name, "Laptop");

    await api.delete(`/resources/${id}`).expect(204);
    await api.get(`/resources/${id}`).expect(404);

    const afterDeleteList = await api.get("/resources?q=lap").expect(200);
    assert.equal(afterDeleteList.body.data.pagination.total, 0);

    const storedRow = handle.db
      .prepare("SELECT id, deleted_at FROM resources WHERE id = ?")
      .get(id) as { id: string; deleted_at: string | null };

    assert.equal(storedRow.id, id);
    assert.equal(typeof storedRow.deleted_at, "string");
  } finally {
    handle.close();
  }
});

test("resource API supports cursor pagination", async () => {
  const handle = createApp({ databasePath: ":memory:" });

  try {
    const api = request(handle.app);

    for (const name of ["Cursor A", "Cursor B", "Cursor C"]) {
      await api.post("/resources").send({ name }).expect(201);
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    const pageOne = await api.get("/resources?q=Cursor&limit=2").expect(200);
    assert.equal(pageOne.body.data.items.length, 2);
    assert.equal(pageOne.body.data.pagination.mode, "page");
    assert.equal(pageOne.body.data.pagination.hasMore, true);

    const cursor = pageOne.body.data.pagination.nextCursor;
    assert.equal(typeof cursor, "string");

    const pageTwo = await api
      .get(`/resources?q=Cursor&limit=2&cursor=${encodeURIComponent(cursor)}`)
      .expect(200);

    assert.equal(pageTwo.body.data.pagination.mode, "cursor");
    assert.equal(pageTwo.body.data.items.length, 1);
    assert.equal(pageTwo.body.data.pagination.hasMore, false);

    const badCursor = await api.get("/resources?cursor=bad").expect(400);
    assert.equal(badCursor.body.error.code, "VALIDATION_ERROR");
  } finally {
    handle.close();
  }
});

test("resource API prevents duplicate create retries with Idempotency-Key", async () => {
  const handle = createApp({ databasePath: ":memory:" });

  try {
    const api = request(handle.app);
    const idempotencyKey = "8b79c8fd-3fd4-40c6-b2fa-9d277a9d353f";
    const payload = {
      name: "Retry Safe Resource",
      description: "Created once",
      status: "active"
    };

    const first = await api
      .post("/resources")
      .set("Idempotency-Key", idempotencyKey)
      .send(payload)
      .expect(201);

    const second = await api
      .post("/resources")
      .set("Idempotency-Key", idempotencyKey)
      .send(payload)
      .expect(200);

    assert.equal(second.body.data.id, first.body.data.id);
    assert.equal(second.body.idempotent, true);

    const rows = handle.db
      .prepare("SELECT COUNT(*) AS total FROM resources")
      .get() as { total: number };

    assert.equal(rows.total, 1);
  } finally {
    handle.close();
  }
});

test("resource API validates input", async () => {
  const handle = createApp({ databasePath: ":memory:" });

  try {
    const api = request(handle.app);

    const emptyName = await api.post("/resources").send({ name: "" }).expect(400);
    assert.equal(emptyName.body.error.code, "VALIDATION_ERROR");

    const emptyPatch = await api
      .put("/resources/00000000-0000-4000-8000-000000000000")
      .send({})
      .expect(400);
    assert.equal(emptyPatch.body.error.code, "VALIDATION_ERROR");

    const badId = await api.get("/resources/not-a-uuid").expect(400);
    assert.equal(badId.body.error.code, "VALIDATION_ERROR");
  } finally {
    handle.close();
  }
});
