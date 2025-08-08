//ruby

import styled from "styled-components";
import '/src/global.css';
import type { ReactNode } from "react";

//styling for the header using styled-components
const StyledHeader = styled.header`
  margin: 3% 3% 1% 3%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  position: relative;
`;

const AppTitle = styled.h1`
  font-family: capitolcity, sans-serif;
  font-size: 40px;
  color: darkred;
  text-align: center;
  margin-bottom: 2%;
`;

const HeaderSubtitle = styled.p`
  text-align: center;
  padding: 0 10%;
  font-family: nunito, sans-serif;
`;

//defining props
interface HeaderProps {
  children?: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return (
    <StyledHeader>
      <AppTitle>Terrier StudyMap</AppTitle>
      <HeaderSubtitle>
        A campus navigation app designed to help Boston University students
        easily discover and locate study spots across BU campus.
      </HeaderSubtitle>
      {children && (
        //this is for the login button/component
          <div
          style={{
            position: "absolute",
            top: 20,
            right: 30,
            zIndex: 2,
          }}
        >
          {children}
        </div>
      )}
    </StyledHeader>
  );
}