"use strict";

const { NotFoundError, BadRequestError } = require("../expressError.js");
const db = require("../db.js");
const Rating = require("./rating.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon.js");
const { findAll } = require("./user.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create Rating", function () {
  test("works", async function () {
    const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const userId = userIdResp.rows[0].id;
    const movieId = 1197306;

    const resp = await Rating.create({ userId: userId, movieId: movieId, rating: 4.5 });
    expect(resp.userId).toEqual(userId);
    expect(resp.rating).toEqual(4.5);
  });

  test("rating already exists", async function () {
    try {
      const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
      const userId = userIdResp.rows[0].id;
      const movieId = 1197306;
      await Rating.create({ userId, movieId, rating: 4.5 });
      await Rating.create({ userId, movieId, rating: 2.5 });
      findAll();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("not found if no such user", async function () {
    try {
      const movieId = 1197306;
      await Rating.create({ userId: 99999, movieId, rating: 4.5 });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


