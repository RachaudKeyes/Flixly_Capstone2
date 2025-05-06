import React from "react";
import { render } from "@testing-library/react";
import EditRatingForm from "./EditRatingForm";
import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "../testUtils";

// it("renders without crashing", function () {

//   render(
//       <MemoryRouter initialEntries={["/movies/668489/editRatingForm"]}>
//         <UserProvider>
//           <EditRatingForm/>
//         </UserProvider>
//       </MemoryRouter>,
//   );
// });