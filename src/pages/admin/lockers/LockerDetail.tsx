import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axios';
import type { LockerDetail as LockerDetailType, CompartmentStatus } from '../../../types/locker';
import { ArrowLeft, Plus, ShieldCheck, Box, MapPin, Edit3 } from 'lucide-react';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

export const LockerDetail = () => {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [newCompartmentCode, setNewCompartmentCode] = useState('');
    const [addError, setAddError] = useState<string | null>(null);

    // Accessible Notice Dialog state
    const [actionNotice, setActionNotice] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: 'primary' | 'warning' | 'danger';
    }>({
        isOpen: false,
        title: '',
        message: '',
        variant: 'primary',
    });

    const { data: locker, isLoading, isError, error } = useQuery<LockerDetailType>({
        queryKey: ['locker', id],
        queryFn: () => axiosInstance.get(`/api/v1/lockers/${id}`).then(res => res.data)
    });

    const addCompartmentMutation = useMutation({
        mutationFn: (code: string) => axiosInstance.post(`/api/v1/lockers/${id}/compartments`, { code }),
        onSuccess: () => {
            setNewCompartmentCode('');
            setAddError(null);
            queryClient.invalidateQueries({ queryKey: ['locker', id] });
            queryClient.invalidateQueries({ queryKey: ['lockers'] });
        },
        onError: (err: any) => {
            setAddError(err.response?.data?.message || 'Không thể thêm ngăn tủ. Mã ngăn có thể đã tồn tại.');
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ compartmentId, status }: { compartmentId: number; status: CompartmentStatus }) =>
            axiosInstance.patch(`/api/v1/lockers/${id}/compartments/${compartmentId}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locker', id] });
            queryClient.invalidateQueries({ queryKey: ['lockers'] });
        },
        onError: (err: any) => {
            setActionNotice({
                isOpen: true,
                title: 'Thao tác bị từ chối',
                message: err.response?.data?.message || 'Thao tác bị từ chối do quy tắc an toàn hệ thống.',
                variant: 'danger',
            });
        }
    });

    const handleAddCompartment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompartmentCode.trim()) return;
        addCompartmentMutation.mutate(newCompartmentCode.trim().toUpperCase());
    };

    if (isLoading) return <div className="text-center py-20 text-gray-500">Đang tải thông tin chi tiết tủ...</div>;
    if (isError || !locker) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy tủ đồ</h2>
                <p className="mt-2 text-gray-600">{(error as any)?.message || 'Tủ đồ được yêu cầu không tồn tại hoặc đã bị xóa.'}</p>
                <Link to="/admin/lockers" className="text-[#eb6e34] hover:underline mt-4 inline-block">&larr; Quay lại danh sách tủ</Link>
            </div>
        );
    }

    const { compartmentSummary: summary } = locker;

    const renderLockerStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">Đang hoạt động</span>;
            case 'MAINTENANCE':
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Đang bảo trì</span>;
            case 'OFFLINE':
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Ngoại tuyến</span>;
            default:
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const renderCompartmentStatusBadge = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return <span className="mt-1 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">Khả dụng</span>;
            case 'OCCUPIED':
                return <span className="mt-1 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Đang chứa hàng</span>;
            case 'RESERVED':
                return <span className="mt-1 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200">Đã đặt trước</span>;
            case 'ERROR':
                return <span className="mt-1 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Sự cố kỹ thuật</span>;
            default:
                return <span className="mt-1 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-800">Ngừng phục vụ</span>;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Link to="/admin/lockers" className="inline-flex items-center gap-1 text-sm text-[#eb6e34] hover:underline mb-6 font-medium">
                    <ArrowLeft size={16} /> Quay lại danh sách tủ
                </Link>

                {/* Locker Header Card */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900">{locker.code}</h1>
                                {renderLockerStatusBadge(locker.status)}
                                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                                    MÔ PHỎNG IoT
                                </span>
                            </div>
                            <h2 className="text-lg text-gray-600 mt-1">{locker.name}</h2>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                                <MapPin size={15} className="text-[#eb6e34]" />
                                {locker.location}
                            </p>
                        </div>

                        <Link
                            to={`/admin/lockers/edit/${locker.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                            <Edit3 size={15} /> Chỉnh sửa thông tin
                        </Link>
                    </div>

                    {/* Summary Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-gray-200">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <div className="text-xs text-gray-500 uppercase font-medium">Tổng số ngăn</div>
                            <div className="text-2xl font-bold text-gray-800 mt-1">{summary.total}</div>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg text-center border border-emerald-100">
                            <div className="text-xs text-emerald-700 uppercase font-medium">Khả dụng</div>
                            <div className="text-2xl font-bold text-emerald-800 mt-1">{summary.available}</div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg text-center border border-amber-100">
                            <div className="text-xs text-amber-700 uppercase font-medium">Đã đặt trước</div>
                            <div className="text-2xl font-bold text-amber-800 mt-1">{summary.reserved}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
                            <div className="text-xs text-blue-700 uppercase font-medium">Đang chứa hàng</div>
                            <div className="text-2xl font-bold text-blue-800 mt-1">{summary.occupied}</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg text-center border border-red-100">
                            <div className="text-xs text-red-700 uppercase font-medium">Báo sự cố</div>
                            <div className="text-2xl font-bold text-red-800 mt-1">{summary.error}</div>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg text-center">
                            <div className="text-xs text-gray-600 uppercase font-medium">Ngừng phục vụ</div>
                            <div className="text-2xl font-bold text-gray-700 mt-1">{summary.outOfService}</div>
                        </div>
                    </div>
                </div>

                {/* Compartments Section */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Box size={20} className="text-[#eb6e34]" /> Danh sách ngăn tủ
                            </h2>
                            <p className="text-sm text-gray-500">Quản lý và điều phối trạng thái từng ô ngăn trong tủ này.</p>
                        </div>

                        {/* Add Compartment Inline Form */}
                        <form onSubmit={handleAddCompartment} className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="VD: C05"
                                value={newCompartmentCode}
                                onChange={(e) => setNewCompartmentCode(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#eb6e34] w-32 uppercase"
                            />
                            <button
                                type="submit"
                                disabled={addCompartmentMutation.isPending || !newCompartmentCode.trim()}
                                className="px-3.5 py-1.5 bg-[#eb6e34] text-white rounded-lg text-sm font-medium hover:bg-[#d85d26] disabled:opacity-50 flex items-center gap-1 transition"
                            >
                                <Plus size={16} /> Thêm ngăn
                            </button>
                        </form>
                    </div>

                    {addError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                            {addError}
                        </div>
                    )}

                    {locker.compartments.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Chưa có ngăn tủ nào được tạo. Hãy nhập mã ngăn bên trên để thêm ngăn đầu tiên.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {locker.compartments.map(comp => (
                                <div key={comp.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">{comp.code}</div>
                                        {renderCompartmentStatusBadge(comp.status)}
                                    </div>

                                    <div className="flex flex-col gap-1 items-end">
                                        {comp.status === 'AVAILABLE' && (
                                            <button
                                                onClick={() => updateStatusMutation.mutate({ compartmentId: comp.id, status: 'OUT_OF_SERVICE' })}
                                                className="text-xs text-amber-700 hover:text-amber-900 underline font-medium"
                                            >
                                                Tạm ngừng phục vụ
                                            </button>
                                        )}

                                        {comp.status === 'OUT_OF_SERVICE' && (
                                            <button
                                                onClick={() => updateStatusMutation.mutate({ compartmentId: comp.id, status: 'AVAILABLE' })}
                                                className="text-xs text-emerald-700 hover:text-emerald-900 underline font-medium"
                                            >
                                                Mở lại khả dụng
                                            </button>
                                        )}

                                        {comp.status === 'ERROR' && (
                                            <button
                                                onClick={() => updateStatusMutation.mutate({ compartmentId: comp.id, status: 'AVAILABLE' })}
                                                className="text-xs text-emerald-700 hover:text-emerald-900 underline font-medium"
                                            >
                                                Khắc phục & Mở lại
                                            </button>
                                        )}

                                        {(comp.status === 'OCCUPIED' || comp.status === 'RESERVED') && (
                                            <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                                <ShieldCheck size={13} className="text-blue-600" /> Theo đơn hàng
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Accessible Notice Dialog */}
                <ConfirmDialog
                    isOpen={actionNotice.isOpen}
                    onClose={() => setActionNotice((prev) => ({ ...prev, isOpen: false }))}
                    onConfirm={() => setActionNotice((prev) => ({ ...prev, isOpen: false }))}
                    title={actionNotice.title}
                    message={actionNotice.message}
                    confirmText="Đã hiểu"
                    cancelText="Đóng"
                    variant={actionNotice.variant}
                />
            </div>
    );
};
