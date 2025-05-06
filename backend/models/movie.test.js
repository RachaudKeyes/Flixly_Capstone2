"use strict";

const Movie = require("./movie.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** findAll */

describe("findAll", function () {
  test("works: all", async function () {
    let movies = await Movie.findAll();
    expect(movies).toBeInstanceOf(Array);
    expect(movies.length).toEqual(20);
  });

  test("works: by title param", async function () {
    let movies = await Movie.findAll("The King");
    expect(movies).toBeInstanceOf(Array);
    expect(movies.length).toBeGreaterThan(0);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    const movieId = 668489;
    const movie = await Movie.get(movieId);
    // some properties to prove it worked
    expect(movie.id).toEqual(movieId);
    expect(movie.title).toEqual("Havoc");
    expect(movie.tagline).toEqual("No law. Only disorder.");
    expect(movie.release_date).toEqual("2025-04-24");
  });
});

/************************************** play */

describe("play", function () {
  test("works", async function () {
    const movieId = 668489;
    const movie = await Movie.play(movieId);
    // some properties to prove it worked
    expect(movie.site).toEqual("YouTube");
    expect(movie.name).toEqual("Tom Hardy and Gareth Evans break down brutal fight scene from Havoc - Shot by Shot");
    expect(movie.key).toEqual("_824u8P3tj8");
  });
});
