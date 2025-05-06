"use strict";

/** Routes for ratings. */

const express = require("express");
const router = express.Router({ mergeParams: true });
const jsonschema = require("jsonschema");
const Rating = require("../models/rating");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const ratingNewSchema = require("../schemas/ratingNew.json");

/** POST / { data } => { ratingData }
 *
 * data should be { userId, movieId, rating }
 *
 * Returns { id, userId, movieId, rating }
 *
 * Authorization required: admin or same-user-as userId
 */

router.post("/", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, ratingNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const rating = await Rating.create(req.body);
    return res.status(201).json({ rating });
  } catch (err) {
    return next(err);
  }
});

/** ROUTES for debugging */

// /** GET / =>
//  *   { ratings: [ { id, userId, movieId, rating }, ...] }
//  * 
//  * Authorization required: admin or same-user-as-:userId
//  */

// router.get("/", ensureCorrectUserOrAdmin,async function (req, res, next) {
//   try {
//     const ratings = await Rating.findAll(+req.body.userId);
//     return res.json({ ratings });
//   } catch (err) {
//     return next(err);
//   }
// });

// /** GET /[ratingId] => { rating }
//  *
//  * Returns { id, userId, movieId, rating }
//  *
//  * Authorization required: admin or same-user-as-:userId
//  */

// router.get("/:ratingId", ensureCorrectUserOrAdmin, async function (req, res, next) {
//   try {
//     const rating = await Rating.get(req.params.ratingId);
//     return res.json({ rating });
//   } catch (err) {
//     return next(err);
//   }
// });


// /** PATCH /[ratingId]  { rating } => { rating }
//  *
//  * Data can only be: { rating }
//  *
//  * Returns { id, userId, movieId, rating }
//  *
//  * Authorization required: admin or same-user-as-:userId
//  */

// router.patch("/:ratingId", ensureCorrectUserOrAdmin, async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, ratingUpdateSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const rating = await Rating.update(+req.params.ratingId, req.body.rating);
//     return res.json({ rating });
//   } catch (err) {
//     return next(err);
//   }
// });

// /** DELETE /[ratingId]  =>  { deleted: ratingId }
//  *
//  * Authorization required: admin or same-user-as-:userId
//  */

// router.delete("/:ratingId", ensureCorrectUserOrAdmin, async function (req, res, next) {
//   try {
//     await Rating.remove(+req.params.ratingId);
//     return res.json({ deleted: +req.params.ratingId });
//   } catch (err) {
//     return next(err);
//   }
// });


module.exports = router;
