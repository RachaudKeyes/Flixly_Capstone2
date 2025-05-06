"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

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

/************************************** POST /users */

describe("POST /users", function () {
  test("works for admins: create non-admin", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          profileImage: "newImage.jpg",
          isAdmin: false,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        profileImage: "newImage.jpg",
        isAdmin: false,
      }, token: expect.any(String),
    });
  });

  test("works for admins: create admin", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          profileImage: "newImage.jpg",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        profileImage: "newImage.jpg",
        isAdmin: true,
      }, token: expect.any(String),
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          profileImage: "newImage.jpg",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          profileImage: "newImage.jpg",
          isAdmin: true,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "not-an-email",
          profileImage: "newImage.jpg",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /users */

describe("GET /users", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      users: [
        {
          username: "u1",
          firstName: "U1F",
          lastName: "U1L",
          email: "user1@user.com",
          profileImage: "sampleImage1.jpg",
          isAdmin: false,
        },
        {
          username: "u2",
          firstName: "U2F",
          lastName: "U2L",
          email: "user2@user.com",
          profileImage: "sampleImage2.jpg",
          isAdmin: false,
        },
        {
          username: "u3",
          firstName: "U3F",
          lastName: "U3L",
          email: "user3@user.com",
          profileImage: "sampleImage3.jpg",
          isAdmin: false,
        },
      ],
    });
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get("/users");
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /users/:userId */

describe("GET /users/:userId", function () {
  test("works for admin", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        id: u1Id,
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        profileImage: "sampleImage1.jpg",
        isAdmin: false,
      },
    });
  });

  test("works for same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        id: u1Id,
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        profileImage: "sampleImage1.jpg",
        isAdmin: false,
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
        .get(`/users/${u1Id}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get(`/users/${u1Id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
        .get(`/users/9999999`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /users/:userId */

describe("PATCH /users/:userId", () => {
  test("works for admins", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .patch(`/users/${u1Id}`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        id: u1Id,
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        profileImage: "sampleImage1.jpg",
        isAdmin: false,
      },
    });
  });

  test("works for same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .patch(`/users/${u1Id}`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        id: u1Id,
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        profileImage: "sampleImage1.jpg",
        isAdmin: false,
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
        .patch(`/users/${u1Id}`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/users/${u1Id}`)
        .send({
          firstName: "New",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
        .patch(`/users/9999999`)
        .send({
          firstName: "Nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .patch(`/users/${u1Id}`)
        .send({
          firstName: 42,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("works: can set new password", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .patch(`/users/${u1Id}`)
        .send({
          password: "new-password",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        id: u1Id,
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        profileImage: "sampleImage1.jpg",
        isAdmin: false,
      },
    });
    const isSuccessful = await User.authenticate("u1", "new-password");
    expect(isSuccessful).toBeTruthy();
  });
});

/************************************** DELETE /users/:userId */

describe("DELETE /users/:userId", function () {
  test("works for admin", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .delete(`/users/${u1Id}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: u1Id });
  });

  test("works for same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .delete(`/users/${u1Id}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: u1Id });
  });

  test("unauth if not same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .delete(`/users/${u1Id}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .delete(`/users/${u1Id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
        .delete(`/users/9999999`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PUT /users/:userId/favorites */

describe("PUT /users/:userId/favorites", function () {
  test("works for admins", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .put(`/users/${u1Id}/favorites`)
        .send({
          movieId: 324544
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ isFavorite: true });

    // toggle again
    const resp2 = await request(app)
        .put(`/users/${u1Id}/favorites`)
        .send({
          movieId: 324544
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp2.body).toEqual({ isFavorite: false });
  });

  test("works for same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .put(`/users/${u1Id}/favorites`)
        .send({
          movieId: 324544
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ isFavorite: true });

    // toggle again
    const resp2 = await request(app)
        .put(`/users/${u1Id}/favorites`)
        .send({
          movieId: 324544
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp2.body).toEqual({ isFavorite: false });
  });

  test("unauth if not same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .put(`/users/${u1Id}/favorites`)
        .send({
          movieId: 324544
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .put(`/users/${u1Id}/favorites`)
        .send({
          movieId: 324544
        })
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
        .put(`/users/99999/favorites`)
        .send({
          movieId: 324544
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if missing data", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .put(`/users/${u1Id}/favorites`)
        .send({})
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /users/:userId/isFavorite */

describe("GET /users/:userId/isFavorite", function () {
  test("works for admins", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/isFavorite`)
        .query({ movieId: 668489 })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ isFavorite: true });
  })

  test("works for same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/isFavorite`)
        .query({ movieId: 668489 })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ isFavorite: true });
  })

  test("unauth if not same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/isFavorite`)
        .query({ movieId: 668489 })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/isFavorite`)
        .query({ movieId: 668489 })
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/99999/isFavorite`)
        .query({ movieId: 668489 })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if missing data", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/isFavorite`)
        .query({})
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /users/:userId/favorites */

describe("GET /users/:userId/favorites", function () {
  test("works for admins", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/favorites`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body.favorites.length).toEqual(2);
  })

  test("works for same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/favorites`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body.favorites.length).toEqual(2);
  })

  test("unauth if not same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/favorites`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/favorites`)
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
        .get(`/users/99999/favorites`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** GET /users/:userId/rating */

describe("GET /users/:userId/rating", function () {
  test("works for admins", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/rating`)
        .query({ movieId: 668489 })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body.rating).toEqual(
      { id: expect.any(number),
        userId: u1Id,
        movieId: 668489,
        rating: 4.5
      });
  })

  test("works for same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/rating`)
        .query({ movieId: 668489 })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body.rating).toEqual(
      { id: expect.any(number),
        userId: u1Id,
        movieId: 668489,
        rating: 4.5
      });
  })

  test("unauth if not same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/rating`)
        .query({ movieId: 668489 })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/rating`)
        .query({ movieId: 668489 })
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
        .get(`/users/9999/rating`)
        .query({ movieId: 668489 })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if missing data", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .get(`/users/${u1Id}/rating`)
        .query({})
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** PATCH /users/:userId/rating */

describe("PATCH /users/:userId/rating", function () {
  test("works for admins", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .patch(`/users/${u1Id}/rating`)
        .send({ movieId: 668489, rating: 4 })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body.rating).toEqual(
      { id: expect.any(number),
        userId: u1Id,
        movieId: 668489,
        rating: 4
      });
  })

  test("works for same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .patch(`/users/${u1Id}/rating`)
        .send({ movieId: 668489, rating: 4 })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body.rating).toEqual(
      { id: expect.any(number),
        userId: u1Id,
        movieId: 668489,
        rating: 4
      });
  })

  test("unauth if not same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .patch(`/users/${u1Id}/rating`)
        .send({ movieId: 668489, rating: 4 })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .patch(`/users/${u1Id}/rating`)
        .send({ movieId: 668489, rating: 4 })
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
        .patch(`/users/9999/rating`)
        .send({ movieId: 668489, rating: 4 })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if missing data", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .patch(`/users/${u1Id}/rating`)
        .send({})
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /users/:userId/rating */

describe("DELETE /users/:userId/rating", function () {
  test("works for admins", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .delete(`/users/${u1Id}/rating`)
        .send({ movieId: 668489 })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "rating" });
  })

  test("works for same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .delete(`/users/${u1Id}/rating`)
        .send({ movieId: 668489 })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "rating" });
  })

  test("unauth if not same user", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .delete(`/users/${u1Id}/rating`)
        .send({ movieId: 668489 })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .delete(`/users/${u1Id}/rating`)
        .send({ movieId: 668489 })
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
        .delete(`/users/9999/rating`)
        .send({ movieId: 668489 })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if missing data", async function () {
    const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
    const u1Id = u1IdResp.rows[0].id;
    const resp = await request(app)
        .delete(`/users/${u1Id}/rating`)
        .send({})
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});