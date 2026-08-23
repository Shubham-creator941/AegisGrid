import { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from 'react-simple-maps';
import type { Supplier, Facility, Corridor, SupplyFlow } from '../api/network.api';
import geoData from './world-110m.json';

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

const getRiskColor = (status: string) => {
  switch (status) {
    case 'CRITICAL': return '#EF4444';
    case 'DISRUPTED': return '#F97316';
    case 'MAINTENANCE': return '#F59E0B';
    case 'ACTIVE': return '#10B981';
    default: return '#64748B';
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
  
  const [position, setPosition] = useState({ coordinates: [45, 25] as [number, number], zoom: 1.5 });
  const [tooltipContent, setTooltipContent] = useState<any>(null);

  const hasSelection = highlightedNodeIds && highlightedNodeIds.length > 0;
  const isHighlighted = (id: string) => !hasSelection || (highlightedNodeIds && highlightedNodeIds.includes(id));

  // Pre-calculate routes
  const routes = useMemo(() => {
    return supplyFlows.map(flow => {
      const originFac = facilities.find(f => f.id === flow.origin_facility_id);
      const destFac = facilities.find(f => f.id === flow.destination_facility_id);
      const corridor = corridors.find(c => c.id === flow.corridor_id);
      
      if (!originFac || !destFac) return null;
      
      const oCoords = GEO_COORDINATES[originFac.name];
      const dCoords = GEO_COORDINATES[destFac.name];
      const cCoords = corridor ? GEO_COORDINATES[corridor.name] : null;
      
      if (!oCoords || !dCoords) return null;
      
      const isFlowHighlighted = isHighlighted(flow.id) || 
                               (isHighlighted(originFac.id) && isHighlighted(destFac.id)) ||
                               (corridor && isHighlighted(corridor.id));
      
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
  }, [supplyFlows, facilities, corridors, isHighlighted]);

  // If we have highlighted nodes but they didn't match any supply flow (e.g. a new reroute), 
  // construct a synthetic route so the map can render the recommendation.
  const syntheticRoutes = useMemo(() => {
    if (!hasSelection || routes.some(r => r?.isHighlighted)) return [];
    
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
      setPosition({ coordinates: [45, 25], zoom: 1.5 });
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
      <div className="h-full min-h-[500px] flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500"></div>
      </div>
    );
  }

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#0B1120] flex flex-col overflow-hidden">
      
      <style>{`
        @keyframes dashFlow {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .route-flow-animation {
          animation: dashFlow 1s linear infinite;
        }
      `}</style>

      {/* Floating Route Label */}
      {hasSelection && selectedCandidateName && (
        <div className="absolute top-6 right-6 z-10 bg-[#0B1120]/90 backdrop-blur-md border border-[#1E293B] shadow-2xl p-4 rounded-xl text-right max-w-sm">
          <div className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isSelectedRecommended ? 'text-[#22D3EE]' : 'text-slate-400'}`}>
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
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
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
                  fill="#1E293B"
                  stroke="#0F172A"
                  strokeWidth={0.5 / position.zoom}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#334155", outline: "none" },
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
            let opacity = 0.4;
            let glow = 'none';
            let strokeDasharray = undefined;

            if (r.isHighlighted) {
              if (isSelectedRecommended) {
                // System Recommended Route
                strokeColor = "#22D3EE";
                strokeW = 4 / position.zoom;
                opacity = 1;
                glow = `drop-shadow(0px 0px ${8/position.zoom}px rgba(34,211,238,0.5))`;
              } else {
                // Alternative Route
                strokeColor = "#64748B";
                strokeW = 2.5 / position.zoom;
                opacity = 0.9;
                strokeDasharray = `${6/position.zoom} ${4/position.zoom}`;
              }
            } else if (hasSelection) {
              // Existing Network when something is selected
              opacity = 0.2;
              strokeW = 1 / position.zoom;
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
              <g key={r.id}>
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
            const isSubdued = hasSelection && !active;
            const scale = 1 / position.zoom;
            const rColor = getRiskColor(corridor.status);
            
            return (
              <Marker key={corridor.id} coordinates={coords}>
                <g 
                  style={{ opacity: isSubdued ? 0.3 : 1, transition: "all 0.3s ease", cursor: "pointer" }}
                  onMouseEnter={() => setTooltipContent({ type: 'Chokepoint', data: corridor, coords })}
                  onMouseLeave={() => setTooltipContent(null)}
                >
                  <polygon 
                    points={`0,-${10*scale} ${10*scale},${8*scale} -${10*scale},${8*scale}`}
                    fill={rColor} 
                    stroke="#0F172A"
                    strokeWidth={1.5*scale}
                    style={{ filter: active ? `drop-shadow(0px 0px ${5*scale}px ${rColor})` : 'none' }}
                  />
                  {active && (
                    <text y={-14*scale} textAnchor="middle" fill="#F1F5F9" fontSize={10*scale} fontWeight="bold" style={{ textShadow: "0px 1px 3px #000" }}>
                      {corridor.name}
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
              fColor = "#94A3B8";
              
              if (isOrigin) {
                fColor = "#22C55E";
                fLabelColor = "#4ADE80";
                fSize = 7;
                fLabel = "ORIGIN";
              } else if (isDest) {
                fColor = "#A78BFA";
                fLabelColor = "#C084FC";
                fSize = 7;
                fLabel = "DESTINATION";
              }
            }
            
            return (
              <Marker key={facility.id} coordinates={coords}>
                <g 
                  style={{ opacity: isSubdued ? 0.3 : 1, transition: "all 0.3s ease", cursor: "pointer" }}
                  onMouseEnter={() => setTooltipContent({ type: isOrigin ? 'Origin' : isDest ? 'Destination' : 'Facility', data: facility, coords })}
                  onMouseLeave={() => setTooltipContent(null)}
                >
                  <circle 
                    r={fSize * scale} 
                    fill={fColor} 
                    stroke="#0F172A" 
                    strokeWidth={1.5 * scale} 
                    style={{ filter: active ? `drop-shadow(0px 0px ${4*scale}px ${fColor})` : 'none' }}
                  />
                  {active && (
                    <text y={-12*scale} textAnchor="middle" fill={fLabelColor} fontSize={10*scale} fontWeight="900" style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}>
                      {fLabel}
                    </text>
                  )}
                  {active && (isOrigin || isDest) && (
                    <text y={18*scale} textAnchor="middle" fill="#F8FAFC" fontSize={9*scale} fontWeight="600" style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}>
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
      <div className="absolute bottom-6 left-6 z-10 bg-[#0B1120]/90 backdrop-blur-sm border border-[#1E293B] shadow-xl p-4 rounded-xl text-xs w-48">
        <div className="font-bold text-slate-300 uppercase tracking-widest mb-3 text-[10px]">Route Status</div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3 text-slate-300 font-medium">
            <div className="w-6 h-1 rounded-full bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
            Recommended
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-6 h-[2px] bg-transparent border-t-2 border-dashed border-[#64748B]"></div>
            Alternative
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></div>
            Origin
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-2.5 h-2.5 rounded-full bg-[#A78BFA]"></div>
            Destination
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-[#EF4444]"></div>
            Risk / Chokepoint
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button 
          onClick={() => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 15) }))}
          className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 w-8 h-8 rounded-lg shadow-lg flex items-center justify-center border border-[#0F172A] transition-colors"
        >
          +
        </button>
        <button 
          onClick={() => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))}
          className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 w-8 h-8 rounded-lg shadow-lg flex items-center justify-center border border-[#0F172A] transition-colors"
        >
          -
        </button>
      </div>

      {/* Tooltip */}
      {tooltipContent && (
        <div className="absolute top-6 left-6 z-20 bg-[#0B1120] border border-slate-700 shadow-2xl p-4 rounded-lg min-w-[220px]">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{tooltipContent.type}</div>
          <div className="text-sm font-semibold text-white mb-3">{tooltipContent.data.name}</div>
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status</span>
              <span className="font-mono font-medium" style={{ color: getRiskColor(tooltipContent.data.status) }}>
                {tooltipContent.data.status}
              </span>
            </div>
            {['Origin', 'Destination', 'Facility'].includes(tooltipContent.type) && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Region</span>
                <span className="text-slate-300">{tooltipContent.data.region}</span>
              </div>
            )}
            {tooltipContent.type === 'Chokepoint' && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Risk Profile</span>
                <span className="text-slate-300">{tooltipContent.data.corridor_type}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
