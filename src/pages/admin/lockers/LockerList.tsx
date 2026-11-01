import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axios';
import type { Locker, LockerStatus } from '../../../types/locker';
import type { PageResponse } from '../../../types/marketplace';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, Plus, ShieldAlert, List, Map as MapIcon, Columns, MapPin } from 'lucide-react';
import { LockerMap } from '../../../components/admin/lockers/LockerMap';

export const LockerList = () => {
    const [page, setPage] = useState<number>(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [viewMode, setViewMode] = useState<'table' | 'map' | 'split'>('split');
    const [selectedLockerId, setSelectedLockerId] = useState<number | null>(null);
    const queryClient = useQueryClient();

    const { data: pageData, isLoading, isError, error, refetch, isFetching } = useQuery<PageResponse<Locker>>({
        queryKey: ['lockers', page, statusFilter, searchTerm],
        queryFn: () => axiosInstance.get('/api/v1/lockers', {
            params: {
                page,
                status: statusFilter || undefined,
                search: searchTerm || undefined
            }
        }).then(res => res.data)
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: LockerStatus }) =>
            axiosInstance.patch(`/api/v1/lockers/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lockers'] });
        }
    });

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setSearchTerm(formData.get('search') as string || '');
        setPage(0);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý Tủ đồ Thông minh</h1>
                        <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                            MÔ PHỎNG IoT
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Quản lý hệ thống tủ đồ và các ngăn chứa tại các điểm giao nhận trong khuôn viên (chế độ mô phỏng thiết bị).</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* View Switcher */}
                    <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setViewMode('split')}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
                                viewMode === 'split' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Chế độ Kết hợp (Bản đồ + Bảng)"
                        >
                            <Columns size={14} />
                            <span className="hidden sm:inline">Kết hợp</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('map')}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
                                viewMode === 'map' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Chế độ Xem Bản đồ"
                        >
                            <MapIcon size={14} />
                            <span className="hidden sm:inline">Bản đồ</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
                                viewMode === 'table' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Chế độ Bảng danh sách"
                        >
                            <List size={14} />
                            <span className="hidden sm:inline">Danh sách</span>
                        </button>
                    </div>

                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition"
                        title="Làm mới"
                    >
                        <RefreshCw size={15} className={isFetching ? 'animate-spin text-emerald-600' : ''} />
                        <span className="hidden sm:inline">Làm mới</span>
                    </button>
                    <Link
                        to="/admin/lockers/new"
                        className="px-3.5 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center gap-1.5 text-xs sm:text-sm font-bold shadow-2xs transition"
                    >
                        <Plus size={15} />
                        Thêm tủ mới
                    </Link>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow-2xs border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <form onSubmit={handleSearchSubmit} className="flex relative w-full sm:w-80">
                    <input
                        type="text"
                        name="search"
                        defaultValue={searchTerm}
                        placeholder="Tìm theo mã tủ, tên, vị trí..."
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 w-full text-sm transition"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </form>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">Trạng thái:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(0);
                        }}
                        className="py-2 px-3 border border-slate-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="ACTIVE">Hoạt động (Active)</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                        <option value="MAINTENANCE">Đang bảo trì</option>
                        <option value="OFFLINE">Mất kết nối</option>
                    </select>
                </div>
            </div>

            {/* States: Loading / Error / Empty / Table */}
            {isLoading ? (
                <div className="text-center py-20 bg-white rounded-lg border border-slate-200">
                    <RefreshCw className="animate-spin mx-auto text-emerald-600 mb-2" size={32} />
                    <p className="text-gray-500">Đang tải dữ liệu tủ đồ...</p>
                </div>
            ) : isError ? (
                <div className="text-center py-16 bg-red-50 rounded-xl border border-red-200 text-red-700">
                    <ShieldAlert className="mx-auto mb-2" size={36} />
                    <p className="font-semibold">Không thể tải danh sách tủ đồ</p>
                    <p className="text-sm mt-1">{(error as any)?.message || 'Đã xảy ra lỗi khi lấy dữ liệu tủ.'}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                        Thử lại
                    </button>
                </div>
            ) : pageData?.content.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200 text-gray-500">
                    Không tìm thấy tủ đồ nào phù hợp với điều kiện tìm kiếm.
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Map Section (Rendered in 'map' or 'split' view) */}
                    {(viewMode === 'map' || viewMode === 'split') && (
                        <div className="bg-white p-4 rounded-xl shadow-2xs border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <MapIcon size={16} className="text-emerald-600" />
                                        <span>Bản đồ vị trí trạm Smart Locker (OpenStreetMap)</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Click vào biểu tượng trạm tủ trên bản đồ để xem chi tiết sức chứa và vị trí chính xác.</p>
                                </div>
                                {(() => {
                                    const lockers = pageData?.content || [];
                                    const withGps = lockers.filter(l => l.latitude != null && l.longitude != null).length;
                                    const withoutGps = lockers.length - withGps;
                                    return (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                                {withGps} trạm có GPS
                                            </span>
                                            {withoutGps > 0 && (
                                                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                                                    {withoutGps} chưa ghim vị trí
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                            <LockerMap
                                lockers={pageData?.content || []}
                                selectedLockerId={selectedLockerId}
                                onSelectLocker={(l) => setSelectedLockerId(l.id)}
                            />
                        </div>
                    )}

                    {/* Table Section (Rendered in 'table' or 'split' view) */}
                    {(viewMode === 'table' || viewMode === 'split') && (
                        <div className="bg-white shadow-xs border border-gray-200 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã & Tên tủ</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vị trí & Tọa độ</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngăn chứa</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pageData?.content.map(locker => (
                                        <tr
                                            key={locker.id}
                                            onClick={() => setSelectedLockerId(locker.id)}
                                            className={`hover:bg-gray-50/70 transition cursor-pointer ${
                                                selectedLockerId === locker.id ? 'bg-emerald-50/40 border-l-4 border-emerald-600' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900">{locker.code}</div>
                                                <div className="text-sm text-gray-500">{locker.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div>{locker.location}</div>
                                                {locker.latitude != null && locker.longitude != null ? (
                                                    <div className="text-xs text-emerald-700 font-mono mt-0.5 flex items-center gap-1">
                                                        <MapPin size={12} className="text-emerald-600 shrink-0" />
                                                        <span>{locker.latitude.toFixed(4)}, {locker.longitude.toFixed(4)}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-[11px] text-slate-400 italic mt-0.5">Chưa có tọa độ GPS</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                                    ${locker.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                      locker.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                      locker.status === 'OFFLINE' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                      'bg-gray-100 text-gray-800'}`}>
                                                    {locker.status === 'ACTIVE' ? 'Hoạt động' :
                                                     locker.status === 'MAINTENANCE' ? 'Bảo trì' :
                                                     locker.status === 'OFFLINE' ? 'Mất kết nối' : 'Ngừng hoạt động'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{locker.totalCompartments} ngăn</span>
                                                    <span>•</span>
                                                    <span className="text-emerald-600 font-medium">{locker.availableCompartments} trống</span>
                                                    {locker.occupiedCompartments > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-blue-600 font-medium">{locker.occupiedCompartments} có đồ</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3" onClick={e => e.stopPropagation()}>
                                                <Link to={`/admin/lockers/${locker.id}`} className="text-emerald-700 hover:text-emerald-800 font-bold">
                                                    Chi tiết
                                                </Link>
                                                <Link to={`/admin/lockers/edit/${locker.id}`} className="text-gray-600 hover:text-gray-900">
                                                    Sửa
                                                </Link>
                                                {locker.status === 'ACTIVE' ? (
                                                    <button
                                                        onClick={() => statusMutation.mutate({ id: locker.id, status: 'MAINTENANCE' })}
                                                        className="text-amber-600 hover:text-amber-900 font-medium"
                                                    >
                                                        Bảo trì
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => statusMutation.mutate({ id: locker.id, status: 'ACTIVE' })}
                                                        className="text-emerald-600 hover:text-emerald-900 font-medium"
                                                    >
                                                        Kích hoạt
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                            {/* Pagination */}
                            {pageData && pageData.totalPages > 1 && (
                                <div className="p-4 border-t flex justify-between items-center text-sm text-gray-600">
                                    <div>Trang {page + 1} / {pageData.totalPages} (Tổng số {pageData.totalElements} tủ)</div>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={page === 0}
                                            onClick={() => setPage(p => p - 1)}
                                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                                        >
                                            Trước
                                        </button>
                                        <button
                                            disabled={page >= pageData.totalPages - 1}
                                            onClick={() => setPage(p => p + 1)}
                                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
