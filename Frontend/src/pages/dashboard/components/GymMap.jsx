import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { ALL_GYMS } from '../../../utils/gymsByCounty';
import { normalizeSearchText, sortByHungarianLabel } from '../dashboardShared';

const HUNGARY_CENTER = [47.1625, 19.5033];
const HUNGARY_BOUNDS = [
  [45.7, 15.9],
  [48.7, 22.95]
];
const HUNGARY_LAT_BOUNDS = {
  min: HUNGARY_BOUNDS[0][0],
  max: HUNGARY_BOUNDS[1][0]
};
const HUNGARY_LNG_BOUNDS = {
  min: HUNGARY_BOUNDS[0][1],
  max: HUNGARY_BOUNDS[1][1]
};
const NEARBY_RADIUS_KM = 45;

const toRadians = (value) => (value * Math.PI) / 180;

const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (distanceKm) => {
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} km`;
  return `${Math.round(distanceKm)} km`;
};

const isWithinHungary = (lat, lng) => (
  lat >= HUNGARY_LAT_BOUNDS.min &&
  lat <= HUNGARY_LAT_BOUNDS.max &&
  lng >= HUNGARY_LNG_BOUNDS.min &&
  lng <= HUNGARY_LNG_BOUNDS.max
);

const hasValidCoordinate = (value) => Number.isFinite(value) && !Number.isNaN(value);
const isValidLatLng = (lat, lng) => hasValidCoordinate(lat) && hasValidCoordinate(lng);

const hasRenderableMapSize = (map) => {
  const container = map?.getContainer?.();
  return Boolean(container && container.clientWidth > 0 && container.clientHeight > 0);
};

const isLeafletMapReady = (map) => {
  if (!map || typeof map.getContainer !== 'function') return false;

  const container = map.getContainer();
  return Boolean(container && container.isConnected && map._loaded && map._mapPane);
};

const safeSetHungaryView = (map) => {
  if (!isLeafletMapReady(map)) return;

  try {
    map.setView(HUNGARY_CENTER, 7, { animate: false });
  } catch (error) {
    console.warn('Térkép nézet visszaállítási hiba:', error);
  }
};

const safeFitBounds = (map, bounds, fallbackToHungary = true) => {
  if (!isLeafletMapReady(map)) return;

  const normalizedBounds = Array.isArray(bounds)
    ? bounds.filter((entry) => Array.isArray(entry) && isValidLatLng(entry[0], entry[1]))
    : [];

  if (!hasRenderableMapSize(map) || normalizedBounds.length === 0) {
    if (fallbackToHungary) {
      safeSetHungaryView(map);
    }
    return;
  }

  try {
    map.fitBounds(normalizedBounds, { padding: [24, 24], animate: false });
  } catch (error) {
    console.warn('Térkép bounds hiba, fallback magyar nézetre:', error);
    if (fallbackToHungary) {
      safeSetHungaryView(map);
    }
  }
};

const getMarkerPosition = (gym, duplicateIndex) => {
  const angle = (duplicateIndex % 6) * (Math.PI / 3);
  const ring = Math.floor(duplicateIndex / 6) + 1;
  const offset = 0.008 * ring;

  return [
    gym.lat + Math.sin(angle) * offset,
    gym.lng + Math.cos(angle) * offset
  ];
};

const gymMarkerIcon = L.divIcon({
  className: 'gym-leaflet-marker',
  html: '<span></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -8]
});

const GymMap = ({ isActive }) => {
  const [mapMode, setMapMode] = useState('country');
  const [nearbyCenter, setNearbyCenter] = useState(null);
  const [visibleGyms, setVisibleGyms] = useState(ALL_GYMS);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [mapMessage, setMapMessage] = useState(`Az országos nézet mind a ${ALL_GYMS.length} várost és az azokon belüli edzőtermeket egyszerre mutatja Magyarország térképén.`);
  const mapElementRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerLayerRef = useRef(null);

  const openGoogleMaps = () => {
    if (mapMode === 'nearby' && nearbyCenter) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent('edzőterem')}/@${nearbyCenter.lat},${nearbyCenter.lng},12z`, '_blank');
      return;
    }

    window.open(`https://www.google.com/maps/search/${encodeURIComponent('edzőterem Magyarország')}/@${HUNGARY_CENTER[0]},${HUNGARY_CENTER[1]},7z`, '_blank');
  };

  const getCityGoogleMapsUrl = (gym) => (
    `https://www.google.com/maps/search/${encodeURIComponent(gym.mapQuery || `${gym.name} ${gym.cityLabel}`)}/@${gym.lat},${gym.lng},13z`
  );

  const openCityGymSearch = (gym) => {
    window.open(getCityGoogleMapsUrl(gym), '_blank');
  };

  const visibleCityGyms = visibleGyms.map((gym) => ({
    cityKey: gym.cityKey,
    cityLabel: gym.cityLabel,
    countyLabel: gym.countyLabel,
    mapQuery: gym.mapQuery,
    distanceKm: gym.distanceKm,
    lat: gym.lat,
    lng: gym.lng,
    name: gym.name
  }));
  const normalizedCitySearchQuery = normalizeSearchText(citySearchQuery.trim());
  const filteredVisibleCityGyms = (normalizedCitySearchQuery
    ? visibleCityGyms.filter((gym) => normalizeSearchText(gym.cityLabel).includes(normalizedCitySearchQuery))
    : visibleCityGyms
  ).slice().sort((firstGym, secondGym) => {
    const citySort = sortByHungarianLabel(firstGym.cityLabel, secondGym.cityLabel);
    if (citySort !== 0) return citySort;
    return sortByHungarianLabel(firstGym.countyLabel, secondGym.countyLabel);
  });

  useEffect(() => {
    if (!mapElementRef.current || leafletMapRef.current) return;

    const map = L.map(mapElementRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      maxBounds: HUNGARY_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 7
    }).setView(HUNGARY_CENTER, 7);

    map.scrollWheelZoom.disable();

    const enableScrollZoom = () => {
      if (!map.scrollWheelZoom.enabled()) {
        map.scrollWheelZoom.enable();
      }
    };

    const disableScrollZoom = () => {
      if (map.scrollWheelZoom.enabled()) {
        map.scrollWheelZoom.disable();
      }
    };

    const handleDocumentPointerDown = (event) => {
      if (!mapElementRef.current?.contains(event.target)) {
        disableScrollZoom();
      }
    };

    mapElementRef.current.addEventListener('click', enableScrollZoom);
    mapElementRef.current.addEventListener('mouseleave', disableScrollZoom);
    document.addEventListener('pointerdown', handleDocumentPointerDown);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap közreműködők',
      noWrap: true
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    leafletMapRef.current = map;

    window.requestAnimationFrame(() => {
      map.invalidateSize();
      safeSetHungaryView(map);
    });

    return () => {
      mapElementRef.current?.removeEventListener('click', enableScrollZoom);
      mapElementRef.current?.removeEventListener('mouseleave', disableScrollZoom);
      document.removeEventListener('pointerdown', handleDocumentPointerDown);
      markerLayerRef.current?.clearLayers();
      map.remove();
      markerLayerRef.current = null;
      leafletMapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isActive || !leafletMapRef.current) return;

    const map = leafletMapRef.current;
    const refreshMapSize = () => {
      if (!isLeafletMapReady(map)) return;
      map.invalidateSize();
      try {
        map.panInsideBounds(HUNGARY_BOUNDS, { animate: false });
      } catch (error) {
        console.warn('Térkép pozicionálási hiba:', error);
      }
    };

    const timeoutId = window.setTimeout(refreshMapSize, 120);
    window.requestAnimationFrame(refreshMapSize);

    return () => window.clearTimeout(timeoutId);
  }, [isActive, mapMode]);

  useEffect(() => {
    if (!leafletMapRef.current || !markerLayerRef.current) return;

    const map = leafletMapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!isLeafletMapReady(map)) return;
    markerLayer.clearLayers();

    const gymsWithDistance = ALL_GYMS.map((gym) => {
      if (!isValidLatLng(gym.lat, gym.lng)) {
        return null;
      }

      if (!nearbyCenter) {
        return { ...gym, distanceKm: null };
      }

      return {
        ...gym,
        distanceKm: calculateDistanceKm(nearbyCenter.lat, nearbyCenter.lng, gym.lat, gym.lng)
      };
    }).filter(Boolean);

    const gymsToRender = mapMode === 'nearby' && nearbyCenter
      ? gymsWithDistance
          .filter((gym) => gym.distanceKm <= NEARBY_RADIUS_KM)
          .sort((firstGym, secondGym) => firstGym.distanceKm - secondGym.distanceKm)
          .slice(0, 25)
      : gymsWithDistance;

    const fallbackNearbyGyms = mapMode === 'nearby' && nearbyCenter && gymsToRender.length === 0
      ? gymsWithDistance
          .sort((firstGym, secondGym) => firstGym.distanceKm - secondGym.distanceKm)
          .slice(0, 12)
      : gymsToRender;

    const finalGyms = fallbackNearbyGyms;
    setVisibleGyms(finalGyms);
    const duplicateCounts = {};
    const markerBounds = [];

    finalGyms.forEach((gym) => {
      const duplicateIndex = duplicateCounts[gym.cityLabel] || 0;
      duplicateCounts[gym.cityLabel] = duplicateIndex + 1;
      const [markerLat, markerLng] = getMarkerPosition(gym, duplicateIndex);
      if (!isValidLatLng(markerLat, markerLng)) return;
      const distanceLine = gym.distanceKm !== null ? `<p><strong>Távolság:</strong> ${formatDistance(gym.distanceKm)}</p>` : '';
      const marker = L.marker([markerLat, markerLng], { icon: gymMarkerIcon })
        .bindTooltip(gym.name, {
          permanent: false,
          sticky: true,
          direction: 'top',
          offset: [0, -10],
          className: 'gym-marker-label'
        })
        .bindPopup(`
        <div class="gym-popup">
          <h4>${gym.name}</h4>
          <p><strong>Vármegye:</strong> ${gym.countyLabel}</p>
          <p><strong>Város:</strong> ${gym.cityLabel}</p>
          ${distanceLine}
          <a href="${getCityGoogleMapsUrl(gym)}" target="_blank" rel="noreferrer">Megnyitás Google Mapsben</a>
        </div>
      `);

      marker.addTo(markerLayer);
      markerBounds.push([markerLat, markerLng]);
    });

    if (mapMode === 'nearby' && nearbyCenter && isValidLatLng(nearbyCenter.lat, nearbyCenter.lng)) {
      L.circleMarker([nearbyCenter.lat, nearbyCenter.lng], {
        radius: 8,
        weight: 3,
        color: '#0f4c5c',
        fillColor: '#2a9d8f',
        fillOpacity: 0.95
      })
        .bindTooltip('Itt vagy most', {
          permanent: false,
          sticky: true,
          direction: 'top',
          offset: [0, -10],
          className: 'gym-marker-label current-location-label'
        })
        .bindPopup('A jelenlegi helyzeted')
        .addTo(markerLayer);

      markerBounds.push([nearbyCenter.lat, nearbyCenter.lng]);
    }

    if (mapMode === 'nearby' && nearbyCenter) {
      const withinRadiusCount = gymsWithDistance.filter((gym) => gym.distanceKm <= NEARBY_RADIUS_KM).length;
      if (withinRadiusCount > 0) {
        setMapMessage(`A közelben nézet ${withinRadiusCount} edzőtermet talált ${NEARBY_RADIUS_KM} km-en belül. A térképen a legközelebbi ${finalGyms.length} terem látszik.`);
      } else {
        setMapMessage('A közelben nézetben nem volt 45 km-en belül találat, ezért a térkép a legközelebbi edzőtermeket mutatja.');
      }
    } else {
      setMapMessage(`Az országos nézet mind a ${ALL_GYMS.length} várost és az azokon belüli edzőtermeket egyszerre mutatja Magyarország térképén.`);
    }

    if (mapMode === 'country') {
      safeSetHungaryView(map);
    } else if (markerBounds.length > 0) {
      safeFitBounds(map, markerBounds);
    } else {
      safeSetHungaryView(map);
    }

    try {
      map.panInsideBounds(HUNGARY_BOUNDS, { animate: false });
    } catch (error) {
      console.warn('Térkép bounds igazítási hiba:', error);
    }
  }, [mapMode, nearbyCenter]);

  const showCountrywideGyms = () => {
    setMapMode('country');
  };

  const showNearbyGyms = () => {
    if (!navigator.geolocation) {
      setMapMessage('A böngésző nem támogatja a helymeghatározást, ezért csak az országos nézet érhető el.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        if (!isValidLatLng(center.lat, center.lng)) {
          setMapMode('country');
          setMapMessage('A helymeghatározás hibás koordinátát adott vissza, ezért az országos nézet maradt aktív.');
          return;
        }

        if (!isWithinHungary(center.lat, center.lng)) {
          setMapMode('country');
          setMapMessage('A közelben nézet csak magyarországi helyzettel működik, ezért az országos nézet maradt aktív.');
          return;
        }

        setNearbyCenter(center);
        setMapMode('nearby');
      },
      () => {
        setMapMode('country');
        setMapMessage('A helymeghatározás nem sikerült vagy nincs engedélyezve. Az országos nézet marad aktív.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="gyms-container">
      <div className="gyms-header-banner">
        <i className="fas fa-map-marked-alt"></i>
        <h3>Magyarország edzőtermei térképen</h3>
        <p>{mapMessage}</p>
      </div>
      <div className="gym-map-mode-switch">
        <button
          type="button"
          className={`gym-mode-btn ${mapMode === 'country' ? 'active' : ''}`}
          onClick={showCountrywideGyms}
        >
          <i className="fas fa-globe-europe"></i> Országos
        </button>
        <button
          type="button"
          className={`gym-mode-btn ${mapMode === 'nearby' ? 'active' : ''}`}
          onClick={showNearbyGyms}
        >
          <i className="fas fa-location-crosshairs"></i> Közelben
        </button>
      </div>
      <div className="gym-map-meta-row">
        <div className="gym-map-count-card">
          <span className="gym-map-count-label">Látható helyek</span>
          <strong>{mapMode === 'nearby' && nearbyCenter ? 'Közeli termek' : 'Országos lista'}</strong>
          <span>{mapMode === 'nearby' && nearbyCenter ? 'Geolokáció alapján szűrve' : `${ALL_GYMS.length} város edzőtermekkel az adatbázisban`}</span>
        </div>
      </div>
      <div className="gym-map-frame-wrap">
        <div ref={mapElementRef} className="gym-map-frame" aria-label="Magyarországi edzőtermek térképe"></div>
      </div>
      <div className="gym-map-actions">
        <button className="btn btn-secondary gym-expand-btn" onClick={openGoogleMaps}>
          <i className="fas fa-expand"></i> Megnyitás nagy térképen
        </button>
        <button className="btn-gym-direction" onClick={openGoogleMaps}>
          <i className="fas fa-directions"></i> Megnyitás Google Mapsben
        </button>
      </div>
      <div className="gym-city-results">
        <div className="gym-city-search-row">
          <label className="gym-city-search-label" htmlFor="gym-city-search">Város keresése</label>
          <input
            id="gym-city-search"
            type="text"
            className="form-control gym-city-search-input"
            placeholder="Kezdd el beírni a város nevét..."
            value={citySearchQuery}
            onChange={(event) => setCitySearchQuery(event.target.value)}
          />
        </div>
        <div className="gym-city-results-header">
          <h4>{mapMode === 'nearby' ? 'Közeli városok edzőtermei' : 'Városok edzőtermei'}</h4>
          <span>{filteredVisibleCityGyms.length} város</span>
        </div>
        <div className="gym-city-grid">
          {filteredVisibleCityGyms.map((gym) => (
            <div key={`${gym.cityKey}-${gym.mapQuery}`} className="gym-city-card">
              <div className="gym-city-card-top">
                <div>
                  <h5>{gym.cityLabel}</h5>
                  <p>{gym.countyLabel}</p>
                </div>
                {gym.distanceKm !== null && gym.distanceKm !== undefined && (
                  <span className="gym-city-distance">{formatDistance(gym.distanceKm)}</span>
                )}
              </div>
              <button type="button" className="btn btn-secondary gym-city-open-btn" onClick={() => openCityGymSearch(gym)}>
                <i className="fas fa-map-location-dot"></i> {gym.cityLabel} edzőtermei
              </button>
            </div>
          ))}
          {filteredVisibleCityGyms.length === 0 && (
            <div className="gym-city-empty-state">
              Nincs találat erre a városnévre.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymMap;