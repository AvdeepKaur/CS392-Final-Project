import Header from './component/Header'
import Footer from './component/Footer'
import StudyCards from "./component/cards/cards.tsx";
import Map from "./components/map";

//const StyledWrapper = styled.div`

//`;

export default function App(){
    return(
        <>
            <Header></Header>
            <main>Hello pretend this is the main</main>
            <Map />

            {/*test out cards */}
            <StudyCards />

            <Footer></Footer>
        </>
    )
}
