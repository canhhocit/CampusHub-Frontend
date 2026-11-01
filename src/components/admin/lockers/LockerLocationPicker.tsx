import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Crosshair, Loader2 } from 'lucide-react';

interface LockerLocationPickerProps {
    latitude?: number | null;
    longitude?: number | null;
    onChange: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [21.0049, 105.8458]; // ĐH Bách Khoa Hà Nội

export const LockerLocationPicker = ({ latitude, longitude, onChange }: LockerLocationPickerProps) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
    const [showResults, setShowResults] = useState(false);

    const currentLat = latitude ?? DEFAULT_CENTER[0];
    const currentLng = longitude ?? DEFAULT_CENTER[1];

    // Custom Pin icon for picker
    const pickerIcon = L.divIcon({
        className: 'location-picker-marker',
        html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                <div style="
                    width: 32px; height: 32px; border-radius: 9999px;
                    background: #10b981; color: white; border: 2.5px solid white;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
                    display: flex; align-items: center; justify-content: center;
                ">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                </div>
                <div style="
                    position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%);
                    width: 0; height: 0;
                    border-left: 4px solid transparent; border-right: 4px solid transparent;
                    border-top: 5px solid #10b981;
                "></div>
            </div>
        `,
        iconSize: [36, 40],
        iconAnchor: [18, 40],
    });

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [currentLat, currentLng],
                zoom: 16,
                zoomControl: true,
            });

            // Google Maps Standard Road Layer - 100% Free, No API key required, high speed & bypasses local OSM DNS blocks
            L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: '&copy; Google Maps',
            }).addTo(map);

            const marker = L.marker([currentLat, currentLng], {
                icon: pickerIcon,
                draggable: true,
            }).addTo(map);

            // Handle drag marker
            marker.on('dragend', () => {
                const pos = marker.getLatLng();
                onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
            });

            // Handle click map to place marker
            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
            });

            markerRef.current = marker;
            mapInstanceRef.current = map;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Sync external lat/lng changes
    useEffect(() => {
        if (!markerRef.current || !mapInstanceRef.current) return;
        if (latitude != null && longitude != null) {
            markerRef.current.setLatLng([latitude, longitude]);
        }
    }, [latitude, longitude]);

    // Free Geocoding API via Photon (OpenStreetMap data, 100% free, no API key)
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const res = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(
                    searchQuery
                )}&limit=5&lang=default`
            );
            const data = await res.json();
            const formatted = (data.features || []).map((f: any) => {
                const props = f.properties || {};
                const name = props.name || '';
                const parts = [name, props.street, props.district, props.city, props.country].filter(Boolean);
                return {
                    display_name: parts.join(', '),
                    lat: String(f.geometry.coordinates[1]),
                    lon: String(f.geometry.coordinates[0]),
                };
            });
            setSearchResults(formatted);
            setShowResults(true);
        } catch (err) {
            console.error('Geocoding search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (result: { lat: string; lon: string }) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));

        if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1 });
            markerRef.current.setLatLng([lat, lng]);
        }
        setShowResults(false);
    };

    // Locate Me with Browser GPS (Free)
    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert('Trình duyệt không hỗ trợ định vị GPS.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = Number(pos.coords.latitude.toFixed(6));
                const lng = Number(pos.coords.longitude.toFixed(6));
                onChange(lat, lng);

                if (mapInstanceRef.current && markerRef.current) {
                    mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1 });
                    markerRef.current.setLatLng([lat, lng]);
                }
                setIsLocating(false);
            },
            () => {
                setIsLocating(false);
                alert('Không thể lấy vị trí hiện tại. Vui lòng cấp quyền vị trí cho trình duyệt.');
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin size={16} className="text-emerald-600" />
                    <span>Ghim vị trí thực tế trên bản đồ</span>
                </label>
                <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                    <Crosshair size={13} className={isLocating ? 'animate-spin' : ''} />
                    <span>Lấy vị trí GPS hiện tại</span>
                </button>
            </div>

            {/* Nominatim OSM Search Bar (Free) */}
            <div className="relative">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm địa chỉ/khuôn viên (VD: Đại học Bách Khoa, KTX Bách Khoa...)"
                            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                        />
                        <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1 border border-slate-300 transition"
                    >
                        {isSearching ? <Loader2 size={13} className="animate-spin" /> : 'Tìm'}
                    </button>
                </form>

                {/* Search dropdown results */}
                {showResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-[1100] mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {searchResults.map((item, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectResult(item)}
                                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border-b border-slate-100 last:border-b-0 transition flex items-start gap-2"
                            >
                                <MapPin size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{item.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Map Picker Canvas */}
            <div className="relative rounded-lg overflow-hidden border border-slate-300 shadow-2xs h-64 bg-slate-100">
                <div ref={mapContainerRef} className="w-full h-full" />
                <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-medium text-slate-600 border border-slate-200">
                    💡 Click hoặc kéo ghim để chọn vị trí tủ
                </div>
            </div>

            {/* Coordinates Indicator */}
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-slate-500 font-medium">Vĩ độ (Latitude):</span>{' '}
                    <strong className="text-slate-800 font-mono">{latitude ?? 'Chưa chọn'}</strong>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-slate-500 font-medium">Kinh độ (Longitude):</span>{' '}
                    <strong className="text-slate-800 font-mono">{longitude ?? 'Chưa chọn'}</strong>
                </div>
            </div>
        </div>
    );
};
