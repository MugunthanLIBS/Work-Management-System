// src/components/Employee/LeaveRequests.jsx - Multi-level tracking
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  createLeaveRequest,
  getMyLeaveRequests,
  cancelLeaveRequest,
  getLeaveBalance,
} from '../../services/leaveService';

const LeaveRequests = () => {
  const user = useSelector((state) => state.auth.user);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [balance, setBalance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [formData, setFormData] = useState({
    leaveType: 'SICK_LEAVE',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    try {
      const [requests, balanceData] = await Promise.all([
        getMyLeaveRequests(user.id),
        getLeaveBalance(user.id),
      ]);
      setLeaveRequests(requests);
      setBalance(balanceData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createLeaveRequest(user.id, formData);
      setShowModal(false);
      setFormData({
        leaveType: 'SICK_LEAVE',
        startDate: '',
        endDate: '',
        reason: '',
      });
      fetchData();
      alert('Leave request submitted successfully! Pending TL approval.');
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    
    try {
      await cancelLeaveRequest(requestId, user.id);
      fetchData();
      alert('Leave request cancelled successfully!');
    } catch (error) {
      alert(error);
    }
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
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

  const getApprovalProgress = (request) => {
    const steps = [
      { name: 'Submitted', completed: true },
      { 
        name: 'TL Approval', 
        completed: request.tlApprovalStatus === 'APPROVED',
        rejected: request.tlApprovalStatus === 'REJECTED',
        pending: request.tlApprovalStatus === 'PENDING'
      },
      { 
        name: 'Manager Approval', 
        completed: request.managerApprovalStatus === 'APPROVED',
        rejected: request.managerApprovalStatus === 'REJECTED',
        pending: request.managerApprovalStatus === 'PENDING'
      },
    ];
    
    return steps;
  };

  return (
    <div className="space-y-6">
      {/* Leave Balance Card */}
      {balance && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Leave Balance - {balance.year}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/20 rounded-lg backdrop-blur-sm">
              <p className="text-3xl font-bold">{balance.sickLeave}</p>
              <p className="text-sm mt-1">Sick Leave</p>
            </div>
            <div className="text-center p-4 bg-white/20 rounded-lg backdrop-blur-sm">
              <p className="text-3xl font-bold">{balance.casualLeave}</p>
              <p className="text-sm mt-1">Casual Leave</p>
            </div>
            <div className="text-center p-4 bg-white/20 rounded-lg backdrop-blur-sm">
              <p className="text-3xl font-bold">{balance.annualLeave}</p>
              <p className="text-sm mt-1">Annual Leave</p>
            </div>
          </div>
        </div>
      )}

      {/* Request Leave Button */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 shadow-lg font-medium"
      >
        + Request New Leave
      </button>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Leave Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No leave requests yet. Click "Request New Leave" to get started.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.leaveType.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>{request.startDate}</div>
                        <div className="text-gray-500 text-xs">to {request.endDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getApprovalProgress(request).map((step, idx) => (
                            <React.Fragment key={idx}>
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  step.completed ? 'bg-green-500 text-white' :
                                  step.rejected ? 'bg-red-500 text-white' :
                                  step.pending ? 'bg-yellow-500 text-white' :
                                  'bg-gray-300 text-gray-600'
                                }`}>
                                  {step.completed ? '✓' : step.rejected ? '✗' : idx + 1}
                                </div>
                                <span className="text-xs mt-1 text-gray-600">{step.name}</span>
                              </div>
                              {idx < getApprovalProgress(request).length - 1 && (
                                <div className={`h-0.5 w-8 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => viewDetails(request)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium mr-3"
                        >
                          Details
                        </button>
                        {(request.status === 'PENDING_TL' || request.status === 'PENDING_MANAGER') && (
                          <button
                            onClick={() => handleCancel(request.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Request Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Request Leave</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="SICK_LEAVE">Sick Leave</option>
                  <option value="CASUAL_LEAVE">Casual Leave</option>
                  <option value="ANNUAL_LEAVE">Annual Leave</option>
                  <option value="UNPAID_LEAVE">Unpaid Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  placeholder="Please provide a reason for your leave..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Leave Request Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Leave Type</p>
                  <p className="font-semibold">{selectedRequest.leaveType.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">{selectedRequest.startDate} to {selectedRequest.endDate}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Reason</p>
                <p className="text-gray-900">{selectedRequest.reason}</p>
              </div>

              <hr />

              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Approval Trail</h4>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">TL Approval</span>
                    <span className={`text-sm ${
                      selectedRequest.tlApprovalStatus === 'APPROVED' ? 'text-green-600' :
                      selectedRequest.tlApprovalStatus === 'REJECTED' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {selectedRequest.tlApprovalStatus}
                    </span>
                  </div>
                  {selectedRequest.tlApprovedBy && (
                    <p className="text-sm text-gray-600 mt-1">By: {selectedRequest.tlApprovedBy}</p>
                  )}
                  {selectedRequest.tlComments && (
                    <p className="text-sm text-gray-700 mt-2 italic">"{selectedRequest.tlComments}"</p>
                  )}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Manager Approval</span>
                    <span className={`text-sm ${
                      selectedRequest.managerApprovalStatus === 'APPROVED' ? 'text-green-600' :
                      selectedRequest.managerApprovalStatus === 'REJECTED' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {selectedRequest.managerApprovalStatus}
                    </span>
                  </div>
                  {selectedRequest.managerApprovedBy && (
                    <p className="text-sm text-gray-600 mt-1">By: {selectedRequest.managerApprovedBy}</p>
                  )}
                  {selectedRequest.managerComments && (
                    <p className="text-sm text-gray-700 mt-2 italic">"{selectedRequest.managerComments}"</p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-6 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;