import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Locker } from '../../../types/locker';
import { Layers, Crosshair } from 'lucide-react';

interface LockerMapProps {
    lockers: Locker[];
    selectedLockerId?: number | null;
    onSelectLocker?: (locker: Locker) => void;
    className?: string;
}

const DEFAULT_CENTER: [number, number] = [21.0049, 105.8458]; // Khuôn viên Đại học (Hanoi Campus)
const DEFAULT_ZOOM = 16;

export const LockerMap = ({ lockers, selectedLockerId, onSelectLocker, className = '' }: LockerMapProps) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<number, L.Marker>>(new Map());
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [isLocating, setIsLocating] = useState<boolean>(false);

    // Initialize map on mount
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Prevent double init in StrictMode
        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: DEFAULT_CENTER,
                zoom: DEFAULT_ZOOM,
                zoomControl: false, // Custom placed zoom control
            });

            // Google Maps Standard Road Layer - 100% Free, No API key required, high speed & bypasses local OSM DNS blocks
            L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: '&copy; Google Maps',
            }).addTo(map);

            // Add standard zoom control at bottom right
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            mapInstanceRef.current = map;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Create custom pin icon for lockers
    const createLockerIcon = (locker: Locker, isSelected: boolean) => {
        let badgeColor = '#10b981'; // Active - Emerald

        if (locker.status === 'MAINTENANCE') {
            badgeColor = '#f59e0b'; // Amber
        } else if (locker.status === 'INACTIVE' || locker.status === 'OFFLINE') {
            badgeColor = '#ef4444'; // Red
        }

        const size = isSelected ? 48 : 40;
        const total = locker.totalCompartments || 0;
        const available = locker.availableCompartments || 0;

        return L.divIcon({
            className: 'custom-locker-marker',
            html: `
                <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <!-- Outer Halo for Selected -->
                    ${isSelected ? `<div style="position: absolute; inset: -6px; border-radius: 9999px; background-color: rgba(16, 185, 129, 0.35); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>` : ''}
                    
                    <!-- Main Pin Card -->
                    <div style="
                        width: 100%; height: 100%; border-radius: 12px;
                        background: white; border: 2.5px solid ${badgeColor};
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                        position: relative; transition: transform 0.2s;
                    ">
                        <!-- Icon -->
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${badgeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h10"/>
                        </svg>

                        <!-- Count badge -->
                        <span style="font-size: 9px; font-weight: 800; color: #1e293b; margin-top: 1px; font-family: monospace;">
                            ${available}/${total}
                        </span>
                    </div>

                    <!-- Bottom Pin Arrow -->
                    <div style="
                        position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%);
                        width: 0; height: 0;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                        border-top: 6px solid ${badgeColor};
                    "></div>
                </div>
            `,
            iconSize: [size, size + 6],
            iconAnchor: [size / 2, size + 6],
            popupAnchor: [0, -(size + 8)],
        });
    };

    // Update markers when lockers, filter or selection changes
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current.clear();

        const filteredLockers = lockers.filter((l) => {
            if (statusFilter === 'ALL') return true;
            return l.status === statusFilter;
        });

        const validCoords: [number, number][] = [];

        filteredLockers.forEach((locker) => {
            // If locker has no coordinates, assign sample offset based on ID for demo visual
            const lat = locker.latitude ?? (DEFAULT_CENTER[0] + (locker.id % 5 - 2) * 0.002);
            const lng = locker.longitude ?? (DEFAULT_CENTER[1] + (locker.id % 4 - 1.5) * 0.0025);

            validCoords.push([lat, lng]);

            const isSelected = locker.id === selectedLockerId;
            const marker = L.marker([lat, lng], {
                icon: createLockerIcon(locker, isSelected),
                zIndexOffset: isSelected ? 1000 : 0,
            });

            // Create informative popup
            const statusBadgeColor =
                locker.status === 'ACTIVE'
                    ? 'background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;'
                    : locker.status === 'MAINTENANCE'
                    ? 'background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a;'
                    : 'background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;';

            const statusLabel =
                locker.status === 'ACTIVE'
                    ? 'Hoạt động'
                    : locker.status === 'MAINTENANCE'
                    ? 'Đang bảo trì'
                    : 'Ngừng hoạt động';

            const totalComp = locker.totalCompartments || 0;
            const availComp = locker.availableCompartments || 0;
            const percentAvail = totalComp > 0 ? Math.round((availComp / totalComp) * 100) : 0;

            const popupContent = `
                <div style="font-family: inherit; width: 230px; padding: 2px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-size: 11px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">
                            ${locker.code}
                        </span>
                        <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; ${statusBadgeColor}">
                            ${statusLabel}
                        </span>
                    </div>

                    <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
                        ${locker.name}
                    </h4>

                    <p style="font-size: 11px; color: #64748b; margin: 0 0 10px 0; line-height: 1.4;">
                        📍 ${locker.location}
                    </p>

                    <!-- Compartment Capacity Bar -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; color: #334155; margin-bottom: 4px;">
                            <span>Sức chứa ngăn trống:</span>
                            <span style="color: #059669; font-weight: 700;">${availComp}/${totalComp}</span>
                        </div>
                        <div style="width: 100%; height: 6px; background-color: #e2e8f0; border-radius: 9999px; overflow: hidden;">
                            <div style="width: ${percentAvail}%; height: 100%; background-color: #10b981; border-radius: 9999px;"></div>
                        </div>
                    </div>

                    <a href="/admin/lockers/${locker.id}" style="
                        display: block; width: 100%; text-align: center;
                        background-color: #059669; color: white;
                        font-size: 11px; font-weight: 700;
                        padding: 6px 0; border-radius: 6px;
                        text-decoration: none; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    ">
                        Xem chi tiết & Quản lý ngăn ➔
                    </a>
                </div>
            `;

            marker.bindPopup(popupContent, { maxWidth: 260 });

            marker.on('click', () => {
                if (onSelectLocker) {
                    onSelectLocker(locker);
                }
            });

            marker.addTo(map);
            markersRef.current.set(locker.id, marker);
        });

        // Auto-fit bounds if we have markers
        if (validCoords.length > 0) {
            const bounds = L.latLngBounds(validCoords);
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
        }
    }, [lockers, statusFilter, selectedLockerId, onSelectLocker]);

    // Pan to selected locker
    useEffect(() => {
        if (!selectedLockerId || !mapInstanceRef.current) return;
        const marker = markersRef.current.get(selectedLockerId);
        if (marker) {
            mapInstanceRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.8 });
            marker.openPopup();
        }
    }, [selectedLockerId]);

    // Geolocation API (HTML5 - Free)
    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                setIsLocating(false);

                if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo(coords, 17, { duration: 1.2 });

                    // Add or move user marker
                    L.circleMarker(coords, {
                        radius: 8,
                        fillColor: '#3b82f6',
                        color: '#ffffff',
                        weight: 2.5,
                        opacity: 1,
                        fillOpacity: 0.9,
                    })
                        .addTo(mapInstanceRef.current)
                        .bindPopup('📍 Bạn đang ở đây!')
                        .openPopup();
                }
            },
            (err) => {
                setIsLocating(false);
                console.warn('Geolocation error:', err);
                alert('Không thể xác định vị trí hiện tại. Vui lòng cho phép quyền truy cập GPS.');
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const handleResetView = () => {
        if (!mapInstanceRef.current) return;
        const validCoords: [number, number][] = lockers
            .map((l) => {
                const lat = l.latitude ?? (DEFAULT_CENTER[0] + (l.id % 5 - 2) * 0.002);
                const lng = l.longitude ?? (DEFAULT_CENTER[1] + (l.id % 4 - 1.5) * 0.0025);
                return [lat, lng] as [number, number];
            });

        if (validCoords.length > 0) {
            mapInstanceRef.current.fitBounds(L.latLngBounds(validCoords), { padding: [40, 40], maxZoom: 17 });
        } else {
            mapInstanceRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
        }
    };

    return (
        <div className={`relative w-full h-[540px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 ${className}`}>
            {/* Top Overlay Controls */}
            <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
                {/* Status Filter Badges */}
                <div className="bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-200/80 shadow-xs flex items-center gap-1 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-2.5 py-1 rounded-md transition ${
                            statusFilter === 'ALL'
                                ? 'bg-slate-900 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        Tất cả ({lockers.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('ACTIVE')}
                        className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                            statusFilter === 'ACTIVE'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Hoạt động ({lockers.filter((l) => l.status === 'ACTIVE').length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('MAINTENANCE')}
                        className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                            statusFilter === 'MAINTENANCE'
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                        Bảo trì ({lockers.filter((l) => l.status === 'MAINTENANCE').length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('INACTIVE')}
                        className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                            statusFilter === 'INACTIVE'
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
                        Ngừng ({lockers.filter((l) => l.status === 'INACTIVE' || l.status === 'OFFLINE').length})
                    </button>
                </div>

                {/* Reset Bounds Button */}
                <button
                    type="button"
                    onClick={handleResetView}
                    className="bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
                    title="Căn vừa màn hình toàn bộ các trạm tủ"
                >
                    <Layers size={14} className="text-emerald-600" />
                    <span>Toàn cảnh</span>
                </button>
            </div>

            {/* Locate Me Floating Button */}
            <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-xs p-2 rounded-lg border border-slate-200/80 shadow-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Định vị vị trí của tôi"
            >
                <Crosshair size={16} className={isLocating ? 'animate-spin text-blue-600' : 'text-blue-500'} />
                <span className="hidden sm:inline">{isLocating ? 'Đang dò vị trí...' : 'Vị trí của tôi'}</span>
            </button>

            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Legend Badge bottom left */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-200 shadow-2xs text-[11px] text-slate-600 flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Hoạt động</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Bảo trì</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span>Ngừng/Lỗi</span>
                </div>
            </div>
        </div>
    );
};
