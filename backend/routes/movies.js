"use strict";

/** Routes for movies. */

const express = require("express");
const router = new express.Router();
const { ensureLoggedIn } = require("../middleware/auth");
const Movie = require("../models/movie");

/** GET /  =>   { movies: [ { movieData }, ...] }
 *
 * Authorization required: logged-in user
 */

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const movies = await Movie.findAll(req.query.query);
    return res.json({ movies });
  } catch (err) {
    return next(err);
  }
});

/** GET /[movieId]  =>  { movieData }
 *
 * Authorization required: logged-in user
 */

router.get("/:movieId", ensureLoggedIn, async function (req, res, next) {
  try {
    const movie = await Movie.get(+req.params.movieId);
    return res.json({ movie });
  } catch (err) {
    return next(err);
  }
});

/** GET /[movieId]/play  =>  { movie }
 *
 * Authorization required: logged-in user
 */

router.get("/:movieId/play", ensureLoggedIn, async function (req, res, next) {
  try {
    const movie = await Movie.play(+req.params.movieId);
    return res.json({ movie });
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
