import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

test('GET /api/health returns healthy API', async () => {
  const res = await request(createApp()).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});

test('protected booking endpoint rejects anonymous requests', async () => {
  const res = await request(createApp()).get('/api/bookings/my');
  assert.equal(res.status, 401);
});

test('passport cleanup rejects anonymous requests', async () => {
  const res = await request(createApp()).post('/api/passports/cleanup');
  assert.equal(res.status, 401);
});

test('admin CRUD listing rejects anonymous requests', async () => {
  const res = await request(createApp()).get('/api/packages/admin/all');
  assert.equal(res.status, 401);
});

test('AI endpoint validates message length before calling external services', async () => {
  const res = await request(createApp())
    .post('/api/ai/chat')
    .send({ message: 'a'.repeat(1201) });
  assert.equal(res.status, 400);
});
