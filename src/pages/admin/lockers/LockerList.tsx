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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Locker Administration</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage lockers and compartments across campus locations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2 border rounded-md text-gray-600 hover:bg-gray-50 flex items-center gap-1 text-sm"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <Link
                        to="/admin/lockers/new"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
                    >
                        <Plus size={16} />
                        Add Locker
                    </Link>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <form onSubmit={handleSearchSubmit} className="flex relative w-full sm:w-80">
                    <input
                        type="text"
                        name="search"
                        defaultValue={searchTerm}
                        placeholder="Search code, name, location..."
                        className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </form>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(0);
                        }}
                        className="py-2 px-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="OFFLINE">OFFLINE</option>
                    </select>
                </div>
            </div>

            {/* States: Loading / Error / Empty / Table */}
            {isLoading ? (
                <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                    <RefreshCw className="animate-spin mx-auto text-blue-600 mb-2" size={32} />
                    <p className="text-gray-500">Loading locker data...</p>
                </div>
            ) : isError ? (
                <div className="text-center py-16 bg-red-50 rounded-lg border border-red-200 text-red-700">
                    <ShieldAlert className="mx-auto mb-2" size={36} />
                    <p className="font-semibold">Failed to load lockers</p>
                    <p className="text-sm mt-1">{(error as any)?.message || 'An error occurred while fetching locker data.'}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            ) : pageData?.content.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-gray-200 text-gray-500">
                    No lockers found matching your criteria.
                </div>
            ) : (
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locker</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compartments</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pageData?.content.map(locker => (
                                <tr key={locker.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-gray-900">{locker.code}</div>
                                        <div className="text-sm text-gray-500">{locker.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {locker.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${locker.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                              locker.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                                              locker.status === 'OFFLINE' ? 'bg-red-100 text-red-800' :
                                              'bg-gray-100 text-gray-800'}`}>
                                            {locker.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{locker.totalCompartments} total</span>
                                            <span>•</span>
                                            <span className="text-green-600 font-medium">{locker.availableCompartments} avail</span>
                                            {locker.occupiedCompartments > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-blue-600 font-medium">{locker.occupiedCompartments} occupied</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <Link to={`/admin/lockers/${locker.id}`} className="text-blue-600 hover:text-blue-900">
                                            View Details
                                        </Link>
                                        <Link to={`/admin/lockers/edit/${locker.id}`} className="text-gray-600 hover:text-gray-900">
                                            Edit
                                        </Link>
                                        {locker.status === 'ACTIVE' ? (
                                            <button
                                                onClick={() => statusMutation.mutate({ id: locker.id, status: 'MAINTENANCE' })}
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                Maintenance
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => statusMutation.mutate({ id: locker.id, status: 'ACTIVE' })}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Activate
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
                            <div>Page {page + 1} of {pageData.totalPages} ({pageData.totalElements} total lockers)</div>
                            <div className="flex gap-2">
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={page >= pageData.totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
