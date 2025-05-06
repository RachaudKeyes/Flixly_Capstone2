const bcrypt = require("bcrypt");
const db = require("../db.js");

const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM movies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query(`
        INSERT INTO users (username,
                           password,
                           first_name,
                           last_name,
                           email,
                           profile_image,
                           is_admin)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com', 'sampleImage1.jpg', false),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com', 'sampleImage2.jpg', false)
        RETURNING id`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);
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


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};