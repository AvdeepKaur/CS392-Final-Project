import Header from './component/Header'
import Footer from './component/Footer'
import Home from './component/mains/home'

//const StyledWrapper = styled.div`

//`;

export default function App(){
    return(
        <>
            <Header></Header>
            <main>
                <Home></Home>
            </main>
            <Footer></Footer>
        </>
    )
}
