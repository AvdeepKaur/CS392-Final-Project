import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Carousel } from 'antd';
import 'antd/dist/reset.css';
import type { Location } from '../../interfaces/Location';
// yazan

// Sample data for study locations - Added more locations
// const studyLocations: Location[] = [
//     {
//         _id: '1',
//         name: 'GSU',
//         address: '775 Commonwealth Ave, Boston, MA 02215',

//         tags: ['Quiet', 'WiFi', '24/7', 'Food']
//     },
//     {
//         _id: '2',
//         name: 'Mugar Library',
//         address: '771 Commonwealth Ave, Boston, MA 02215',

//         tags: ['Silent', 'Study Rooms', 'WiFi', 'Late Hours']
//     },
//     {
//         _id: '3',
//         name: 'Photonics Center',
//         address: '8 Saint Mary\'s St, Boston, MA 02215',

//         tags: ['Modern', 'Collaborative', 'WiFi', 'Cafe']
//     },
//     {
//         _id: '4',
//         name: 'CAS Library',
//         address: '685 Commonwealth Ave, Boston, MA 02215',

//         tags: ['Quiet', 'Research', 'WiFi', 'Books']
//     },
//     {
//         _id: '5',
//         name: 'Starbucks BU',
//         address: '704 Commonwealth Ave, Boston, MA 02215',

//         tags: ['Coffee', 'Casual', 'WiFi', 'Social']
//     },
//     {
//         _id: '6',
//         name: 'Warren Towers Study Lounge ADFBKJDSBFKJSDFBKJSDBF',
//         address: '700 Commonwealth Ave, Boston, MA 02215',

//         tags: ['Dorm', 'Group Study', 'WiFi', 'Late Night']
//     }
// ];


// Styled Components

interface CardProps {
    $selected: boolean;            // styled-components prop (note the $)
}


const CardsContainer = styled.div`
    overflow: hidden;
    position: relative;

    padding: clamp(10px, 2vw, 20px);
    max-width: 80vw;
    margin: 0 auto;
    background-color: darkred;
;
    border-radius: 12px;
    max-height: 30vh;
    min-height: 200px;
    
    
    .ant-carousel {
        /* override slick’s hidden overflow */

        .slick-list,
        .slick-track {
            overflow: visible !important;
        }

        .slick-slide {
            overflow: visible !important;
        }

        /* keep your existing carousel height/style overrides */

        .ant-carousel-content {
            height: 200px;
        }

        .slick-prev, .slick-next {
            font-size: 20px;
            color: #000;
            z-index: 2;
        }

        .slick-prev {
            left: 25px;
            @media (max-width: 768px) {
                left: 25px;
            }
        }

        .slick-next {
            right: 25px;
            @media (max-width: 768px) {
                right: 25px;
            }
        }

        .slick-prev:before, .slick-next:before {
            color: #2D2926;
            font-size: 20px;
        }
    }
`;

// Content wrapper
const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    min-width: 0; 
`;

const Card = styled.div<CardProps>`
    background: ${({$selected}) => ($selected ? '#fbe3e3' : 'white')};
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: row;
    gap: 16px;

    height: 160px;
    flex: 1;
    flex-shrink: 0;
    min-width: 300px;

    cursor: pointer;


    //    animation!!!!!!

    position: relative; /* lets us raise z-index on hover */
    transition: transform 0.25s ease, /* smooth motion */ box-shadow 0.25s ease,
    background 0.25s ease;

    &:hover {
        transform: translate(12px, -12px) scale(1.04);
        box-shadow: -12px 12px 0 0 #e1a8a8;
        z-index: 100; /* sit on top of neighbouring cards */
    }
`;

const ImagePlaceholder = styled.div`
    width: clamp(80px, 15vw, 120px);
    height: clamp(80px, 15vw, 120px); 
    
    background-color: #c4c4c4;
    border-radius: 8px;
    flex-shrink: 0;
`;

const NameContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0; 
`;

const LocationName = styled.h3`
    font-size: calc(7px + .7vw);
    font-weight: bold;
    color: #2D2926;
    margin: 0;

    /* text truncation, 1 line only */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Address = styled.p`
    font-size: 14px;
    color: #666;
    font-style: italic;
`;

const TagsContainer = styled.div`
    display: flex;
    gap: 6px; 
    
    flex-wrap: nowrap; 
    overflow: hidden; /* Hide tags that dontt fit, i wanna do a fade effect later */
`;

const Tag = styled.span`
    background-color: #cc0000;
    color: #ffffff;
    padding: 4px 6px;
    border-radius: 4px;
    font-size: clamp(10px, 1.5vw, 12px);
    font-weight: 500;
    flex-shrink: 0;
`;

// carousel slide wrapper
const SlideContainer = styled.div`
    display: flex !important;
    gap: clamp(10px, 2vw, 20px);
    padding: 0 20px;
`;

// main Component
const StudyCards: React.FC<{ onCardClick?: (id: string) => void }> = ({
  onCardClick,
}) => {
  const [studyLocations, setFavoriteLocations] = useState<Location[]>([]);

  useEffect(() => {
    async function fetchFavorites() {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setFavoriteLocations(data);
      } else {
        setFavoriteLocations([]);
      }
    }
    fetchFavorites();
  }, []);

  /* highlighted card ID */
  const [activeId, setActiveId] = useState<string | null>(null);
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
  };

  // Determine cards per slide based on window width
  const getCardsPerSlide = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    return 3;
  };

  const [cardsPerSlide, setCardsPerSlide] = useState(getCardsPerSlide());

  useEffect(() => {
    const handleResize = () => {
      setCardsPerSlide(getCardsPerSlide());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Group locations into sets based on cards per slide
  const groupedLocations = [];
  for (let i = 0; i < studyLocations.length; i += cardsPerSlide) {
    groupedLocations.push(studyLocations.slice(i, i + cardsPerSlide));
  }

  return (
    <CardsContainer>
      <Carousel {...settings}>
        {groupedLocations.map((locationGroup, groupIndex) => (
          <div key={groupIndex}>
            <SlideContainer>
              {locationGroup.map((location) => (
                <Card
                  key={location._id}
                  $selected={location._id === activeId}
                  onClick={() => {
                    setActiveId(location._id); // for highlight
                    onCardClick?.(location._id); // SEND OUT ID FOR BACK-END !!
                  }}
                >
                  {/* Image placeholder */}
                  <ImagePlaceholder />

                  {/* Text content */}
                  <CardContent>
                    {/* Location name */}
                    <NameContainer>
                      <LocationName>{location.name}</LocationName>
                    </NameContainer>

                    {/* Address */}
                    <Address>{location.address}</Address>

                    {/* Tags */}
                    <TagsContainer>
                      {location.tags.map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                      ))}
                    </TagsContainer>
                  </CardContent>
                </Card>
              ))}
            </SlideContainer>
          </div>
        ))}
      </Carousel>
    </CardsContainer>
  );
};

export default StudyCards;