import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  GoogleMap,
  withScriptjs,
  withGoogleMap,
  Marker,
  Polyline
} from 'react-google-maps';
import Card from '@mui/material/Card';
import '../../App.css';

const HANOI_LAT = 21.0043523;
const HANOI_LNG = 105.842492;

const Map = ({ paths, stops }) => {
  const [progress, setProgress] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null); // Track current position
  const velocity = 27; // 100km per hour
  let initialDate;
  let interval = null;
  const icon1 = {
    url: "https://images.vexels.com/media/users/3/154573/isolated/preview/bd08e000a449288c914d851cb9dae110-hatchback-car-top-view-silhouette-by-vexels.png",
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 20),
    scale: 0.7,
  };

  const center = parseInt(paths.length / 2);
  const centerPathLat = paths[center]?.lat || 0;
  const centerpathLng = paths[center + 5]?.lng || 0;

  const mapRef = useRef(null); // Reference to the map instance

  useEffect(() => {
    console.log("paths1", paths);
    if (paths.length > 0) {
      calculatePath();
      startSimulation(); // Start simulation automatically
    }
    console.log("Initial paths:", paths);

    return () => {
      console.log("CLEAR........");
      interval && window.clearInterval(interval);
    };
  }, [paths]);

  useEffect(() => {
    if (paths.length > 1) {
      moveObject();
      mapUpdate();
    }
  }, [paths, progress]);

  const getDistance = () => {
    const differentInTime = (new Date() - initialDate) / 5000; // pass to seconds
    return differentInTime * velocity; // d = v*t -- thanks Newton!
  };

  const isValidCoordinate = (coord) => {
    // Define a reasonable range for Hanoi
    return typeof coord === 'number' && coord >= 20.5 && coord <= 21.5;
  };

  const logCoordinates = (coordinates) => {
    console.log("Coordinates:", coordinates);
    coordinates.forEach((coord, index) => {
      console.log(`Coordinate ${index}: lat=${coord.lat}, lng=${coord.lng}`);
    });
  };

  const moveObject = () => {
    console.log("moveObject");
    if (paths.length < 2) {
        return; // Need at least two points to interpolate
    }

    const lastLine = paths[paths.length - 2];
    const nextLine = paths[paths.length - 1];

    const lastLineLatLng = new window.google.maps.LatLng(
        lastLine.lat,
        lastLine.lng
    );

    const nextLineLatLng = new window.google.maps.LatLng(
        nextLine.lat,
        nextLine.lng
    );

    const position = window.google.maps.geometry.spherical.interpolate(
        lastLineLatLng,
        nextLineLatLng,
        0.5 // Interpolate halfway for demonstration
    );

    setProgress(paths);
    setCurrentPosition(position); // Update current position
    console.log("Updated Current Position:", position.toJSON()); // Log current position
  };

  const calculatePath = () => {
    paths = paths.map((coordinates, i, array) => {
      if (i === 0) {
        return { ...coordinates, distance: 0 }; // it begins here!
      }
      const { lat: lat1, lng: lng1 } = coordinates;
      const latLong1 = new window.google.maps.LatLng(lat1, lng1);

      const { lat: lat2, lng: lng2 } = array[i - 1];
      const latLong2 = new window.google.maps.LatLng(lat2, lng2);

      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        latLong1,
        latLong2
      );

      return { ...coordinates, distance: array[i - 1].distance + distance };
    });
  };

  const startSimulation = useCallback(() => {
    console.log("startSimulation");
    setProgress(null);
    initialDate = new Date();
  }, [initialDate]);

  useEffect(() => {
    console.log("currentPosition", currentPosition);
  }, [currentPosition]);

  const mapUpdate = () => {
    console.log("mapUpdate");
    const distance = getDistance();
    if (!distance || paths.length < 2) {
        return; // Ensure there are at least two points to work with
    }

    let progress = paths.filter(
        (coordinates) => coordinates.distance < distance
    );

    const nextLine = paths.find(
        (coordinates) => coordinates.distance > distance
    );

    let point1, point2;

    if (nextLine) {
        point1 = progress[progress.length - 1];
        point2 = nextLine;
    } else {
        point1 = progress[progress.length - 2];
        point2 = progress[progress.length - 1];
    }

    // Ensure point1 and point2 are defined
    if (!point1 || !point2) {
        console.error("Invalid path points for map update");
        return;
    }

    const point1LatLng = new window.google.maps.LatLng(point1.lat, point1.lng);
    const point2LatLng = new window.google.maps.LatLng(point2.lat, point2.lng);

    const angle = window.google.maps.geometry.spherical.computeHeading(
        point1LatLng,
        point2LatLng
    );
    const actualAngle = angle - 90;

    const marker = document.querySelector(`[src="${icon1.url}"]`);

    if (marker) {
        marker.style.transform = `rotate(${actualAngle}deg)`;
    }
  };

  const fitMapToBounds = () => {
    if (mapRef.current && paths.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      paths.forEach(({ lat, lng }) => {
        const validLat = isValidCoordinate(lat) ? lat : HANOI_LAT;
        const validLng = isValidCoordinate(lng) ? lng : HANOI_LNG;
        bounds.extend(new window.google.maps.LatLng(validLat, validLng));
      });
      mapRef.current.fitBounds(bounds);
    }
  };

  // useEffect(() => {
  //   fitMapToBounds(); // Fit map to bounds whenever paths change
  // }, [paths]);

  return (
    <Card variant="outlined">
      <div className='gMapCont'>
        <GoogleMap
          ref={mapRef} // Attach the ref to the GoogleMap component
          defaultZoom={15} // Set a reasonable default zoom level
          defaultCenter={{ lat: HANOI_LAT, lng: HANOI_LNG }} // Default to Hanoi
          center={currentPosition ? currentPosition.toJSON() : { lat: HANOI_LAT, lng: HANOI_LNG }}
        >
          <Polyline
            path={paths.map(p => ({
              lat: isValidCoordinate(p.lat) ? p.lat : HANOI_LAT,
              lng: isValidCoordinate(p.lng) ? p.lng : HANOI_LNG
            }))}
            options={{
              strokeColor: "#0088FF",
              strokeWeight: 6,
              strokeOpacity: 0.6,
              defaultVisible: true,
            }}
          />

          {stops?.data?.map((stop, index) => (
            <Marker
              key={index}
              position={{
                lat: isValidCoordinate(stop.lat) ? stop.lat : HANOI_LAT,
                lng: isValidCoordinate(stop.lng) ? stop.lng : HANOI_LNG
              }}
              title={stop.id}
              label={`${index + 1}`}
            />
          ))}

          {progress && (
            <>
              <Polyline
                path={progress}
                options={{ strokeColor: "orange" }}
              />

              <Marker
                icon={icon1}
                position={progress[progress.length - 1]}
              />
            </>
          )}
        </GoogleMap>
      </div>
    </Card>
  );
};

export default withScriptjs(
  withGoogleMap(
    Map
  )
);