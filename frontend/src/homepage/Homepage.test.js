import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router";
import Homepage from "./Homepage";
import { UserProvider } from "../testUtils";


it("matches snapshot", function () {
  const { asFragment } = render(
      <MemoryRouter>
        <UserProvider>
          <Homepage />
        </UserProvider>
      </MemoryRouter>,
  );
  expect(asFragment()).toMatchSnapshot();
});

