"use strict";

const db = require("../db");
const axios = require("axios");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");
const { API_KEY } = require("../config.js")
const BASE_API_URL = "https://api.themoviedb.org/3";

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, firstName, lastName, email, profileImage, isAdmin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT id,
                  username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  profile_image AS "profileImage",
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, profileImage, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { username, password, firstName, lastName, email, profileImage, isAdmin }) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users (username,
                              password,
                              first_name,
                              last_name,
                              email,
                              profile_image,
                              is_admin)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, username, first_name AS "firstName", last_name AS "lastName", email, profile_image AS "profileImage", is_admin AS "isAdmin"`,
        [
          username,
          hashedPassword,
          firstName,
          lastName,
          email,
          profileImage,
          isAdmin,
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ id, username, firstName, lastName, email, profileImage, isAdmin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT id,
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  profile_image AS "profileImage",
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a userId, return data about user.
   *
   * Returns { id, username, firstName, lastName, email, profileImage, isAdmin }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(userId) {
    const userRes = await db.query(
          `SELECT id,
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  profile_image AS "profileImage",
                  is_admin AS "isAdmin"
           FROM users
           WHERE id = $1`,
        [userId],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`User not found: ${userId}`);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, profileImage }
   *
   * Returns { id, username, firstName, lastName, email, profileImage, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risk is opened.
   */

  static async update(userId, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    // cannot change admin status
    let userAdminStatus = await db.query(`SELECT is_admin 
                                          FROM users
                                          WHERE id = $1`, [userId]);

    if (data.isAdmin) {
      data.isAdmin = userAdminStatus.rows[0].isAdmin
    }

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name",
          profileImage: "profile_image",
          isAdmin: "is_admin"
        });
    const userIdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE id = ${userIdVarIdx} 
                      RETURNING id,
                                username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                profile_image AS "profileImage",
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, userId]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${userId}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(userId) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE id = $1
           RETURNING username`,
        [userId],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`User not found: ${userId}`);
  }

  /** Check isFavorite returns (true or false).
   *
   * - userId: current user
   * - movieId: movies id
   **/

  static async isFavorite(userId, movieId) {
    // movieId is the movie id from API
    // Check if movie is in db, if not, return false.
    // All favorite movies are in db.
    const preCheck = await db.query(
          `SELECT id, movie_id_api
           FROM movies
           WHERE movie_id_api = $1`, [movieId]);

    const movie = preCheck.rows[0];
    if (!movie) return false;

    // Check if user exists
    const preCheck2 = await db.query(
          `SELECT id
           FROM users
           WHERE id = $1`, [userId]);

    const user = preCheck2.rows[0];
    if (!user) throw new NotFoundError(`User does not exist: ${userId}`);

    // Check if is_favorite = true; If not, return false;
    const favResp = await db.query(
          `SELECT is_favorite AS "isFavorite"
           FROM favorites f
           JOIN movies m ON m.id = f.movie_id
           WHERE f.user_id = $1 AND m.movie_id_api = $2`,
           [userId, movieId]);
      
      let favorite = favResp.rows[0];

      if (!favorite) return false
      
      return favorite.isFavorite;
  }

  /** Toggle favorite (true or false): update db, returns { isFavorite }.
   *
   * - userId: current user
   * - movieId: movies id
   **/

  static async toggleFavorite(userId, movieId) {
    // movieId is the movie id from API
    // Check if movie is in db, if not, add to db
    const preCheck = await db.query(
          `SELECT id, movie_id_api
           FROM movies
           WHERE movie_id_api = $1`, 
           [movieId]);

    const movie = preCheck.rows[0];

    if (!movie) {
      await db.query(
          `INSERT INTO movies (movie_id_api)
           VALUES ($1)`,
       [movieId]);
    }

    // Check if user exists
    const preCheck2 = await db.query(
          `SELECT id
           FROM users
           WHERE id = $1`, [userId]);

    const user = preCheck2.rows[0];
    if (!user) throw new NotFoundError(`User does not exist: ${userId}`);

    // Add to db if favorite does not exist. If it does exist, toggle.
    const preCheck3 = await db.query(
          `SELECT is_favorite AS "isFavorite"
           FROM favorites f
           JOIN movies m ON m.id = f.movie_id
           WHERE f.user_id = $1 AND m.movie_id_api = $2`,
           [userId, movieId]);

    const favorite = preCheck3.rows[0];

    if (!favorite) {
      const favResp = await db.query(
          `INSERT INTO favorites (movie_id, user_id, is_favorite)
           SELECT id, $2, $3
           FROM movies
           WHERE movie_id_api = $1
           RETURNING is_favorite AS "isFavorite"`,
           [movieId, userId, true]);
      
      return favResp.rows[0];
    }
    else {
      const favResp = await db.query(
          `UPDATE favorites f
           SET is_favorite = NOT is_favorite
           FROM movies m
           WHERE f.user_id = $1 AND m.movie_id_api = $2
           RETURNING is_favorite AS "isFavorite"`,
           [userId, movieId]);

      return favResp.rows[0];
    }
  }

  /** Given a userId, return the user's favorites list.
   *
   * Returns [{ movieData }, ... ]
   *
   * Throws NotFoundError if user not found.
   **/

  static async allFavorites(userId) {
    // Check if user exists
    const preCheck = await db.query(
          `SELECT id
           FROM users
           WHERE id = $1`, [userId]);

    const user = preCheck.rows[0];
    if (!user) throw new NotFoundError(`User does not exist: ${userId}`);

    // get list of movie_id_api that are user's favorites
    const favoritesIdRes = await db.query(
          `SELECT m.movie_id_api AS "movieId"
           FROM movies m
           JOIN favorites f ON f.movie_id = m.id
           WHERE f.user_id = $1 AND f.is_favorite = $2
           ORDER BY f.id DESC`,
        [userId, true],
    );

    const favoritesIds = favoritesIdRes.rows;

    // if (favoritesIds.length === 0) return null;

    const favorites = [];

    // use the list of movie_id_api to retrieve movie data
    await Promise.all(favoritesIds.map( async (m) => {
      let moviesDetailsRes = await axios.get(`${BASE_API_URL}/movie/${m.movieId}`, 
        { headers: { Authorization: `Bearer ${API_KEY}` } });
  
      favorites.push(moviesDetailsRes.data);
    }));

    return favorites;
  }

  /** Given userId and movieId, return data about rating.
   *
   * Returns { id, userId, movieId, rating }
   *
   * Throws NotFoundError if not found.
   **/

  static async getRating(userId, movieId) {
    // Check if user exists
    const preCheck = await db.query(
      `SELECT id
        FROM users
        WHERE id = $1`, [userId]);

    const user = preCheck.rows[0];
    if (!user) throw new NotFoundError(`User does not exist: ${userId}`);

    const ratingRes = await db.query(
          `SELECT r.id,
                  r.user_id AS "userId",
                  r.movie_id AS "movieId",
                  r.rating
           FROM ratings r
           JOIN movies m ON r.movie_id = m.id
           WHERE r.user_id = $1 AND m.movie_id_api = $2`, 
           [userId, movieId]);

    const ratingDetails = ratingRes.rows[0];

    if (!ratingDetails) return null;

    return ratingDetails;
  }

  /** Update rating data.
   *
   * Data must include : { userId, movieId, rating }
   *
   * Returns { id, userId, movieId, rating }
   *
   * Throws NotFoundError if not found.
   */

  static async updateRating(userId, movieId, rating) {
    // Check if user exists
    const preCheck = await db.query(
      `SELECT id
        FROM users
        WHERE id = $1`, [userId]);

    const user = preCheck.rows[0];
    if (!user) throw new NotFoundError(`User does not exist: ${userId}`);

    const result = await db.query(
                      `UPDATE ratings r
                       SET rating = $1 
                       FROM movies m
                       WHERE r.user_id = $2 AND m.movie_id_api = $3
                       RETURNING r.id, 
                                 user_id AS "userId",
                                 movie_id AS "movieId",
                                 rating`,
                       [rating, userId, movieId]);

    const updatedRating = result.rows[0];

    if (!updatedRating) throw new NotFoundError(`Rating does not exist: ${movieId}`);

    return updatedRating;
  }

  /** Delete rating given userId and movieId from database; returns undefined.
   *
   * Throws NotFoundError if rating not found.
   **/

  static async removeRating(userId, movieId) {
    // Check if user exists
    const preCheck = await db.query(
      `SELECT id
        FROM users
        WHERE id = $1`, [userId]);

    const user = preCheck.rows[0];
    if (!user) throw new NotFoundError(`User does not exist: ${userId}`);
    
    const result = await db.query(
          `DELETE
           FROM ratings r
           WHERE EXISTS (SELECT * 
                         FROM movies m 
                         WHERE m.id = r.movie_id
                         AND r.user_id = $1
                         AND m.movie_id_api = $2)
           RETURNING r.id`,
           [userId, movieId]);
           
    const ratingId = result.rows[0];

    if (!ratingId) throw new NotFoundError(`No rating exists for rating: ${movieId}`);
  }
}


module.exports = User;
