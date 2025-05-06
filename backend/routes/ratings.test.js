"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /ratings", function () {
  test("works for admin", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .post(`/ratings`)
        .send({ userId: u1Id, movieId: 1249213, rating: 4 })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      rating: {
        id: expect.any(Number),
        userId: u1Id,
        movieId: 1249213,
        rating: 4,
      },
    });
  });

  test("works for same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .post(`/ratings`)
        .send({ userId: u1Id, movieId: 1249213, rating: 4 })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      rating: {
        id: expect.any(Number),
        userId: u1Id,
        movieId: 1249213,
        rating: 4,
      },
    });
  });

  test("unauth if not same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .post(`/ratings`)
        .send({ userId: u1Id, movieId: 1249213, rating: 4 })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .post(`/ratings`)
        .send({ userId: u1Id, movieId: 1249213, rating: 4 })
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .post(`/ratings`)
        .send({ userId: u1Id })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .post(`/ratings`)
        .send({ userId: u1Id, movieId: "not-a-number", rating: "not-a-number" })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

});

