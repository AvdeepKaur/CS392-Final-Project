import styled from 'styled-components';
import {useEffect, useState} from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip} from '@mui/material';

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


interface StudySpot {
    _id: string;
    name: string;
    address: string;
    tags: string[];
}

const mockStudySpots: StudySpot[] = [
    {
        _id: '1',
        name: 'Mugar Memorial Library',
        address: '771 Commonwealth Ave, Boston, MA 02215',
        tags: ['quiet', 'library', 'group rooms']
    },
    {
        _id: '2',
        name: 'Caffè Nero',
        address: '1047 Commonwealth Ave, Boston, MA 02215',
        tags: ['cafe', 'coffee', 'outlets']
    },
    {
        _id: '3',
        name: 'Kilachand Hall Study Lounge',
        address: '91 Bay State Rd, Boston, MA 02215',
        tags: ['study lounge', '9th floor', 'open seating']
    }
];

export default function ListComponent() {
    const [studySpots, setStudySpots] = useState<StudySpot[]>([]);

    useEffect(() => {
        setStudySpots(mockStudySpots);  // Mock data used here
    }, []);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try{
    //             const response = await fetch('/api/studyspots');
    //             const data = await response.json();
    //             setStudySpots(data);
    //         } catch (error) {
    //             console.log('Error fetching the study spots' + error);
    //         }
    //     };
    //
    //     fetchData();
    // }, []);

    return (
        <StyledTableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <StyledTableCell><strong>Name</strong></StyledTableCell>
                        <StyledTableCell><strong>Address</strong></StyledTableCell>
                        <StyledTableCell><strong>Tags</strong></StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {studySpots.map((spot) => (
                        <TableRow key={spot._id}>
                            <StyledTableCell>{spot.name}</StyledTableCell>
                            <StyledTableCell>{spot.address}</StyledTableCell>
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