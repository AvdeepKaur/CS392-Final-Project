//ruby

import styled from 'styled-components';
import {useEffect, useState} from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip} from '@mui/material';

//styling for the list component with imports from MUI
const StyledTableContainer = styled(TableContainer)`
    width: 80%;
    margin: 2% auto;
`;

const StyledTableCell = styled(TableCell)`
    padding: 1%;
`;

const StyledChip = styled(Chip)`
    margin-right: 2%;
`;

//establish the types expected to be fetched
interface StudySpot {
    _id: string;
    name: string;
    address: string;
    tags: string[];
    floor?: string;
}

export default function ListComponent() {
    const [studySpots, setStudySpots] = useState<StudySpot[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    //fetch the locations and their data
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                console.log("Fetching locations...");
                setLoading(true);

                const response = await fetch("/api/locations");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Received locations:", data);
                setStudySpots(data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch locations:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to fetch locations"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    //loading locations
    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <h2>BU Study Spots Map</h2>
                <p>Loading locations...</p>
            </div>
        );
    }

    //error handling
    if (error) {
        return (
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <h2>BU Study Spots Map</h2>
                <p style={{ color: "red" }}>Error: {error}</p>
                <p>
                    Make sure your backend is running and Google Maps API key is valid.
                </p>
            </div>
        );
    }

    //created a frontend table to display the location data for every location on the map
    return (
        <StyledTableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <StyledTableCell><strong>Name</strong></StyledTableCell>
                        <StyledTableCell><strong>Address</strong></StyledTableCell>
                        <StyledTableCell><strong>Floor</strong></StyledTableCell>
                        <StyledTableCell><strong>Tags</strong></StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/*now we map the data we fetched and connect them to the*/}
                    {/*rows within the table */}
                    {studySpots.map((spot) => (
                        <TableRow key={spot._id}>
                            <StyledTableCell>{spot.name}</StyledTableCell>
                            <StyledTableCell>{spot.address}</StyledTableCell>
                            <StyledTableCell>{spot.floor || "N/A"}</StyledTableCell>
                            <StyledTableCell>
                                {spot.tags.map((tag, index) => (
                                    <StyledChip key={index} label={tag} />
                                ))}
                            </StyledTableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </StyledTableContainer>

    );

}