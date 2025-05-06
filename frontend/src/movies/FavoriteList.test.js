import React from "react";
import { render } from "@testing-library/react";
import FavoriteList from "./FavoriteList";
import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "../testUtils";

it("matches snapshot", function () {
  const { asFragment } = render(
      <MemoryRouter>
        <UserProvider>
          <FavoriteList />
        </UserProvider>
      </MemoryRouter>,
  );
  expect(asFragment()).toMatchSnapshot();
});
