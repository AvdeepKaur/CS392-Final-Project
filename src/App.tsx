//ruby

import styled from "styled-components";
import Footer from "./component/Footer";
import StudyCards from "./component/cards/cards.tsx";
import Home from "./component/mains/home";

//styling for home page
const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export default function App() {
  return (
    <StyledWrapper>
      <main>
        <Home></Home>
        <StudyCards />
      </main>
      <Footer></Footer>
    </StyledWrapper>
  );
}
