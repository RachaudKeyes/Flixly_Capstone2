"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      id: expect.any(Number),
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      profileImage: 'sampleImage1.jpg',
      isAdmin: false,
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("c1", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", function () {
  const newUser = {
    username: "new",
    firstName: "Test",
    lastName: "Tester",
    email: "test@test.com",
    profileImage: 'testImage.jpg',
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
      isAdmin: false
    });
    expect(user).toEqual({ ...newUser, 
                           id: expect.any(Number), 
                           isAdmin: false });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("works: adds admin", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
      isAdmin: true,
    });
    expect(user).toEqual({ ...newUser, 
                           id: expect.any(Number), 
                           isAdmin: true });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
        isAdmin: false
      });
      await User.register({
        ...newUser,
        password: "password",
        isAdmin: false
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
      {
        id: expect.any(Number),
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "u1@email.com",
        profileImage: "sampleImage1.jpg",
        isAdmin: false,
      },
      {
        id: expect.any(Number),
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "u2@email.com",
        profileImage: "sampleImage2.jpg",
        isAdmin: false,
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const userId = userIdResp.rows[0].id;
    let user = await User.get(userId);
    expect(user).toEqual({
      id: userId,
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      profileImage: "sampleImage1.jpg",
      isAdmin: false,
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get(9999999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    firstName: "NewF",
    lastName: "NewF",
    email: "new@email.com",
    profileImage: "newImage.jpg",
    isAdmin: false,
  };

  test("works", async function () {
    const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const userId = userIdResp.rows[0].id;
    let resp = await User.update(userId, updateData);
    expect(resp).toEqual({
      id: expect.any(Number),
      username: "u1",
      ...updateData,
    });
  });

  test("works: set password", async function () {
    const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const userId = userIdResp.rows[0].id;
    let resp = await User.update(userId, {
      password: "newPassword",
    });
    expect(resp).toEqual({
      id: userId,
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      profileImage: "sampleImage1.jpg",
      isAdmin: false,
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("not found if no such user", async function () {
    try {
      await User.update(99999, {
        firstName: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    expect.assertions(1);
    try {
      const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
      const userId = userIdResp.rows[0].id;
      await User.update(userId, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const userId = userIdResp.rows[0].id;
    await User.remove(userId);
    const res = await db.query(
        "SELECT * FROM users WHERE username='u1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove(99999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** toggleFavorite AND isFavorite */

describe("toggleFavorite", function() {
  test("works", async function () {
    const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const userId = userIdResp.rows[0].id;
    const movieId = 1197306;
    await User.toggleFavorite(userId, movieId);
    const res = await db.query(
      `SELECT * FROM favorites f
       JOIN movies m ON m.id = f.movie_Id 
       WHERE user_id = ${userId} AND m.movie_id_api = ${movieId}`);
    expect(res.rows.length).toEqual(1);
    expect(res.rows[0].is_favorite).toBe(true);

    // can check isFavorite as well
    let resFav = await User.isFavorite(userId, movieId);
    expect(resFav).toBe(true);

    // toggle again, is_favorite will be false;
    await User.toggleFavorite(userId, movieId);
    const res2 = await db.query(
      `SELECT * FROM favorites f
       JOIN movies m ON m.id = f.movie_Id 
       WHERE user_id = ${userId} AND m.movie_id_api = ${movieId}`);
       expect(res2.rows.length).toEqual(1);
       expect(res2.rows[0].is_favorite).toBe(false);

    // can check isFavorite as well
    let resFav2 = await User.isFavorite(userId, movieId);
    expect(resFav2).toBe(false);
  })

  test("not found if no such user", async function () {
    try {
      const movieId = 1197306;
      await User.toggleFavorite(99999, movieId);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
})

/************************************** allFavorites */

describe("allFavorites", function() {
  test("works", async function () {
    const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const userId = userIdResp.rows[0].id;
    const movieId1 = 1197306;
    const movieId2 = 668489;
    await User.toggleFavorite(userId, movieId1);
    await User.toggleFavorite(userId, movieId2);
    let resp = await User.allFavorites(userId);
    expect(resp).toBeInstanceOf(Array);
    expect(resp.length).toEqual(2);
  })

  test("no favorites", async function() {
    const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const userId = userIdResp.rows[0].id;
    let resp = await User.allFavorites(userId);
    expect(resp).toEqual([]);
  })

  test("not found if no such user", async function () {
    try {
      await User.allFavorites(999999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
})

/************************************** getRating */

describe("getRating", function() {
  test("works", async function() {
    const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const userId = userIdResp.rows[0].id;
    const movieId = 1197306;
    // add movie to db
    await db.query(
          `INSERT INTO movies (movie_id_api)
           VALUES (${movieId})`);
    // add rating
    await db.query(
         `INSERT INTO ratings (movie_id, user_id, rating)
          SELECT m.id, ${userId}, 4.5
          FROM movies m
          WHERE m.movie_id_api = ${movieId}
          RETURNING ratings.id, user_id AS "userId", movie_id as "movieId", rating`);

    const res = await User.getRating(userId, movieId);
    expect(res.userId).toEqual(userId);
    expect(res.rating).toEqual(4.5);
  })

  test("no rating", async function() {
    const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const userId = userIdResp.rows[0].id;
    const movieId = 1197306;
    const res = await User.getRating(userId, movieId);
    expect(res).toBe(null);
  })

  test("not found if no such user", async function () {
    try {
      const movieId = 1197306;
      await User.getRating(999999, movieId);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
})

/************************************** updateRating */

describe("updateRating", function() {
  test("works", async function () {
    const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const userId = userIdResp.rows[0].id;
    const movieId = 1197306;
    // add movie to db
    await db.query(
      `INSERT INTO movies (movie_id_api)
       VALUES (${movieId})`);
    // add rating
    await db.query(
      `INSERT INTO ratings (movie_id, user_id, rating)
          SELECT m.id, ${userId}, 4.5
          FROM movies m
          WHERE m.movie_id_api = ${movieId}
          RETURNING ratings.id, user_id AS "userId", movie_id as "movieId", rating`);

    const res = await User.updateRating(userId, movieId, 3.5);
    expect(res.userId).toEqual(userId);
    expect(res.rating).toEqual(3.5);
  })

  test("no rating exists", async function () {
    try {
      const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
      const userId = userIdResp.rows[0].id;
      const movieId = 1197306;
      await User.updateRating(userId, movieId, 3.5);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

  test("not found if no such user", async function () {
    try {
      const movieId = 1197306;
      await User.getRating(999999, movieId, 2);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
})

/************************************** removeRating */

describe("removeRating", function() {
  test("works", async function () {
    const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
    const userId = userIdResp.rows[0].id;
    const movieId = 1197306;
    // add movie to db
    await db.query(
      `INSERT INTO movies (movie_id_api)
       VALUES (${movieId})`);
    // add rating
    await db.query(
         `INSERT INTO ratings (movie_id, user_id, rating)
          SELECT m.id, ${userId}, 4.5
          FROM movies m
          WHERE m.movie_id_api = ${movieId}
          RETURNING ratings.id, user_id AS "userId", movie_id as "movieId", rating`);
    
    // rating exists
    const res = await User.getRating(userId, movieId);
    expect(res.rating).toEqual(4.5);
    
    await User.removeRating(userId, movieId);
    
    // rating has been removed
    const res2 = await User.getRating(userId, movieId);
    expect(res2).toBe(null);
  })

  test("no rating exists", async function () {
    try {
      const userIdResp = await db.query("SELECT id FROM users WHERE username = 'u1'");
      const userId = userIdResp.rows[0].id;
      const movieId = 1197306;
      await User.removeRating(userId, movieId);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

  test("not found if no such user", async function () {
    try {
      const movieId = 1197306;
      await User.removeRating(999999, movieId);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
})