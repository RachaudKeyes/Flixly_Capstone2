import React from "react";
import { render } from "@testing-library/react";
import MovieList from "./MovieList";
import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "../testUtils";

it("renders without crashing", function () {
  render(
      <MemoryRouter>
        <UserProvider>
          <MovieList />
        </UserProvider>
      </MemoryRouter>,
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(<MovieList />);
  expect(asFragment()).toMatchSnapshot();
});
