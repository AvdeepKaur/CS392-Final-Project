//ruby

import styled from "styled-components";

const StyledFooter = styled.footer`
    margin: 3%;
    display: flex;
    justify-content: center;
    flex-direction: column;
`;

const FooterSubtitle = styled.p`
    text-align: center;
    padding: 3%;
    font-family: nunito, sans-serif;
`;

export default function Header(){

    return (
        <StyledFooter>
            <FooterSubtitle>&copy; CS391 Summer 2025 Avdeep, Ruby, and Yazan. All rights reserved.</FooterSubtitle>
        </StyledFooter>

    )
}