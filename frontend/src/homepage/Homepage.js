import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./Homepage.css";
import UserContext from "../auth/UserContext";

/** Homepage of site.
 *
 * Shows welcome message or login/register buttons.
 *
 * Routed at /
 *
 * Routes -> Homepage
 */

function Homepage() {
    const { currentUser } = useContext(UserContext);
    console.debug("Homepage", "currentUser=", currentUser);

    return (
        <div className="Homepage">
          <div className="container text-center">
            <h1 className="mb-4 font-weight-bold">Flixly</h1>
            <p className="lead">Discover movies today!</p>
            { (currentUser)
                ?   <h2>
                      Welcome Back, {currentUser.firstName || currentUser.username}!
                    </h2>

                :   <p className="mt-5">
                      <Link className="btn btn-danger font-weight-bold mr-3"
                            to="/login">
                        Log in
                      </Link>
                      <Link className="btn btn-danger font-weight-bold"
                            to="/signup">
                        Sign up
                      </Link>
                    </p>
            }
          </div>
        </div>
    );
}

export default Homepage;
