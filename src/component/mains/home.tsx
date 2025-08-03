import styled from 'styled-components';

export default function Home(){


    const StyledHome = styled.div`
        display: flex;
        justify-content: center;
        flex-direction: column;
        margin: 5%;
        background-color: lavenderblush;
    `;

    //const StyledCard = styled.div`

    //`;
    return(
        <>
            <title>Home | Terrier StudyMap</title>
            <StyledHome>
                <h1>Home</h1>
            </StyledHome>
        </>
    )
}