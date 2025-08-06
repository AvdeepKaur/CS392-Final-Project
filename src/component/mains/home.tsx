import styled from "styled-components";
import { useState } from "react";
import Switch from "@mui/material/Switch";
import ListComponent from "../ListComponent";
import Map from "../components/map";

//import MapComponent from

export default function Home() {
  const [isListView, setIsListView] = useState(false);

  const StyledHome = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    background-color: lightblue;
    padding: 5%;
    font-family: nunito, sans-serif;
  `;

  const MapWrapper = styled.div`
    background-color: white;
    border-radius: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    padding: 10%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 2;
    flex-shrink: 1;
    flex-basis: 0;
  `;

  const SwitchContainer = styled.div`
    display: flex;
    align-items: center;
  `;

  const ViewLabel = styled.p`
    font-size: 20px;
    font-weight: bold;
    font-family: nunito, sans-serif;
    margin-top: 2%;
  `;

  return (
    <>
      <title>Home | Terrier StudyMap</title>
      <StyledHome>
        <SwitchContainer>
          <span>Map View</span>
          <Switch
            checked={isListView}
            onChange={() => setIsListView(!isListView)}
            color="default"
          />
          <span>List View</span>
        </SwitchContainer>

        <ViewLabel>
          {isListView ? "List of Study Spots" : "Interactive Map"}
        </ViewLabel>
        <MapWrapper>
          {isListView ? <ListComponent></ListComponent> : <Map />}
        </MapWrapper>
      </StyledHome>
    </>
  );
}
