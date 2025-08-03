import styled from 'styled-components';
import Header from './component/Header'
import Footer from './component/Footer'
import Home from './component/mains/home'

const StyledWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh
`;


export default function App(){
    return(
        <StyledWrapper>
            <Header></Header>
            <main>
                <Home></Home>
            </main>
            <Footer></Footer>
        </StyledWrapper>
    )
}
