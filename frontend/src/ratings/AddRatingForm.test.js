import React from "react";
import { render } from "@testing-library/react";
import AddRatingForm from "./AddRatingForm";
import { UserProvider } from "../testUtils";
import { MemoryRouter } from "react-router-dom";

it("renders without crashing", function () {
  render(
      <MemoryRouter>
        <UserProvider>
          <AddRatingForm />
        </UserProvider>
      </MemoryRouter>,
  );
});