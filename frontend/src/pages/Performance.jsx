import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Plus, Calendar, Star, CheckCircle, Clock, AlertCircle, Search, X } from 'lucide-react';
import { performanceAPI, employeeAPI } from '../services/api';
import { useSelector } from 'react-redux';

const PerformancePage = () => {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { user: currentUser } = useSelector((state) => state.auth);
  
  const canCreateReview = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  // --- UPDATED FORM STATE WITH MISSING FIELDS ---
  const [formData, setFormData] = useState({
    employeeId: '',
    reviewPeriod: 'Q1 2025',
    rating: '0',        // Added Rating
    status: 'Pending',  // Added Status
    feedback: '',       // Added Feedback
    goals: [{ title: 'Main Goal', status: 'Not Started' }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reviewsRes = await performanceAPI.getAll();
      setReviews(reviewsRes.data || []);

      if (canCreateReview) {
        const employeesRes = await employeeAPI.getAll();
        setEmployees(employeesRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
        alert("Please select an employee.");
        return;
    }

    try {
      await performanceAPI.create(formData);
      setShowCreateModal(false);
      fetchData(); 
      // Reset form
      setFormData({ 
        employeeId: '', 
        reviewPeriod: 'Q1 2025', 
        rating: '0', 
        status: 'Pending', 
        feedback: '', 
        goals: [{ title: 'Main Goal', status: 'Not Started' }] 
      });
      alert("Review created successfully!");
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create review');
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, curr) => acc + (Number(curr.overallRating) || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  const metrics = {
    averageRating: calculateAverageRating(),
    completedReviews: reviews.filter(r => r.status === 'Completed').length,
    pendingReviews: reviews.filter(r => r.status === 'Pending' || r.status === 'Draft').length,
    inProgressReviews: reviews.filter(r => r.status === 'In Progress').length,
    totalReviews: reviews.length
  };

  // --- Filter Logic ---
  const filteredReviews = reviews.filter(review => {
    const empName = review.employee?.user?.name || review.employee?.name || 'Unknown';
    const matchesSearch = empName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!canCreateReview) {
       const isMyReview = (review.employee?.user?._id === currentUser._id) || (review.employee?.user === currentUser._id);
       return matchesSearch && isMyReview;
    }
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-700 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'In Progress': 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Reviews</h1>
            <p className="text-gray-500">{canCreateReview ? "Manage reviews" : "My Performance"}</p>
          </div>
          {canCreateReview && (
              <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-all">
                <Plus className="w-4 h-4" /> <span>New Review</span>
              </button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{metrics.averageRating}</h3>
            <p className="text-sm text-gray-500">Avg Rating</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{metrics.completedReviews}</h3>
            <p className="text-sm text-gray-500 text-green-600">Completed</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{metrics.inProgressReviews}</h3>
            <p className="text-sm text-gray-500 text-blue-600">In Progress</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{metrics.pendingReviews}</h3>
            <p className="text-sm text-gray-500 text-yellow-600">Pending</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
        <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReviews.map((review) => (
          <div key={review._id} onClick={() => setSelectedReview(review)} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="flex justify-between mb-4">
               <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {review.employee?.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{review.employee?.user?.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-500">{review.reviewPeriod}</p>
                  </div>
               </div>
               <span className={`text-xs px-2 py-1 h-fit rounded-full border ${getStatusColor(review.status)}`}>{review.status}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">Overall Rating</span>
                <div className="flex items-center space-x-1">
                    <Star className={`w-5 h-5 fill-current ${getRatingColor(review.overallRating)}`} />
                    <span className="font-bold text-lg">{review.overallRating || '0'}</span>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- UPDATED CREATE MODAL --- */}
      {showCreateModal && canCreateReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h2 className="text-xl font-bold">New Review</h2>
               <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5 text-gray-400"/></button>
            </div>
            <form onSubmit={handleCreateReview} className="p-6 space-y-4">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                <select 
                  required 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.user?.name || 'Unknown'} ({emp.designation || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Period & Status */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                    <select className="w-full px-4 py-2 border rounded-lg" value={formData.reviewPeriod} onChange={(e) => setFormData({...formData, reviewPeriod: e.target.value})}>
                        <option>Q1 2025</option><option>Q2 2025</option><option>Q3 2025</option><option>Q4 2025</option><option>Annual 2024</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select className="w-full px-4 py-2 border rounded-lg" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                  </div>
              </div>

              {/* Rating & Feedback */}
              <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <select className="w-full px-4 py-2 border rounded-lg" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})}>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                    <input 
                        type="text" 
                        className="w-full px-4 py-2 border rounded-lg" 
                        placeholder="Short comment..."
                        value={formData.feedback} 
                        onChange={(e) => setFormData({...formData, feedback: e.target.value})} 
                    />
                  </div>
              </div>

              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePage;