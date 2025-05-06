"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError} = require("../expressError");

/** Related functions for ratings. */

class Rating {
  /** Create a rating (from data), update db, return new rating data.
   *
   *  data should be { userId, movieId, rating }
   *
   *  Returns { id, userId, movieId, rating }
   **/

  static async create( data ) {
    // movieId is the movie id from API
    // Check if movie is in db, if not, add to DB
    const preCheck = await db.query(
      `SELECT id, movie_id_api
       FROM movies
       WHERE movie_id_api = $1`, [data.movieId]);

    const movie = preCheck.rows[0];

    if (!movie) {
      await db.query(
          `INSERT INTO movies (movie_id_api)
           VALUES ($1)`,
          [data.movieId]);
    }

    // Check if user exists
    const preCheck2 = await db.query(
      `SELECT id
       FROM users
       WHERE id = $1`, [data.userId]);

    const user = preCheck2.rows[0];
    if (!user) throw new NotFoundError(`User does not exist: ${data.userId}`);

    // Check if rating exits
    const preCheck3 = await db.query(
          `SELECT r.user_id,
                  r.movie_id,
                  r.rating
           FROM ratings r
           JOIN movies m ON r.movie_id = m.id
           WHERE user_id = $1 AND m.movie_id_api = $2`,
           [data.userId, data.movieId]);
    if (preCheck3.rows[0]) throw new BadRequestError(`This movie has already been rated: ${data.movieId}`)
    
    // Add rating to DB
    const ratingResp = await db.query(
        `INSERT INTO ratings (movie_id, user_id, rating)
          SELECT m.id, $1, $2
          FROM movies m
          WHERE m.movie_id_api = $3
          RETURNING ratings.id, user_id AS "userId", movie_id as "movieId", rating`,
        [
          data.userId,
          data.rating,
          data.movieId
        ]);

    const newRating = ratingResp.rows[0];

    return newRating;
  }

  /** Functions for debugging */

  /** Find all user's ratings.
   *
   * Returns [{ id, userId, movieId, rating }, ...]
   * */

  // static async findAll(userId) {
  //   const result = await db.query(`
  //               SELECT id,
  //                      user_id AS "userId",
  //                      movie_id AS "movieId",
  //                      rating
  //               FROM ratings
  //               WHERE user_id = $1`, 
  //               [userId]);

  //   return result.rows;
  // }

  /** Given a rating id, return data about rating.
   *
   * Returns { id, userId, movieId }
   *
   * Throws NotFoundError if not found.
   **/

  // static async get(id) {
  //   const ratingRes = await db.query(
  //         `SELECT r.id,
  //                 r.user_id AS "userId",
  //                 r.movie_id AS "movieId",
  //                 r.rating
  //          FROM ratings r
  //          JOIN movies m ON r.movie_id = m.id
  //          WHERE id = $1`, [id]);

  //   const ratingDetails = ratingRes.rows[0];

  //   if (!ratingDetails) throw new NotFoundError(`No rating exists: ${id}`);

  //   return ratingDetails;
  // }

  /** Update rating data.
   *
   * Data can include only: { rating }
   *
   * Returns { id, userId, movieId, rating }
   *
   * Throws NotFoundError if not found.
   */

  // static async update(id, rating) {
  //   const result = await db.query(
  //                     `UPDATE ratings 
  //                      SET rating = $1 
  //                      WHERE id = $2 
  //                      RETURNING id, 
  //                                user_id AS "userId",
  //                                movie_id AS "movieId",
  //                                rating`,
  //                      [rating, id]);

  //   const updatedRating = result.rows[0];

  //   if (!updatedRating) throw new NotFoundError(`Rating does not exist: ${id}`);

  //   return updatedRating;
  // }

  // /** Delete given rating from database; returns undefined.
  //  *
  //  * Throws NotFoundError if rating not found.
  //  **/

  // static async remove(id) {
  //   const result = await db.query(
  //         `DELETE
  //          FROM ratings
  //          WHERE id = $1
  //          RETURNING id`, [id]);
           
  //   const ratingId = result.rows[0];

  //   if (!ratingId) throw new NotFoundError(`No rating exists: ${id}`);
  // }
}

module.exports = Rating;
