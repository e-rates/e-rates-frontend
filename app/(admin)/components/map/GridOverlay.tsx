'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface GridOverlayProps {
  visible: boolean;
  gridColor?: string;
  gridOpacity?: number;
}

const GridOverlay: React.FC<GridOverlayProps> = ({
  visible,
  gridColor = '#3B82F6',
  gridOpacity = 0.3,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!visible) return;

    if (!map.getPane('gridPane')) {
      const gridPane = map.createPane('gridPane');
      gridPane.style.zIndex = '400';
      gridPane.style.pointerEvents = 'none';
    }

    const svg = L.svg({ pane: 'gridPane' });
    svg.addTo(map);

    const drawGrid = () => {
      const container = map.getPane('gridPane');
      if (!container) return;

      const existingSvg = container.querySelector('svg');
      if (existingSvg) {
        existingSvg.innerHTML = '';
      }

      const bounds = map.getBounds();
      const zoom = map.getZoom();
      const mapSize = map.getSize();

      let gridSpacingLat: number;
      let gridSpacingLng: number;

      if (zoom >= 15) {
        gridSpacingLat = 0.001;
        gridSpacingLng = 0.001;
      } else if (zoom >= 13) {
        gridSpacingLat = 0.005;
        gridSpacingLng = 0.005;
      } else if (zoom >= 11) {
        gridSpacingLat = 0.01;
        gridSpacingLng = 0.01;
      } else if (zoom >= 9) {
        gridSpacingLat = 0.05;
        gridSpacingLng = 0.05;
      } else if (zoom >= 7) {
        gridSpacingLat = 0.25;
        gridSpacingLng = 0.25;
      } else if (zoom >= 5) {
        gridSpacingLat = 0.5;
        gridSpacingLng = 0.5;
      } else {
        gridSpacingLat = 1.0;
        gridSpacingLng = 1.0;
      }

      const south =
        Math.floor(bounds.getSouth() / gridSpacingLat) * gridSpacingLat;
      const north =
        Math.ceil(bounds.getNorth() / gridSpacingLat) * gridSpacingLat;
      const west =
        Math.floor(bounds.getWest() / gridSpacingLng) * gridSpacingLng;
      const east =
        Math.ceil(bounds.getEast() / gridSpacingLng) * gridSpacingLng;

      const labelFrequency =
        zoom >= 13 ? 2 : zoom >= 11 ? 2 : zoom >= 9 ? 2 : zoom >= 7 ? 1 : 1;

      const adjustedOpacity =
        zoom >= 9
          ? gridOpacity
          : zoom >= 7
            ? gridOpacity * 0.6
            : gridOpacity * 0.4;

      let latLineCount = 0;
      let lngLineCount = 0;

      for (let lat = south; lat <= north; lat += gridSpacingLat) {
        const start = map.latLngToLayerPoint([lat, west]);
        const end = map.latLngToLayerPoint([lat, east]);

        const line = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'line'
        );
        line.setAttribute('x1', start.x.toString());
        line.setAttribute('y1', start.y.toString());
        line.setAttribute('x2', end.x.toString());
        line.setAttribute('y2', end.y.toString());
        line.setAttribute('stroke', gridColor);
        line.setAttribute('stroke-width', '1');
        line.setAttribute('opacity', adjustedOpacity.toString());
        line.setAttribute('stroke-dasharray', '5,5');

        existingSvg?.appendChild(line);

        const leftLabelPoint = map.latLngToLayerPoint([lat, bounds.getWest()]);
        if (
          leftLabelPoint.y > 30 &&
          leftLabelPoint.y < mapSize.y - 30 &&
          latLineCount % labelFrequency === 0
        ) {
          const leftText = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
          );
          leftText.setAttribute('x', '8');
          leftText.setAttribute('y', leftLabelPoint.y.toString());
          leftText.setAttribute('fill', gridColor);
          leftText.setAttribute('font-size', '9');
          leftText.setAttribute('font-family', 'monospace');
          leftText.setAttribute('dominant-baseline', 'middle');
          leftText.setAttribute('class', 'drop-shadow-sm');
          leftText.textContent = `${lat.toFixed(4)}°`;
          existingSvg?.appendChild(leftText);
        }

        const rightLabelPoint = map.latLngToLayerPoint([lat, bounds.getEast()]);
        if (
          rightLabelPoint.y > 30 &&
          rightLabelPoint.y < mapSize.y - 30 &&
          latLineCount % labelFrequency === 0
        ) {
          const rightText = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
          );
          rightText.setAttribute('x', (mapSize.x - 8).toString());
          rightText.setAttribute('y', rightLabelPoint.y.toString());
          rightText.setAttribute('fill', gridColor);
          rightText.setAttribute('font-size', '9');
          rightText.setAttribute('font-family', 'monospace');
          rightText.setAttribute('text-anchor', 'end');
          rightText.setAttribute('dominant-baseline', 'middle');
          rightText.setAttribute('class', 'drop-shadow-sm');
          rightText.textContent = `${lat.toFixed(4)}°`;
          existingSvg?.appendChild(rightText);
        }

        latLineCount++;
      }

      for (let lng = west; lng <= east; lng += gridSpacingLng) {
        const start = map.latLngToLayerPoint([south, lng]);
        const end = map.latLngToLayerPoint([north, lng]);

        const line = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'line'
        );
        line.setAttribute('x1', start.x.toString());
        line.setAttribute('y1', start.y.toString());
        line.setAttribute('x2', end.x.toString());
        line.setAttribute('y2', end.y.toString());
        line.setAttribute('stroke', gridColor);
        line.setAttribute('stroke-width', '1');
        line.setAttribute('opacity', adjustedOpacity.toString());
        line.setAttribute('stroke-dasharray', '5,5');

        existingSvg?.appendChild(line);

        const topLabelPoint = map.latLngToLayerPoint([bounds.getNorth(), lng]);
        if (
          topLabelPoint.x > 70 &&
          topLabelPoint.x < mapSize.x - 70 &&
          lngLineCount % labelFrequency === 0
        ) {
          const topText = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
          );
          topText.setAttribute('x', topLabelPoint.x.toString());
          topText.setAttribute('y', '18');
          topText.setAttribute('fill', gridColor);
          topText.setAttribute('font-size', '9');
          topText.setAttribute('font-family', 'monospace');
          topText.setAttribute('text-anchor', 'middle');
          topText.setAttribute('class', 'drop-shadow-sm');
          topText.textContent = `${lng.toFixed(4)}°`;
          existingSvg?.appendChild(topText);
        }

        const bottomLabelPoint = map.latLngToLayerPoint([
          bounds.getSouth(),
          lng,
        ]);
        if (
          bottomLabelPoint.x > 70 &&
          bottomLabelPoint.x < mapSize.x - 70 &&
          lngLineCount % labelFrequency === 0
        ) {
          const bottomText = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
          );
          bottomText.setAttribute('x', bottomLabelPoint.x.toString());
          bottomText.setAttribute('y', (mapSize.y - 8).toString());
          bottomText.setAttribute('fill', gridColor);
          bottomText.setAttribute('font-size', '9');
          bottomText.setAttribute('font-family', 'monospace');
          bottomText.setAttribute('text-anchor', 'middle');
          bottomText.setAttribute('class', 'drop-shadow-sm');
          bottomText.textContent = `${lng.toFixed(4)}°`;
          existingSvg?.appendChild(bottomText);
        }

        lngLineCount++;
      }
    };

    // Initial draw
    drawGrid();

    // Only redraw on zoom changes and resize events
    // Remove moveend to prevent redraw on every pan
    map.on('zoomend', drawGrid);
    map.on('resize', drawGrid);

    // Listen for window resize events (for sidebar toggle)
    const handleWindowResize = () => {
      setTimeout(() => {
        map.invalidateSize();
        drawGrid();
      }, 350);
    };

    window.addEventListener('resize', handleWindowResize);

    // Cleanup
    return () => {
      map.off('zoomend', drawGrid);
      map.off('resize', drawGrid);
      window.removeEventListener('resize', handleWindowResize);
      svg.remove();
    };
  }, [visible, map, gridColor, gridOpacity]);

  return null;
};

export default GridOverlay;
