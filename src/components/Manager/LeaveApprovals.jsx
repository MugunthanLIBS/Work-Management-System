// src/components/Manager/LeaveApprovals.jsx - Multi-level approval
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  getPendingManagerRequests,
  getAllLeaveRequests,
  managerApproveLeave,
  managerRejectLeave,
} from '../../services/leaveService';

const LeaveApprovals = () => {
  const user = useSelector((state) => state.auth.user);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filter, setFilter] = useState('PENDING_MANAGER');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('');
  const [comments, setComments] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, [filter]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      let data;
      if (filter === 'PENDING_MANAGER') {
        data = await getPendingManagerRequests();
      } else if (filter === 'ALL') {
        data = await getAllLeaveRequests();
      } else {
        data = await getAllLeaveRequests();
        data = data.filter((req) => req.status === filter);
      }
      setLeaveRequests(data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      alert('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (actionType === 'reject' && !comments.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      if (actionType === 'approve') {
        await managerApproveLeave(selectedRequest.id, user.id, comments);
        alert('Leave approved! Employee will be notified.');
      } else {
        await managerRejectLeave(selectedRequest.id, user.id, comments);
        alert('Leave rejected successfully.');
      }
      
      closeModal();
      fetchLeaveRequests();
    } catch (error) {
      alert(error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setComments('');
    setSelectedRequest(null);
    setActionType('');
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING_TL: 'bg-yellow-100 text-yellow-800',
      PENDING_MANAGER: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED_BY_TL: 'bg-red-100 text-red-800',
      REJECTED_BY_MANAGER: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    
    const labels = {
      PENDING_TL: 'Pending TL',
      PENDING_MANAGER: 'Pending Manager',
      APPROVED: 'Approved',
      REJECTED_BY_TL: 'Rejected by TL',
      REJECTED_BY_MANAGER: 'Rejected by Manager',
      CANCELLED: 'Cancelled',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manager Leave Approvals</h1>
          <p className="text-sm text-gray-600 mt-1">Final approval authority for leave requests</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('PENDING_MANAGER')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'PENDING_MANAGER'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'APPROVED'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('REJECTED_BY_MANAGER')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'REJECTED_BY_MANAGER'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Requests
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Pending Review</p>
          <p className="text-2xl font-bold text-blue-700">
            {leaveRequests.filter(r => r.status === 'PENDING_MANAGER').length}
          </p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Approved</p>
          <p className="text-2xl font-bold text-green-700">
            {leaveRequests.filter(r => r.status === 'APPROVED').length}
          </p>
        </div>
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Rejected</p>
          <p className="text-2xl font-bold text-red-700">
            {leaveRequests.filter(r => r.status === 'REJECTED_BY_MANAGER' || r.status === 'REJECTED_BY_TL').length}
          </p>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Total Requests</p>
          <p className="text-2xl font-bold text-purple-700">
            {leaveRequests.length}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-purple-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-purple-800">Final Approval Authority</p>
            <p className="text-sm text-purple-700 mt-1">
              You are reviewing requests that have been validated by TL. Your decision is final and will update leave balances.
            </p>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading requests...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval Trail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No requests found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold">
                              {request.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                            <div className="text-sm text-gray-500">{request.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {request.leaveType.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{request.startDate}</span>
                          <span className="text-gray-500 text-xs">to {request.endDate}</span>
                          <span className="text-indigo-600 font-bold text-xs mt-1">
                            {calculateDays(request.startDate, request.endDate)} days
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm max-w-xs truncate" title={request.reason}>
                        {request.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="space-y-2">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className={`flex items-center ${request.tlApprovalStatus === 'APPROVED' ? 'text-green-600' : request.tlApprovalStatus === 'REJECTED' ? 'text-red-600' : 'text-gray-400'}`}>
                              <span className="font-semibold">TL:</span>
                              <span className="ml-1">{request.tlApprovalStatus}</span>
                            </div>
                            {request.tlApprovedBy && (
                              <div className="text-gray-600 text-xs">by {request.tlApprovedBy}</div>
                            )}
                            {request.tlComments && (
                              <div className="text-gray-600 italic mt-1">"{request.tlComments}"</div>
                            )}
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className={`flex items-center ${request.managerApprovalStatus === 'APPROVED' ? 'text-green-600' : request.managerApprovalStatus === 'REJECTED' ? 'text-red-600' : 'text-gray-400'}`}>
                              <span className="font-semibold">Manager:</span>
                              <span className="ml-1">{request.managerApprovalStatus}</span>
                            </div>
                            {request.managerApprovedBy && (
                              <div className="text-gray-600 text-xs">by {request.managerApprovedBy}</div>
                            )}
                            {request.managerComments && (
                              <div className="text-gray-600 italic mt-1">"{request.managerComments}"</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {request.status === 'PENDING_MANAGER' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(request, 'approve')}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => openModal(request, 'reject')}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center mb-4">
              <div className={`${actionType === 'approve' ? 'bg-green-100' : 'bg-red-100'} rounded-full p-3 mr-4`}>
                <svg className={`w-6 h-6 ${actionType === 'approve' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {actionType === 'approve' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Final {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </h3>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Employee</p>
              <p className="font-semibold text-gray-900">{selectedRequest?.userName}</p>
              <p className="text-sm text-gray-600 mt-2">Duration</p>
              <p className="font-semibold text-gray-900">
                {selectedRequest?.startDate} to {selectedRequest?.endDate} ({calculateDays(selectedRequest?.startDate, selectedRequest?.endDate)} days)
              </p>
              <p className="text-sm text-gray-600 mt-2">TL Comments</p>
              <p className="text-sm text-gray-900 italic">{selectedRequest?.tlComments || 'No comments'}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager Comments {actionType === 'reject' && <span className="text-red-600">*</span>}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows="4"
                placeholder={actionType === 'approve' ? 'Optional comments for approval...' : 'Required: Reason for rejection...'}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                className={`flex-1 ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white py-2 rounded-lg transition font-medium`}
              >
                Confirm Final {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovals;