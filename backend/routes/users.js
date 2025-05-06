"use strict";

/** Routes for users. */

const express = require("express");
const router = express.Router();
const jsonschema = require("jsonschema");
const { createToken } = require("../helpers/tokens");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const User = require("../models/user");
const { BadRequestError } = require("../expressError");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const ratingUpdateSchema = require("../schemas/ratingUpdate.json");

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { id, username, firstName, lastName, email, profileImage, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { users: [ {id, username, firstName, lastName, email, profileImage, isAdmin }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/** GET /[userId] => { user }
 *
 * Returns { id, username, firstName, lastName, profileImage, email, isAdmin }
 *
 * Authorization required: admin or same user-as-:userId
 **/

router.get("/:userId", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const user = await User.get(+req.params.userId);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[userId] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email, profileImage }
 *
 * Returns { id, username, firstName, lastName, email, profileImage, isAdmin }
 *
 * Authorization required: admin or same-user-as-:userId
 **/

router.patch("/:userId", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(+req.params.userId, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[userId]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:userId
 **/

router.delete("/:userId", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await User.remove(+req.params.userId);
    return res.json({ deleted: req.params.userId });
  } catch (err) {
    return next(err);
  }
});


/** PUT /[userId]/favorites  { state } => { application }
 *
 * Returns { isFavorite: true or false }
 *
 * Authorization required: admin or same-user-as-:userId
 * */

router.put("/:userId/favorites", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const userId = +req.params.userId;
    const movieId = +req.body.movieId;
    const isFavorite = await User.toggleFavorite(userId, movieId);
    return res.json( isFavorite );
  } catch (err) {
    return next(err);
  }
});

/** GET /[userId]/isFavorite 
 *
 * Returns { isFavorite: true or false }
 *
 * Authorization required: admin or same-user-as-:userId
 * */

router.get("/:userId/isFavorite", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const userId = +req.params.userId;
    const movieId = +req.query.movieId;
    const isFavorite = await User.isFavorite(userId, movieId);
    return res.json({ isFavorite });
  } catch (err) {
    return next(err);
  }
});

/** GET /[userId]/favorites 
 *
 * Returns { favorites: [ { movieData }, ... ] }
 *
 * Authorization required: admin or same-user-as-:userId
 * */

router.get("/:userId/favorites", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const userId = +req.params.userId;
    const favorites = await User.allFavorites(userId);
    return res.json({ favorites });
  } catch (err) {
    return next(err);
  }
});

/** GET /[userId]/rating
 *
 * Returns { rating: { id, userId, movieId, rating } }
 *
 * Authorization required: admin or same-user-as-:userId
 * */

router.get("/:userId/rating", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const userId = +req.params.userId;
    const movieId = +req.query.movieId;
    const rating = await User.getRating(userId, movieId);
    return res.json({ rating });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[userId]/rating  { ratingData } => { ratingData }
 *
 * Returns { rating:  { id, userId, movieId, rating } }
 *
 * Authorization required: admin or same-user-as-:userId
 * */

router.patch("/:userId/rating", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const userId = +req.params.userId;
    const movieId = +req.body.movieId;
    const rating = +req.body.rating;

    const validator = jsonschema.validate(req.body, ratingUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    await User.updateRating(userId, movieId, rating);
    return res.json({ rating });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[userId]/rating  { ratingData } => { deleted: rating.id }
 *
 *
 * Authorization required: admin or same-user-as-:userId
 * */

router.delete("/:userId/rating", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const userId = +req.params.userId;
    const movieId = +req.body.movieId;

    await User.removeRating(userId, movieId);
    return res.json({ deleted: "rating" });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
