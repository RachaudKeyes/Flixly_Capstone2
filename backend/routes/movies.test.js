"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  u2Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** GET /movies */

describe("GET /movies", function () {
  test("works for user with token", async function () {
    const resp = await request(app)
        .get("/movies")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body.movies).toBeInstanceOf(Array);
    expect(resp.body.movies.length).toEqual(20);
  });

  test("works: by query param", async function () {
    const resp = await request(app)
        .get("/movies")
        .query({ query: "The King" })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body.movies).toBeInstanceOf(Array);
    expect(resp.body.movies.length).toBeGreaterThan(0);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get("/movies")
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /movies/:movieId */

describe("GET /movies/:movieId", function () {
  test("works for user with token", async function () {
    const resp = await request(app)
        .get(`/movies/668489`)
        .set("authorization", `Bearer ${u1Token}`);
    // some properties to prove it worked
    expect(resp.body.id).toEqual(movieId);
    expect(resp.body.title).toEqual("Havoc");
    expect(resp.body.tagline).toEqual("No law. Only disorder.");
    expect(resp.body.release_date).toEqual("2025-04-24");
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get(`/movies/668489`)
    expect(resp.statusCode).toEqual(401);
  });

});

/************************************** GET /movies/:movieId/play */

describe("GET /movies/:movieId/play", function () {
  test("works for user with token", async function () {
    const resp = await request(app)
        .get(`/movies/668489/play`)
        .set("authorization", `Bearer ${u1Token}`);
    // some properties to prove it worked
    expect(resp.body.site).toEqual("YouTube");
    expect(resp.body.name).toEqual("Tom Hardy and Gareth Evans break down brutal fight scene from Havoc - Shot by Shot");
    expect(resp.body.key).toEqual("_824u8P3tj8");
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get(`/movies/668489/play`)
    expect(resp.statusCode).toEqual(401);
  });
});