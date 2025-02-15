import React, { useEffect, useState } from 'react';
import './App.css';
import WrappedMap from './components/gMap/Map';
import config from './components/gMap/config';
import Header from './components/Header/Header';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

function App() {
  const [location, setLocation] = useState(null);
  const [path, setPath] = useState([]);

  useEffect(() => {
    const generateRandomLocation = (center, radius) => {
        const y0 = center.latitude;
        const x0 = center.longitude;
        const rd = radius / 111300; // Convert radius from meters to degrees

        const u = Math.random();
        const v = Math.random();

        const w = rd * Math.sqrt(u);
        const t = 2 * Math.PI * v;
        const x = w * Math.cos(t);
        const y = w * Math.sin(t);

        const newLat = y + y0;
        const newLng = x + x0;

        return { latitude: newLat, longitude: newLng };
    };

    const fetchLocation = async () => {
        try {
            // Generate random location around the central point
            const randomLocation = generateRandomLocation(
                { latitude: 21.0043523, longitude: 105.842492 },
                100 // Radius in meters
            );

            setLocation(randomLocation);

            setPath((prevPath) => {
                const newPath = [
                    ...prevPath,
                    {
                        lat: randomLocation.latitude,
                        lng: randomLocation.longitude,
                        distance: 0,
                    },
                ];
                // Limit the path to 100 points
                if (newPath.length > 100) {
                    newPath.shift(); // Remove the first element
                }
                return newPath;
            });
        } catch (error) {
            console.error('Error generating location:', error);
        }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 2000);

    return () => clearInterval(interval);
  }, []);

  const mapURL = `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${config.mapsKey}`;

  return (
    <div className="App">
      <Header/>
      { location ?
        <WrappedMap
            paths={path}
            stops={[]}
            googleMapURL={mapURL}
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div className='mapContainer'  />}
            mapElement={<div style={{ height: `100%` }} />}
          />
          : 
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        }
    </div>
  );
}

export default App;
