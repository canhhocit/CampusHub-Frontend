import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axios';
import type { LockerDetail as LockerDetailType, CompartmentStatus } from '../../../types/locker';
import { ArrowLeft, Plus, ShieldCheck, Box } from 'lucide-react';
import { AdminNav } from '../../../components/AdminNav';

export const LockerDetail = () => {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [newCompartmentCode, setNewCompartmentCode] = useState('');
    const [addError, setAddError] = useState<string | null>(null);

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
            setAddError(err.response?.data?.message || 'Failed to add compartment. Code might already exist.');
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
            alert(err.response?.data?.message || 'Action rejected by safety rule.');
        }
    });

    const handleAddCompartment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompartmentCode.trim()) return;
        addCompartmentMutation.mutate(newCompartmentCode.trim().toUpperCase());
    };

    if (isLoading) return <div className="text-center py-20">Loading locker details...</div>;
    if (isError || !locker) {
        return (
            <div className="min-h-screen bg-gray-50">
                <AdminNav />
                <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Locker Not Found</h2>
                    <p className="mt-2 text-gray-600">{(error as any)?.message || 'The requested locker does not exist.'}</p>
                    <Link to="/admin/lockers" className="text-blue-600 hover:underline mt-4 inline-block">&larr; Back to Locker List</Link>
                </div>
            </div>
        );
    }

    const { compartmentSummary: summary } = locker;

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link to="/admin/lockers" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline mb-6 font-medium">
                <ArrowLeft size={16} /> Back to Locker List
            </Link>

            {/* Locker Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">{locker.code}</h1>
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${locker.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                  locker.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                                  locker.status === 'OFFLINE' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'}`}>
                                {locker.status}
                            </span>
                        </div>
                        <h2 className="text-lg text-gray-600 mt-1">{locker.name}</h2>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            📍 {locker.location}
                        </p>
                    </div>

                    <Link
                        to={`/admin/lockers/edit/${locker.id}`}
                        className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Edit Locker Info
                    </Link>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-500 uppercase font-medium">Total</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{summary.total}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                        <div className="text-xs text-green-700 uppercase font-medium">Available</div>
                        <div className="text-2xl font-bold text-green-800 mt-1">{summary.available}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-100">
                        <div className="text-xs text-purple-700 uppercase font-medium">Reserved</div>
                        <div className="text-2xl font-bold text-purple-800 mt-1">{summary.reserved}</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
                        <div className="text-xs text-blue-700 uppercase font-medium">Occupied</div>
                        <div className="text-2xl font-bold text-blue-800 mt-1">{summary.occupied}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center border border-red-100">
                        <div className="text-xs text-red-700 uppercase font-medium">Error</div>
                        <div className="text-2xl font-bold text-red-800 mt-1">{summary.error}</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg text-center">
                        <div className="text-xs text-gray-600 uppercase font-medium">Out of Service</div>
                        <div className="text-2xl font-bold text-gray-700 mt-1">{summary.outOfService}</div>
                    </div>
                </div>
            </div>

            {/* Compartments Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Box size={20} /> Compartments
                        </h2>
                        <p className="text-sm text-gray-500">Manage individual compartment units inside this locker.</p>
                    </div>

                    {/* Add Compartment Inline Form */}
                    <form onSubmit={handleAddCompartment} className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="e.g. C05"
                            value={newCompartmentCode}
                            onChange={(e) => setNewCompartmentCode(e.target.value)}
                            className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                        />
                        <button
                            type="submit"
                            disabled={addCompartmentMutation.isPending || !newCompartmentCode.trim()}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                        >
                            <Plus size={16} /> Add
                        </button>
                    </form>
                </div>

                {addError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                        {addError}
                    </div>
                )}

                {locker.compartments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No compartments configured yet. Use the form above to add the first compartment.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {locker.compartments.map(comp => (
                            <div key={comp.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex justify-between items-center">
                                <div>
                                    <div className="text-lg font-bold text-gray-900">{comp.code}</div>
                                    <span className={`mt-1 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full
                                        ${comp.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                          comp.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-800' :
                                          comp.status === 'RESERVED' ? 'bg-purple-100 text-purple-800' :
                                          comp.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-200 text-gray-800'}`}>
                                        {comp.status}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1 items-end">
                                    {comp.status === 'AVAILABLE' && (
                                        <button
                                            onClick={() => updateStatusMutation.mutate({ compartmentId: comp.id, status: 'OUT_OF_SERVICE' })}
                                            className="text-xs text-yellow-700 hover:text-yellow-900 underline"
                                        >
                                            Set Out of Service
                                        </button>
                                    )}

                                    {comp.status === 'OUT_OF_SERVICE' && (
                                        <button
                                            onClick={() => updateStatusMutation.mutate({ compartmentId: comp.id, status: 'AVAILABLE' })}
                                            className="text-xs text-green-700 hover:text-green-900 underline font-medium"
                                        >
                                            Restore Available
                                        </button>
                                    )}

                                    {comp.status === 'ERROR' && (
                                        <button
                                            onClick={() => updateStatusMutation.mutate({ compartmentId: comp.id, status: 'AVAILABLE' })}
                                            className="text-xs text-green-700 hover:text-green-900 underline font-medium"
                                        >
                                            Clear Error
                                        </button>
                                    )}

                                    {(comp.status === 'OCCUPIED' || comp.status === 'RESERVED') && (
                                        <span className="text-xs text-gray-400 italic flex items-center gap-1">
                                            <ShieldCheck size={12} /> Managed by Order
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};
