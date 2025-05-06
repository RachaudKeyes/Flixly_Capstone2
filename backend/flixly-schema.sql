CREATE TABLE "users"(
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(25) NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL
      CHECK (position('@' IN email) > 1),
    "password" TEXT NOT NULL,
    "profile_image" TEXT NOT NULL,
    "is_admin" BOOLEAN
);

CREATE TABLE "movies"(
    "id" SERIAL PRIMARY KEY,
    "movie_id_api" INTEGER NOT NULL
);

CREATE TABLE "favorites"(
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "is_favorite" BOOLEAN
);

CREATE TABLE "ratings"(
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "rating" FLOAT NOT NULL
);



ALTER TABLE
    "favorites" ADD CONSTRAINT "favorites_movie_id_foreign" FOREIGN KEY("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE;
ALTER TABLE
    "ratings" ADD CONSTRAINT "ratings_movie_id_foreign" FOREIGN KEY("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE;
ALTER TABLE
    "ratings" ADD CONSTRAINT "ratings_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE
    "favorites" ADD CONSTRAINT "favorites_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE;