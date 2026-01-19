// src/components/TL/LeaveRequests.jsx
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
      alert('Leave request submitted successfully! Your request will go directly to Manager for approval.');
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
    const steps = [];
    
    steps.push({ name: 'Submitted', completed: true });
    
    // TL requests skip TL approval
    if (request.tlApprovalStatus !== 'NOT_REQUIRED') {
      steps.push({ 
        name: 'TL Approval', 
        completed: request.tlApprovalStatus === 'APPROVED',
        rejected: request.tlApprovalStatus === 'REJECTED',
        pending: request.tlApprovalStatus === 'PENDING'
      });
    }
    
    if (request.managerApprovalStatus !== 'NOT_REQUIRED') {
      steps.push({ 
        name: 'Manager Approval', 
        completed: request.managerApprovalStatus === 'APPROVED',
        rejected: request.managerApprovalStatus === 'REJECTED',
        pending: request.managerApprovalStatus === 'PENDING'
      });
    }
    
    return steps;
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-6">
      {/* TL Specific Workflow Info */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800">Your Leave Approval Workflow</p>
            <p className="text-sm text-blue-700 mt-1">
              <strong>TL → Manager</strong>
            </p>
            <p className="text-sm text-blue-600 mt-1">
              As a Team Leader, your leave requests go directly to the Manager for approval. TL approval is automatically skipped.
            </p>
          </div>
        </div>
      </div>

      {/* Leave Balance Card */}
      {balance && (
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Leave Balance - {balance.year}</h2>
            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition">
              <p className="text-3xl font-bold">{balance.sickLeave}</p>
              <p className="text-sm mt-1">Sick Leave</p>
            </div>
            <div className="text-center p-4 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition">
              <p className="text-3xl font-bold">{balance.casualLeave}</p>
              <p className="text-sm mt-1">Casual Leave</p>
            </div>
            <div className="text-center p-4 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition">
              <p className="text-3xl font-bold">{balance.annualLeave}</p>
              <p className="text-sm mt-1">Annual Leave</p>
            </div>
          </div>
        </div>
      )}

      {/* Request Leave Button */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg font-medium transition flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Request New Leave
      </button>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">My Leave Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Track your leave requests and their approval status</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium text-gray-900">No leave requests yet</p>
                      <p className="text-sm text-gray-500 mt-1">Click "Request New Leave" to submit your first request</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {request.leaveType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{request.startDate}</span>
                        <span className="text-gray-500 text-xs">to {request.endDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-blue-600">
                        {calculateDays(request.startDate, request.endDate)} 
                        <span className="text-xs font-normal ml-1">
                          {calculateDays(request.startDate, request.endDate) === 1 ? 'day' : 'days'}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getApprovalProgress(request).map((step, idx) => (
                          <React.Fragment key={idx}>
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                                step.completed ? 'bg-green-500 text-white shadow-lg' :
                                step.rejected ? 'bg-red-500 text-white shadow-lg' :
                                step.pending ? 'bg-yellow-500 text-white shadow-lg animate-pulse' :
                                'bg-gray-200 text-gray-600'
                              }`}>
                                {step.completed ? '✓' : step.rejected ? '✗' : idx + 1}
                              </div>
                              <span className="text-xs mt-1.5 text-gray-600 text-center font-medium max-w-[70px]">
                                {step.name}
                              </span>
                            </div>
                            {idx < getApprovalProgress(request).length - 1 && (
                              <div className={`h-1 w-12 rounded transition ${
                                step.completed ? 'bg-green-500' : 'bg-gray-200'
                              }`}></div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewDetails(request)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Details
                        </button>
                        {(request.status === 'PENDING_MANAGER') && (
                          <button
                            onClick={() => handleCancel(request.id)}
                            className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Request Leave</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="SICK_LEAVE">Sick Leave</option>
                  <option value="CASUAL_LEAVE">Casual Leave</option>
                  <option value="ANNUAL_LEAVE">Annual Leave</option>
                  <option value="UNPAID_LEAVE">Unpaid Leave</option>
                  <option value="COMPENSATORY_OFF">Compensatory Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Please provide a detailed reason for your leave..."
                  required
                />
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Your request will be sent directly to the Manager for approval.
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition shadow-lg"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-medium transition"
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Leave Request Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Leave Type</p>
                  <p className="font-semibold text-gray-900">{selectedRequest.leaveType.replace(/_/g, ' ')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Duration</p>
                <p className="font-semibold text-gray-900">
                  {selectedRequest.startDate} to {selectedRequest.endDate}
                </p>
                <p className="text-sm text-blue-600 font-medium mt-1">
                  {calculateDays(selectedRequest.startDate, selectedRequest.endDate)} days
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Reason</p>
                <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
              </div>

              <hr className="my-4" />

              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-gray-900">Approval Trail</h4>
                
                {selectedRequest.tlApprovalStatus === 'NOT_REQUIRED' && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-800">TL Approval Skipped</p>
                        <p className="text-xs text-blue-600">Your request goes directly to Manager</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRequest.managerApprovalStatus !== 'NOT_REQUIRED' && (
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-400">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Manager Approval</span>
                      <span className={`text-sm font-semibold ${
                        selectedRequest.managerApprovalStatus === 'APPROVED' ? 'text-green-600' :
                        selectedRequest.managerApprovalStatus === 'REJECTED' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {selectedRequest.managerApprovalStatus}
                      </span>
                    </div>
                    {selectedRequest.managerApprovedBy && (
                      <p className="text-sm text-gray-600">Reviewed by: {selectedRequest.managerApprovedBy}</p>
                    )}
                    {selectedRequest.managerApprovalDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(selectedRequest.managerApprovalDate).toLocaleString()}
                      </p>
                    )}
                    {selectedRequest.managerComments && (
                      <div className="mt-2 bg-white p-2 rounded border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Comments:</p>
                        <p className="text-sm text-gray-700 italic">"{selectedRequest.managerComments}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-6 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-medium transition"
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