//ruby and avdeep

import styled from "styled-components";
import { useEffect, useState } from "react";
import Switch from "@mui/material/Switch";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ListComponent from "../ListComponent";
import Map from "../map";
import LoginComponent from "../Login";
import Header from "../Header";

export default function Home() {
  const [isListView, setIsListView] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  //the styling for the homepage component using imports and icons from MUI
  const StyledHome = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin: 0 5%;
    font-family: nunito, sans-serif;
  `;

  const MapWrapper = styled.div`
    background-color: white;
    border-radius: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
    padding: 3%;
    margin-bottom: 5%;
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

  const HeartIcon = styled(FavoriteRoundedIcon)`
    margin-top: 2%;
    color: indianred;
    padding-top: 5px;
  `;

  const FavoriteWrapper = styled.div`
    display: flex;
    align-items: center;
    margin: 1% 0;
  `;

  const TitleWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 1%;
  `;

  const Button = styled.button`
    padding: 0.5rem 1rem;
    background-color: indianred;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 1rem;
    &:hover {
      background-color: #b22222;
    }
  `;

  // check for token and fetch current user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCurrentUser(token);
    }
  }, []);

  async function fetchCurrentUser(token: string) {
    try {
      const res = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        localStorage.removeItem("token");
      }
    } catch (e) {
      setCurrentUser(null);
      localStorage.removeItem("token");
    }
  }

  // Called after successful login in login component
  function onLoginSuccess(user: any, token: string) {
    localStorage.setItem("token", token);
    setCurrentUser(user);
    setShowLogin(false);
  }

  // Logout handler
  function handleLogout() {
    localStorage.removeItem("token");
    setCurrentUser(null);
  }

  return (
    <>
      <title>Home | Terrier StudyMap</title>
      <Header>
        {!currentUser ? (
          <Button onClick={() => setShowLogin(true)}>Login</Button>
        ) : (
          <Button onClick={handleLogout}>Logout</Button>
        )}
      </Header>

      {showLogin && (
        <LoginComponent
          onLoginSuccess={onLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}

      <StyledHome>
        <TitleWrapper>
          {/*if else condition used to determine whether the user is viewing the */}
          {/*map or the list of study spots.*/}
          <ViewLabel>
            {isListView ? "List of Study Spots" : "Interactive Map"}
          </ViewLabel>

          {/*MUI component that allows for a toggle between map and list view.*/}
          <SwitchContainer>
            <span>Map View</span>
            <Switch
              checked={isListView}
              onChange={() => setIsListView(!isListView)}
              color="default"
            />
            <span>List View</span>
          </SwitchContainer>
        </TitleWrapper>
        {/*rechecks the state of isListView to determine whether we are on*/}
        {/*map view or list component view */}
        <MapWrapper>
          {isListView ? <ListComponent></ListComponent> : <Map />}
        </MapWrapper>

        <FavoriteWrapper>
          <ViewLabel>
            Favorite Spots <HeartIcon></HeartIcon>
          </ViewLabel>
        </FavoriteWrapper>
      </StyledHome>
    </>
  );
}
