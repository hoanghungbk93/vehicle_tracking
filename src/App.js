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
    const fetchLocation = async () => {
      try {
        const response = await fetch(`${config.backendUrl}/gps/location`);
        const data = await response.json();
        
        // Define Hanoi's approximate bounding box
        const hanoiBounds = {
          north: 21.055,
          south: 20.75,
          west: 105.7,
          east: 106.0
        };

        // Check if the location is within Hanoi
        const isInHanoi = data.latitude >= hanoiBounds.south && data.latitude <= hanoiBounds.north &&
                          data.longitude >= hanoiBounds.west && data.longitude <= hanoiBounds.east;

        if (isInHanoi) {
          setLocation(data);

          setPath((prevPath) => {
            const newPath = [
              ...prevPath,
              {
                lat: data.latitude,
                lng: data.longitude,
                distance: 0,
              },
            ];
            // Limit the path to 100 points
            if (newPath.length > 100) {
              newPath.shift(); // Remove the first element
            }
            return newPath;
          });
        } else {
          console.warn('Location is outside Hanoi, skipping this point.');
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);

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
