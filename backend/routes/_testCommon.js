"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Rating = require("../models/rating");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM movies");

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    profileImage: "sampleImage1.jpg",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    profileImage: "sampleImage2.jpg",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    profileImage: "sampleImage3.jpg",
    isAdmin: false,
  });

  // admin
  await db.query(`INSERT INTO users (username, first_name, last_name, email, password, profile_image, is_admin)
                  VALUES ("admin", "AdminF", "AdminL", "admin@admin.com", "adminpassord", "adminImage.jpg", true)`);

  // add movies to u1
  const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
  const u1Id = u1IdResp.rows[0].id; 
  await User.toggleFavorite(u1Id, 668489); 
  await User.toggleFavorite(u1Id, 1197306); 

  // add ratings to u1
  await Rating.create({ userId: u1Id, movieId: 668489, rating: 4.5 });
  await Rating.create({ userId: u1Id, movieId: 1197306, rating: 2.5 });
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1IdResp = await db.query(`SELECT id FROM users where username = "u1"`);
const u1Id = u1IdResp.rows[0].id;
const u2IdResp = await db.query(`SELECT id FROM users where username = "u2"`);
const u2Id = u2IdResp.rows[0].id;
const adminIdResp = await db.query(`SELECT id FROM users where username = "admin"`);
const adminId = adminIdResp.rows[0].id;

const u1Token = createToken({ userId: u1Id, username: "u1", isAdmin: false });
const u2Token = createToken({ userId: u2Id, username: "u2", isAdmin: false });
const adminToken = createToken({ userId: adminId, username: "admin", isAdmin: true });


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
};
