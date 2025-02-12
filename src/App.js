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
        setLocation(data);

        setPath((prevPath) => [
          ...prevPath,
          {
            lat: data.latitude,
            lng: data.longitude,
            distance: 0,
          },
        ]);
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
