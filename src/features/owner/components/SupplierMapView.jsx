import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { FaLocationDot } from "react-icons/fa6";
import { useGoogleMaps } from "../../../hooks/useGoogleMaps";
import SupplierInfoCard from "./SupplierInfoCard";

const MINE_COLOR = "#05df72";
const PLATFORM_COLOR = "#4f7cff";

const DARK_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#0d1020" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b6c7a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1020" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#2b2c40" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1a1d33" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#262a4a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#05060f" }],
  },
];

const iconCache = {};
function pinIcon(maps, color) {
  if (!iconCache[color]) {
    const svg = renderToStaticMarkup(
      <FaLocationDot
        size={34}
        fill={color}
        stroke="#ffffff"
        strokeWidth={20}
      />,
    );
    iconCache[color] =
      `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
  return {
    url: iconCache[color],
    scaledSize: new maps.Size(34, 34),
    anchor: new maps.Point(17, 34),
  };
}

function LegendDot({ className, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      <span>{label}</span>
    </div>
  );
}

function SupplierMapView({
  origin,
  radiusKm,
  suppliers,
  selectedId,
  dark,
  onSelect,
  onSendRfq,
}) {
  const { maps, error } = useGoogleMaps();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const infoRef = useRef(null);
  const overlaysRef = useRef({
    markers: new Map(),
    circle: null,
    origin: null,
  });
  const contentRef = useRef(null);
  const handlersRef = useRef({ onSelect, onSendRfq });

  useEffect(() => {
    handlersRef.current = { onSelect, onSendRfq };
  }, [onSelect, onSendRfq]);

  useEffect(() => {
    if (!maps || !containerRef.current || mapRef.current || !origin) return;
    mapRef.current = new maps.Map(containerRef.current, {
      center: { lat: origin.latitude, lng: origin.longitude },
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
      gestureHandling: "greedy",
    });
    infoRef.current = new maps.InfoWindow({ headerDisabled: true });
    infoRef.current.addListener("domready", () => {
      contentRef.current?.closest(".gm-style-iw-c")?.classList.add("kosh-iw");
    });
  }, [maps, origin]);

  useEffect(() => {
    mapRef.current?.setOptions({ styles: dark ? DARK_STYLES : [] });
  }, [maps, origin, dark]);

  useEffect(() => {
    const map = mapRef.current;
    if (!maps || !map || !origin) return;
    const overlays = overlaysRef.current;
    overlays.markers.forEach((marker) => marker.setMap(null));
    overlays.markers.clear();
    overlays.circle?.setMap(null);
    overlays.origin?.setMap(null);
    const center = { lat: origin.latitude, lng: origin.longitude };
    overlays.circle = new maps.Circle({
      map,
      center,
      radius: radiusKm * 1000,
      strokeColor: "#6b8cff",
      strokeOpacity: 0.8,
      strokeWeight: 1.5,
      fillColor: "#6b8cff",
      fillOpacity: 0.08,
      clickable: false,
    });

    overlays.origin = new maps.Marker({
      map,
      position: center,
      title: "Your warehouse",
      zIndex: 1000,
      icon: {
        path: maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: "#00010f",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 4,
      },
    });

    suppliers.forEach((supplier) => {
      const marker = new maps.Marker({
        map,
        position: { lat: supplier.latitude, lng: supplier.longitude },
        title: supplier.company_name,
        icon: pinIcon(
          maps,
          supplier.in_my_suppliers ? MINE_COLOR : PLATFORM_COLOR,
        ),
      });
      marker.addListener("click", () =>
        handlersRef.current.onSelect(supplier.id),
      );
      overlays.markers.set(supplier.id, marker);
    });

    map.fitBounds(overlays.circle.getBounds(), 24);
  }, [maps, origin, radiusKm, suppliers]);

  useEffect(() => {
    const map = mapRef.current;
    const info = infoRef.current;
    if (!maps || !map || !info) return;
    const supplier = suppliers.find((item) => item.id === selectedId);
    const marker = overlaysRef.current.markers.get(selectedId);
    if (!supplier || !marker) {
      info.close();
      return;
    }

    const node = document.createElement("div");
    contentRef.current = node;
    const root = createRoot(node);
    root.render(
      <SupplierInfoCard
        supplier={supplier}
        onSendRfq={() => handlersRef.current.onSendRfq(supplier)}
        onClose={() => handlersRef.current.onSelect(null)}
      />,
    );
    info.setContent(node);
    info.open({ map, anchor: marker });
    map.panTo(marker.getPosition());

    return () => {
      setTimeout(() => root.unmount(), 0);
    };
  }, [maps, suppliers, selectedId]);

  useEffect(() => {
    const overlays = overlaysRef.current;
    return () => {
      overlays.markers.forEach((marker) => marker.setMap(null));
      overlays.markers.clear();
      overlays.circle?.setMap(null);
      overlays.origin?.setMap(null);
      infoRef.current?.close();
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-xs text-(--secondary-text-color)">
        {error}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {!maps && (
        <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-(--card-background) text-xs text-(--secondary-text-color)">
          Loading map…
        </div>
      )}
      <div className="pointer-events-none absolute left-3 top-3 space-y-1.5 rounded-lg border border-(--border-color) bg-(--page-background)/90 px-3 py-2 text-[11px] text-(--text-color)">
        <LegendDot className="bg-[#05df72]" label="My suppliers" />
        <LegendDot className="bg-[#4f7cff]" label="Other Kosh suppliers" />
        <LegendDot
          className="border-2 border-white bg-black"
          label="Your warehouse"
        />
      </div>
    </div>
  );
}

export default SupplierMapView;
