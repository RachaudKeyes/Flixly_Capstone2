import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Homepage from "../homepage/Homepage";
import SignupForm from "../auth/SignupForm";
import LoginForm from "../auth/LoginForm";
import ProfileForm from "../profiles/ProfileForm";
import MovieList from "../movies/MovieList";
import FavoriteList from "../movies/FavoriteList";
import MovieDetail from "../movies/MovieDetail";
import AddRatingForm from "../ratings/AddRatingForm"
import EditRatingForm from "../ratings/EditRatingForm"
import MoviePlay from "../movies/Movie";

/** Site-wide routes.
 *
 * Parts of site should only be visitable when logged in. Those routes are
 * wrapped by <PrivateRoute>, which is an authorization component.
 *
 * Visiting a non-existent route redirects to the homepage.
 */

function Routes({ login, signup }) {
    console.debug(
        "Routes",
        `login=${typeof login}`,
        `signup=${typeof signup}`
    );

    return (
        <div className="Routes">
          <Switch>

            <Route exact path="/">
              <Homepage />
            </Route>

            <PrivateRoute exact path="/movies">
              <MovieList />
            </PrivateRoute>

            <PrivateRoute exact path="/movies/:movieId">
              <MovieDetail />
            </PrivateRoute>

            <PrivateRoute exact path="/movies/:movieId/play">
              <MoviePlay />
            </PrivateRoute>

            <PrivateRoute exact path="/favorites">
              <FavoriteList />
            </PrivateRoute>

            <PrivateRoute exact path="/movies/:movieId/addRating">
              <AddRatingForm />
            </PrivateRoute>

            <PrivateRoute exact path="/movies/:movieId/editRating">
              <EditRatingForm />
            </PrivateRoute>

            <Route exact path="/login">
              <LoginForm login={ login } />
            </Route>

            <Route exact path="/signup">
              <SignupForm signup = { signup } />
            </Route>

            <PrivateRoute exact path="/profile">
              <ProfileForm />
            </PrivateRoute>

            <Redirect to="/" />

          </Switch>
        </div>
    );
}

export default Routes;