import { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from 'react-simple-maps';
import { Focus, Globe2 } from 'lucide-react';
import type { Supplier, Facility, Corridor, SupplyFlow } from '../api/network.api';
import geoData from './world-110m.json';
import { overallTone } from '../utils/networkSemantics';

interface GeographicMapProps {
  suppliers?: Supplier[];
  facilities?: Facility[];
  corridors?: Corridor[];
  supplyFlows?: SupplyFlow[];
  highlightedNodeIds?: string[];
  isSelectedRecommended?: boolean;
  selectedCandidateName?: string;
  loading?: boolean;
}

// Dictionary to map facilities and corridors to Longitude/Latitude
const GEO_COORDINATES: Record<string, [number, number]> = {
  // Facilities
  'Ras Tanura Terminal': [50.16, 26.65],
  'Basrah Oil Terminal': [48.80, 29.68],
  'Fujairah / Jebel Dhanna': [56.36, 25.13],
  'Novorossiysk Terminal': [37.77, 44.72],
  'Jamnagar Refinery Complex': [69.84, 22.34],
  'Visakhapatnam Refinery & SPR': [83.21, 17.68],
  'Mangalore Refinery & SPR': [74.85, 12.91],
  'Rotterdam Storage': [4.48, 51.92],
  'West Siberia Fields': [75.0, 61.0],
  'Santos Basin': [-42.0, -25.0],
  
  // Corridors / Chokepoints
  'Strait of Hormuz': [56.25, 26.56],
  'Red Sea / Bab-el-Mandeb': [43.33, 12.58],
  'Saudi Petroline (East-West bypass)': [42.0, 24.0],
  'Panama Canal': [-79.72, 9.14],
  'Cape of Good Hope': [18.47, -34.35],
  'Strait of Malacca': [100.0, 4.0],
  'Taiwan Strait': [119.0, 24.0],
  'Strait of Gibraltar': [-5.6, 35.97],
  'Bosporus': [29.06, 41.22]
};

const getRiskColor = (status: string, score?: number | null) => {
  switch (overallTone(status, score)) {
    case 'critical': return 'var(--color-status-critical)';
    case 'warning': return 'var(--color-status-warning)';
    case 'normal': return 'var(--color-status-normal)';
    default: return 'var(--color-status-neutral)';
  }
};

export function GeographicMap({ 
  facilities = [], 
  corridors = [], 
  supplyFlows = [], 
  highlightedNodeIds = [],
  isSelectedRecommended = false,
  selectedCandidateName = '',
  loading = false 
}: GeographicMapProps) {
  
  const networkPosition = { coordinates: [20, 20] as [number, number], zoom: 1 };
  const [position, setPosition] = useState(networkPosition);
  const [tooltipContent, setTooltipContent] = useState<any>(null);

  const hasSelection = highlightedNodeIds && highlightedNodeIds.length > 0;
  const isHighlighted = (id: string) => !hasSelection || (highlightedNodeIds && highlightedNodeIds.includes(id));

  // Pre-calculate routes
  const routes = useMemo(() => {
    const selectedCorridorIds = new Set(
      corridors.filter(c => highlightedNodeIds.includes(c.id)).map(c => c.id)
    );

    return supplyFlows.map(flow => {
      const originFac = facilities.find(f => f.id === flow.origin_facility_id);
      const destFac = facilities.find(f => f.id === flow.destination_facility_id);
      const corridor = corridors.find(c => c.id === flow.corridor_id);
      
      if (!originFac || !destFac) return null;
      
      const oCoords = GEO_COORDINATES[originFac.name];
      const dCoords = GEO_COORDINATES[destFac.name];
      const cCoords = corridor ? GEO_COORDINATES[corridor.name] : null;
      
      if (!oCoords || !dCoords) return null;
      
      const isFlowHighlighted = selectedCorridorIds.size > 0
        ? Boolean(corridor && selectedCorridorIds.has(corridor.id))
        : isHighlighted(flow.id) ||
          (isHighlighted(originFac.id) && isHighlighted(destFac.id)) ||
          Boolean(corridor && isHighlighted(corridor.id));
      
      return {
        id: flow.id,
        status: flow.status,
        originFac,
        destFac,
        corridor,
        oCoords,
        dCoords,
        cCoords,
        isHighlighted: isFlowHighlighted
      };
    }).filter(Boolean);
  }, [supplyFlows, facilities, corridors, highlightedNodeIds, isHighlighted]);

  // If we have highlighted nodes but they didn't match any supply flow (e.g. a new reroute), 
  // construct a synthetic route so the map can render the recommendation.
  const syntheticRoutes = useMemo(() => {
    if (!hasSelection) return [];
    
    const hFacs = facilities.filter(f => isHighlighted(f.id));
    const hCorrs = corridors.filter(c => isHighlighted(c.id));
    
    if (hFacs.length === 0) return [];

    const originFac = hFacs[0];
    const destFac = hFacs.length > 1 ? hFacs[1] : hFacs[0];
    const corridor = hCorrs.length > 0 ? hCorrs[0] : undefined;

    const oCoords = GEO_COORDINATES[originFac.name];
    const dCoords = GEO_COORDINATES[destFac.name];
    const cCoords = corridor ? GEO_COORDINATES[corridor.name] : null;

    if (!oCoords || !dCoords) return [];

    return [{
      id: 'synthetic-route',
      status: 'ACTIVE',
      originFac,
      destFac,
      corridor,
      oCoords,
      dCoords,
      cCoords,
      isHighlighted: true,
      isSynthetic: true
    }];
  }, [hasSelection, routes, facilities, corridors, isHighlighted]);

  const allRoutes = [...routes, ...syntheticRoutes];

  // Determine Origin and Destination IDs from the highlighted route
  const highlightedRoute = allRoutes.find(r => r?.isHighlighted);
  const activeOriginId = highlightedRoute?.originFac.id;
  const activeDestinationId = highlightedRoute?.destFac.id;

  // Auto-center viewport when highlighted nodes change
  useEffect(() => {
    if (!hasSelection) {
      setPosition(networkPosition);
      return;
    }

    let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
    let foundCoords = false;

    const addCoord = (coord: [number, number]) => {
      minLon = Math.min(minLon, coord[0]);
      maxLon = Math.max(maxLon, coord[0]);
      minLat = Math.min(minLat, coord[1]);
      maxLat = Math.max(maxLat, coord[1]);
      foundCoords = true;
    };

    facilities.forEach(f => {
      if (isHighlighted(f.id) && GEO_COORDINATES[f.name]) addCoord(GEO_COORDINATES[f.name]);
    });
    corridors.forEach(c => {
      if (isHighlighted(c.id) && GEO_COORDINATES[c.name]) addCoord(GEO_COORDINATES[c.name]);
    });
    
    supplyFlows.forEach(sf => {
      if (isHighlighted(sf.id) || (isHighlighted(sf.origin_facility_id) && isHighlighted(sf.destination_facility_id))) {
        const origin = facilities.find(f => f.id === sf.origin_facility_id);
        const dest = facilities.find(f => f.id === sf.destination_facility_id);
        const corridor = corridors.find(c => c.id === sf.corridor_id);
        if (origin && GEO_COORDINATES[origin.name]) addCoord(GEO_COORDINATES[origin.name]);
        if (dest && GEO_COORDINATES[dest.name]) addCoord(GEO_COORDINATES[dest.name]);
        if (corridor && GEO_COORDINATES[corridor.name]) addCoord(GEO_COORDINATES[corridor.name]);
      }
    });

    if (foundCoords) {
      const centerLon = (minLon + maxLon) / 2;
      const centerLat = (minLat + maxLat) / 2;
      
      const lonDiff = maxLon - minLon;
      const latDiff = maxLat - minLat;
      const maxDiff = Math.max(lonDiff, latDiff, 10);
      const zoom = Math.min(6, 120 / maxDiff);

      setPosition({ coordinates: [centerLon, centerLat], zoom });
    }
  }, [highlightedNodeIds, facilities, corridors, supplyFlows, hasSelection]);

  if (loading) {
    return (
      <div className="h-full min-h-[320px] sm:min-h-[360px] lg:min-h-[420px] flex items-center justify-center bg-slate-950 rounded-[var(--radius-lg)] border border-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500"></div>
      </div>
    );
  }

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  return (
    <div className="relative w-full h-full min-h-0 bg-aegis-panel flex flex-col overflow-hidden">
      
      <style>{`
        @keyframes dashFlow {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .route-flow-animation {
          animation: dashFlow 1s linear infinite;
        }
        .map-marker:hover { transform: scale(1.12); }
        .map-marker { transform-box: fill-box; transform-origin: center; }
      `}</style>

      {/* Floating Route Label */}
      {hasSelection && selectedCandidateName && (
        <div className="absolute top-6 right-6 z-10 bg-aegis-base/90 backdrop-blur-md border border-aegis-border shadow-2xl p-4 rounded-[var(--radius-lg)] text-right max-w-sm">
          <div className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isSelectedRecommended ? 'text-aegis-cyan' : 'text-aegis-text-secondary'}`}>
            {isSelectedRecommended ? '★ SYSTEM RECOMMENDED' : 'ALTERNATIVE RESPONSE'}
          </div>
          <div className="text-sm font-semibold text-white leading-tight">
            {selectedCandidateName}
          </div>
        </div>
      )}

      <ComposableMap 
        projection="geoMercator"
        width={800}
        height={600}
        className="w-full h-full cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-aegis-blue focus-visible:outline-offset-[-2px]"
        role="application"
        aria-label="Interactive global supply network map"
        tabIndex={0}
      >
        <ZoomableGroup 
          zoom={position.zoom} 
          center={position.coordinates} 
          onMoveEnd={handleMoveEnd}
          maxZoom={15}
        >
          {/* Base Map */}
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#15213A"
                  stroke="#223252"
                  strokeWidth={0.5 / position.zoom}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1c2b4b", outline: "none" },
                    pressed: { outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>

          {/* Render Routes */}
          {allRoutes.map(r => {
            if (!r) return null;
            
            let strokeColor = "#475569";
            let strokeW = 1.5 / position.zoom;
            let opacity = 0.3;
            let glow = 'none';
            let strokeDasharray = undefined;

            if (r.isHighlighted) {
              if (isSelectedRecommended) {
                // System Recommended Route
                strokeColor = "var(--color-status-recommended)";
                strokeW = 4.5 / position.zoom;
                opacity = 1;
                glow = `drop-shadow(0px 0px ${6/position.zoom}px var(--color-status-recommended))`;
              } else {
                // Alternative Route
                strokeColor = "var(--color-status-alternative)";
                strokeW = 3 / position.zoom;
                opacity = 0.9;
                strokeDasharray = `${6/position.zoom} ${4/position.zoom}`;
                glow = `drop-shadow(0px 0px ${4/position.zoom}px var(--color-status-alternative))`;
              }
            } else if (hasSelection) {
              // Existing Network when something is selected
              const routeStatus = r.corridor?.status || r.status;
              strokeColor = getRiskColor(routeStatus, r.corridor?.risk_score);
              opacity = routeStatus === 'CRITICAL' || routeStatus === 'DISRUPTED' ? 0.65 : 0.35;
              strokeW = (routeStatus === 'CRITICAL' || routeStatus === 'DISRUPTED' ? 2 : 1.25) / position.zoom;
            }

            const lineStyle = {
              opacity,
              transition: "all 0.4s ease",
              filter: glow
            };

            const renderLine = (from: [number, number], to: [number, number]) => (
              <>
                <Line
                  from={from}
                  to={to}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  style={lineStyle}
                />
                {r.isHighlighted && isSelectedRecommended && (
                  // Directional Flow Animation Overlay
                  <Line
                    from={from}
                    to={to}
                    stroke="#FFFFFF"
                    strokeWidth={1.5 / position.zoom}
                    strokeLinecap="round"
                    strokeDasharray={`${2/position.zoom} ${8/position.zoom}`}
                    className="route-flow-animation"
                    style={{ opacity: 0.8 }}
                  />
                )}
              </>
            );

            return (
              <g
                key={r.id}
                className="cursor-pointer"
                onMouseEnter={() => setTooltipContent({ type: 'Route', data: { name: `${r.originFac.name} → ${r.destFac.name}`, status: r.corridor?.status || r.status, corridor: r.corridor?.name } })}
                onMouseLeave={() => setTooltipContent(null)}
              >
                {r.cCoords ? (
                  <>
                    {renderLine(r.oCoords, r.cCoords)}
                    {renderLine(r.cCoords, r.dCoords)}
                  </>
                ) : (
                  renderLine(r.oCoords, r.dCoords)
                )}
              </g>
            );
          })}

          {/* Render Corridors / Chokepoints */}
          {corridors.map(corridor => {
            const coords = GEO_COORDINATES[corridor.name];
            if (!coords) return null;
            
            const active = isHighlighted(corridor.id);
            const isHighRisk = overallTone(corridor.status, corridor.risk_score) === 'critical';
            const isSubdued = hasSelection && !active && !isHighRisk;
            const scale = 1 / position.zoom;
            const rColor = getRiskColor(corridor.status, corridor.risk_score);
            const isPetroline = corridor.name.includes('Petroline');
            const labelX = isPetroline ? -14 * scale : (isHighRisk ? 14 * scale : 0);
            const labelY = isPetroline ? 4 * scale : -12 * scale;
            const labelAnchor = isPetroline ? 'end' : (isHighRisk ? 'start' : 'middle');
            const mapLabel = isPetroline ? 'Saudi Petroline' : corridor.name;
            
            return (
              <Marker key={corridor.id} coordinates={coords}>
                <g 
                  className="map-marker"
                  style={{ opacity: isSubdued ? 0.3 : 1, transition: "transform 0.15s ease, opacity 0.3s ease", cursor: "pointer" }}
                  onMouseEnter={() => setTooltipContent({ type: 'Chokepoint', data: corridor, coords })}
                  onMouseLeave={() => setTooltipContent(null)}
                >
                  <polygon 
                    points={`0,-${12*scale} ${12*scale},${10*scale} -${12*scale},${10*scale}`}
                    fill={rColor} 
                    stroke="#0F172A"
                    strokeWidth={1.5*scale}
                    style={{ filter: active ? `drop-shadow(0px 0px ${6*scale}px ${rColor})` : 'none' }}
                  />
                  {(active || isHighRisk) && (
                    <text x={labelX} y={labelY} textAnchor={labelAnchor} fill="#F1F5F9" fontSize={10*scale} fontWeight="bold" style={{ textShadow: "0px 1px 4px #000" }}>
                      {mapLabel}
                    </text>
                  )}
                  {isHighRisk && (
                    <text x={14*scale} y={1*scale} textAnchor="start" fill={rColor} fontSize={8*scale} fontWeight="bold" style={{ textShadow: "0px 1px 4px #000" }}>
                      RISK {corridor.risk_score ?? '—'} · {corridor.status}
                    </text>
                  )}
                </g>
              </Marker>
            );
          })}

          {/* Render Facilities */}
          {facilities.map(facility => {
            const coords = GEO_COORDINATES[facility.name];
            if (!coords) return null;
            
            const active = isHighlighted(facility.id);
            const isSubdued = hasSelection && !active;
            const scale = 1 / position.zoom;
            
            const isOrigin = facility.id === activeOriginId;
            const isDest = facility.id === activeDestinationId;
            
            let fColor = "#64748B";
            let fSize = 4;
            let fLabel = "";
            let fLabelColor = "#94A3B8";

            if (active) {
              fSize = 5;
              fLabel = facility.name;
              fColor = "var(--color-status-neutral)";
              
              if (isOrigin) {
                fColor = "var(--color-status-normal)";
                fLabelColor = "var(--color-status-normal)";
                fSize = 7.5;
                fLabel = "ORIGIN";
              } else if (isDest) {
                fColor = "var(--color-status-alternative)";
                fLabelColor = "var(--color-status-alternative)";
                fSize = 7.5;
                fLabel = "DESTINATION";
              }
            }
            
            return (
              <Marker key={facility.id} coordinates={coords}>
                <g 
                  className="map-marker"
                  style={{ opacity: isSubdued ? 0.3 : 1, transition: "transform 0.15s ease, opacity 0.3s ease", cursor: "pointer" }}
                  onMouseEnter={() => setTooltipContent({ type: isOrigin ? 'Origin' : isDest ? 'Destination' : 'Facility', data: facility, coords })}
                  onMouseLeave={() => setTooltipContent(null)}
                >
                  <circle 
                    r={fSize * scale} 
                    fill={fColor} 
                    stroke="#0F172A" 
                    strokeWidth={2 * scale} 
                    style={{ filter: active ? `drop-shadow(0px 0px ${5*scale}px ${fColor})` : 'none' }}
                  />
                  {active && (
                    <text y={-14*scale} textAnchor="middle" fill={fLabelColor} fontSize={11*scale} fontWeight="900" style={{ textShadow: "0px 1px 4px rgba(0,0,0,0.9)" }}>
                      {fLabel}
                    </text>
                  )}
                  {active && (isOrigin || isDest) && (
                    <text y={18*scale} textAnchor="middle" fill="#F8FAFC" fontSize={10*scale} fontWeight="600" style={{ textShadow: "0px 1px 4px rgba(0,0,0,0.9)" }}>
                      {facility.name}
                    </text>
                  )}
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 w-[min(330px,calc(100%-72px))] rounded-[var(--radius-md)] border border-[#1E293B] bg-[#0B1120]/92 p-3 text-[10px] shadow-xl backdrop-blur-md">
        <div className="mb-2 font-bold uppercase tracking-widest text-slate-200">Route Status</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex items-center gap-3 text-slate-100 font-medium">
            <div className="w-6 h-1 rounded-full bg-status-recommended shadow-[0_0_8px_var(--color-status-recommended)] shrink-0"></div>
            <span className="truncate">Recommended</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-6 h-[3px] bg-transparent border-t-2 border-dashed border-status-alternative shrink-0"></div>
            <span className="truncate">Alternative</span>
          </div>
          <div className="flex items-center gap-3 text-slate-200">
            <div className="w-3 h-3 rounded-full bg-status-normal shrink-0"></div>
            <span className="truncate">Origin</span>
          </div>
          <div className="flex items-center gap-3 text-slate-200">
            <div className="w-3 h-3 rounded-full bg-status-alternative shrink-0"></div>
            <span className="truncate">Destination</span>
          </div>
          <div className="flex items-center gap-3 text-slate-200">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-status-critical shrink-0"></div>
            <span className="truncate">Risk / Chokepoint</span>
          </div>
          <div className="flex items-center gap-3 text-slate-200">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-status-warning shrink-0"></div>
            <span className="truncate">Elevated</span>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-3 right-3 md:bottom-6 md:right-6 flex flex-col gap-2 z-10">
        <button
          onClick={() => setPosition(networkPosition)}
          className="bg-aegis-base hover:bg-aegis-elevated active:bg-aegis-panel text-aegis-text-secondary hover:text-white w-9 h-9 rounded-[var(--radius-md)] shadow-lg flex items-center justify-center border border-aegis-border transition-colors"
          aria-label="Fit network"
          title="Fit Network"
        >
          <Globe2 size={15} />
        </button>
        <button
          onClick={() => {
            const route = allRoutes.find(r => r?.isHighlighted);
            if (!route) return;
            const points = [route.oCoords, route.dCoords, ...(route.cCoords ? [route.cCoords] : [])];
            const lons = points.map(p => p[0]);
            const lats = points.map(p => p[1]);
            const maxDiff = Math.max(Math.max(...lons) - Math.min(...lons), Math.max(...lats) - Math.min(...lats), 10);
            setPosition({ coordinates: [(Math.min(...lons) + Math.max(...lons)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2], zoom: Math.min(6, 120 / maxDiff) });
          }}
          disabled={!hasSelection}
          className="bg-aegis-base hover:bg-aegis-elevated active:bg-aegis-panel text-aegis-text-secondary hover:text-white w-9 h-9 rounded-[var(--radius-md)] shadow-lg flex items-center justify-center border border-aegis-border transition-colors"
          aria-label="Fit recommendation"
          title="Fit Recommendation"
        >
          <Focus size={15} />
        </button>
        <button 
          onClick={() => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 15) }))}
          className="bg-aegis-base hover:bg-aegis-elevated active:bg-aegis-panel text-aegis-text-secondary hover:text-white w-9 h-9 rounded-[var(--radius-md)] shadow-lg flex items-center justify-center border border-aegis-border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-aegis-blue"
          aria-label="Zoom in"
        >
          +
        </button>
        <button 
          onClick={() => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))}
          className="bg-aegis-base hover:bg-aegis-elevated active:bg-aegis-panel text-aegis-text-secondary hover:text-white w-9 h-9 rounded-[var(--radius-md)] shadow-lg flex items-center justify-center border border-aegis-border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-aegis-blue"
          aria-label="Zoom out"
        >
          -
        </button>
      </div>

      {/* Tooltip */}
      {tooltipContent && (
        <div className="absolute top-6 left-6 z-20 bg-aegis-base border border-aegis-border shadow-2xl p-4 rounded-[var(--radius-md)] min-w-[220px]">
          <div className="text-[10px] font-bold text-aegis-text-muted uppercase tracking-widest mb-1">{tooltipContent.type}</div>
          <div className="text-sm font-semibold text-white mb-3">{tooltipContent.data.name}</div>
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-aegis-text-secondary">Status</span>
              <span className="font-mono font-medium" style={{ color: getRiskColor(tooltipContent.data.status, tooltipContent.data.risk_score) }}>
                {tooltipContent.data.status}
              </span>
            </div>
            {['Origin', 'Destination', 'Facility'].includes(tooltipContent.type) && (
              <div className="flex justify-between items-center">
                <span className="text-aegis-text-secondary">Region</span>
                <span className="text-white">{tooltipContent.data.region}</span>
              </div>
            )}
            {tooltipContent.type === 'Chokepoint' && (
              <div className="flex justify-between items-center">
                <span className="text-aegis-text-secondary">Risk Profile</span>
                <span className="text-white">{tooltipContent.data.corridor_type}</span>
              </div>
            )}
            {tooltipContent.type === 'Route' && tooltipContent.data.corridor && (
              <div className="flex justify-between items-center gap-4">
                <span className="text-aegis-text-secondary">Via</span>
                <span className="text-white text-right">{tooltipContent.data.corridor}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
