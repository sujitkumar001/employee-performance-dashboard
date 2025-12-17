import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Briefcase, UserCircle, X, Plus, User, UserCheck, Trash2, Pencil } from 'lucide-react';
import { employeeAPI } from '../services/api';
import { useSelector } from 'react-redux';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]); // Store potential managers for linking
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const { user: currentUser } = useSelector((state) => state.auth);

  // --- ROLE CHECK: Only Admins can Add/Delete ---
  const canAddEmployee = currentUser?.role === 'admin';
  const canEditEmployee = currentUser?.role === 'admin' || currentUser?.role === 'manager'; // Managers can edit details/link subordinates

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'General',
    designation: '',
    phone: '',
    location: '',
    reportsTo: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await employeeAPI.getAll();
      setEmployees(data);
      setManagers(data); // In a real app, filter this to only show potential managers
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- OPEN MODAL FOR CREATING ---
  const handleAddClick = () => {
    if (!canAddEmployee) return; // Guard clause
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: '', email: '', password: '', role: 'employee',
      department: 'General', designation: '', phone: '', location: '', reportsTo: ''
    });
    // Auto-assign manager if current user is manager
    if (currentUser.role === 'manager') {
        setFormData(prev => ({ ...prev, reportsTo: currentUser._id }));
    }
    setShowModal(true);
  };

  // --- OPEN MODAL FOR EDITING (LINKING) ---
  const handleEditClick = (employee) => {
    if (!canEditEmployee) return; // Guard clause
    setIsEditing(true);
    setEditId(employee._id);
    setFormData({
      name: employee.user?.name || '',
      email: employee.user?.email || '',
      password: '', // Keep empty to not change
      role: employee.user?.role || 'employee',
      department: employee.department || 'General',
      designation: employee.designation || '',
      phone: employee.phone || '',
      location: employee.location || '',
      reportsTo: employee.reportsTo?._id || '' // Pre-fill existing manager
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // UPDATE EXISTING EMPLOYEE
        await employeeAPI.update(editId, formData);
        alert('Employee updated successfully!');
      } else {
        // CREATE NEW EMPLOYEE
        await employeeAPI.create(formData);
        alert('Employee created successfully!');
      }
      
      setShowModal(false);
      fetchEmployees(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!canAddEmployee) return; // Only Admin deletes
    if(window.confirm("Are you sure you want to delete this employee?")) {
        try {
            await employeeAPI.delete(id);
            fetchEmployees();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    }
  };

  const departments = ['All', 'Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'General'];

  const filteredEmployees = employees.filter(emp => {
    const fullName = emp.user?.name ? emp.user.name.toLowerCase() : '';
    const email = emp.user?.email ? emp.user.email.toLowerCase() : '';
    const designation = emp.designation ? emp.designation.toLowerCase() : '';
    const dept = emp.department ? emp.department.toLowerCase() : 'general';

    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      designation.includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || dept === filterDepartment.toLowerCase();
    
    return matchesSearch && matchesDepartment;
  });

  const getRoleBadgeColor = (role) => {
    const colors = {
      'admin': 'bg-purple-100 text-purple-700 border-purple-200',
      'manager': 'bg-blue-100 text-blue-700 border-blue-200',
      'employee': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[role] || colors['employee'];
  };

  const getDepartmentColor = (department) => {
    const safeDept = department || 'General';
    const colors = {
      'Engineering': 'bg-indigo-50 text-indigo-700',
      'Design': 'bg-pink-50 text-pink-700',
      'Marketing': 'bg-orange-50 text-orange-700',
      'Sales': 'bg-cyan-50 text-cyan-700',
      'HR': 'bg-emerald-50 text-emerald-700'
    };
    return colors[safeDept] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Directory</h1>
            <p className="text-gray-500">{employees.length} team members</p>
          </div>
          
          {/* --- FIX: Only Show 'Add Employee' Button if Admin --- */}
          {canAddEmployee && (
            <button 
                onClick={handleAddClick}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md"
            >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept.toLowerCase()}>{dept}</option>
              ))}
            </select>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}>Grid</button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}>List</button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
        {filteredEmployees.map((employee) => (
          <div
            key={employee._id}
            onClick={() => setSelectedEmployee(employee)}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
          >
            {/* ACTION BUTTONS (Edit/Delete) - VISIBLE ONLY TO PERMITTED ROLES */}
            {canEditEmployee && (
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleEditClick(employee); }}
                        className="p-2 bg-blue-50 hover:bg-blue-100 rounded-full text-blue-600 transition-colors"
                        title="Edit / Link Manager"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    {canAddEmployee && ( // Only Admin can delete
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(employee._id); }}
                            className="p-2 bg-red-50 hover:bg-red-100 rounded-full text-red-500 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
              {/* UPDATED: Replaced Image with User Initial Circle */}
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl border-2 border-indigo-100 group-hover:border-indigo-300 transition-colors">
                {employee.user?.name ? employee.user.name.charAt(0).toUpperCase() : 'U'}
              </div>

              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getRoleBadgeColor(employee.user?.role)}`}>
                {employee.user?.role || 'Employee'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">{employee.user?.name || 'Unknown User'}</h3>
            <p className="text-sm text-gray-600 mb-3">{employee.designation || 'No Designation'}</p>

            {/* Manager Info Badge */}
            <div className={`mb-3 flex items-center space-x-1 text-xs px-2 py-1 rounded-lg w-fit ${employee.reportsTo ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                <UserCheck className="w-3 h-3" />
                <span>
                    {employee.reportsTo 
                        ? `Reports to: ${employee.reportsTo.name.split(' ')[0]}` 
                        : 'No Manager Linked'
                    }
                </span>
            </div>

            <div className="mb-4">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDepartmentColor(employee.department)}`}>
                {employee.department || 'General'}
              </span>
            </div>

            <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                <span className="truncate">{employee.user?.email || 'No Email'}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredEmployees.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                No employees found.
            </div>
        )}
      </div>

      {/* Add/Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    {isEditing ? 'Edit Employee & Link Manager' : 'Add New Employee'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {isEditing ? 'Update details or assign a new manager' : 'Create a user account and profile'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Account Details */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4" /> Account Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                        required 
                        disabled={isEditing} 
                        type="text" 
                        className={`w-full px-3 py-2 border rounded-lg ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                        required 
                        disabled={isEditing}
                        type="email" 
                        className={`w-full px-3 py-2 border rounded-lg ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                  {!isEditing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" placeholder="Default: 123456" className="w-full px-3 py-2 border rounded-lg" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                      </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select disabled={isEditing} className={`w-full px-3 py-2 border rounded-lg ${isEditing ? 'bg-gray-100' : ''}`} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional Details (Always Editable) */}
              <div className="bg-blue-50 p-4 rounded-xl space-y-4">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Professional Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select className="w-full px-3 py-2 border rounded-lg bg-white" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                      {departments.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input type="text" placeholder="e.g. Senior Developer" className="w-full px-3 py-2 border rounded-lg" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} />
                  </div>
                  
                  {/* REPORTS TO (LINKING FEATURE)
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link to Manager (Reports To)</label>
                    <select 
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                        value={formData.reportsTo}
                        onChange={(e) => setFormData({...formData, reportsTo: e.target.value})}
                    >
                        <option value="">No Manager (Unlinked)</option>
                        {managers
                            .filter(m => !isEditing || m.user?._id !== formData.reportsTo)
                            .map(emp => (
                            <option key={emp.user?._id || emp._id} value={emp.user?._id}>
                                {emp.user?.name || 'Unknown'} - {emp.designation}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Select which manager this employee reports to. This creates the team link.
                    </p>
                  </div> */}
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    {isEditing ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">{selectedEmployee.user?.name || 'Unknown'}</h3>
                    <button onClick={() => setSelectedEmployee(null)}><X/></button>
                </div>
                <p className="text-gray-600 mb-2">Role: {selectedEmployee.user?.role}</p>
                <p className="text-gray-600 mb-2">Department: {selectedEmployee.department}</p>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-500">Reports To</p>
                    <p className="text-gray-900 font-medium">
                        {selectedEmployee.reportsTo ? selectedEmployee.reportsTo.name : 'Not Linked'}
                    </p>
                </div>
                <button onClick={() => setSelectedEmployee(null)} className="w-full py-2 bg-gray-100 rounded-lg mt-4">Close</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;