import React from "react";
import { render } from "@testing-library/react";
import MovieCard from "./MovieCard";
import { MemoryRouter } from "react-router";

it("matches snapshot", function () {
  const { asFragment } = render(
      <MemoryRouter>
        <MovieCard
            key={ 668489 }
            id= { 668489 }
            title= "Havoc"
            releaseDate={ 2025 }
            poster= "/r46leE6PSzLR3pnVzaxx5Q30yUF.jpg"
            voteAverage={ 6.608 * 10 }
        />
      </MemoryRouter>,
  );
  expect(asFragment()).toMatchSnapshot();
});

