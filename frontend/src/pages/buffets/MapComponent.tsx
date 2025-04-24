import React, { useEffect } from "react";

const MapComponent = ({ location }: { location: string }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [geocodingError, setGeocodingError] = React.useState<string | null>(null);

  useEffect(() => {
    if (mapRef.current && !map && window.google && window.google.maps) {
        const newMap = new google.maps.Map(mapRef.current, {
            center: { lat: 0, lng: 0 },
            zoom: 15,
            mapId: 'BUFFET_MAP_ID'
        });
        setMap(newMap);

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: location }, (results, status) => {
            setGeocodingError(null);
            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                 const geoLoc = results[0].geometry.location;
                 newMap.setCenter(geoLoc);
                 new google.maps.Marker({
                    position: geoLoc,
                    map: newMap,
                    title: location,
                 });
             } else {
                 console.error(`Geocode failed for "${location}": ${status}`);
                 setGeocodingError(`Could not find location on map (${status}).`);
                 newMap.setCenter({ lat: 40.7128, lng: -74.0060 });
                 newMap.setZoom(5);
             }
        });
    } else if (!window.google || !window.google.maps) {
        console.error("Google Maps JavaScript API not loaded.");
        setGeocodingError("Map script failed to load.");
    }
  }, [location, map]);

  return (
     <div style={{ width: "100%", height: "100%", position: 'relative' }}>
        {geocodingError && (
            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,0,0,0.7)', color: 'white', padding: '5px 10px', borderRadius: '4px', zIndex: 1 }}>
               {geocodingError}
            </div>
        )}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
     </div>
  );
};

export default MapComponent;
