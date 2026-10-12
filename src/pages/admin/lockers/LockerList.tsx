import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axios';
import type { Locker, LockerStatus } from '../../../types/locker';
import type { PageResponse } from '../../../types/marketplace';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, Plus, ShieldAlert } from 'lucide-react';

export const LockerList = () => {
    const [page, setPage] = useState<number>(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
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
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Tủ đồ Thông minh</h1>
                    <p className="mt-1 text-sm text-gray-500">Quản lý hệ thống tủ đồ và các ngăn chứa tại các điểm giao nhận trên toàn thành phố.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 text-sm"
                        title="Làm mới"
                    >
                        <RefreshCw size={16} className={isFetching ? 'animate-spin text-purple-600' : ''} />
                        Làm mới
                    </button>
                    <Link
                        to="/admin/lockers/new"
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium shadow-xs transition"
                    >
                        <Plus size={16} />
                        Thêm tủ mới
                    </Link>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <form onSubmit={handleSearchSubmit} className="flex relative w-full sm:w-80">
                    <input
                        type="text"
                        name="search"
                        defaultValue={searchTerm}
                        placeholder="Tìm theo mã tủ, tên, vị trí..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500 w-full text-sm"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </form>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Trạng thái:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(0);
                        }}
                        className="py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white"
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
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <RefreshCw className="animate-spin mx-auto text-purple-600 mb-2" size={32} />
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
                <div className="bg-white shadow-xs border border-gray-200 rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã & Tên tủ</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vị trí lắp đặt</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngăn chứa</th>
                                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pageData?.content.map(locker => (
                                <tr key={locker.id} className="hover:bg-gray-50/70 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-gray-900">{locker.code}</div>
                                        <div className="text-sm text-gray-500">{locker.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {locker.location}
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
                                                    <span className="text-purple-600 font-medium">{locker.occupiedCompartments} có đồ</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <Link to={`/admin/lockers/${locker.id}`} className="text-purple-600 hover:text-purple-900 font-medium">
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
    );
};
