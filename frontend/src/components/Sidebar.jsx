import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, FolderKanban, CheckSquare, Users, TrendingUp, LogOut, Menu, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false); 
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/employees', icon: Users, label: 'Team' },
    { path: '/performance', icon: TrendingUp, label: 'Performance' }
  ];

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileOpen(false);
    navigate('/login');
  };

  
  const closeMobileMenu = () => setIsMobileOpen(false);

  // Fallback for user name logic
  const userInitial = user?.firstName 
    ? user.firstName.charAt(0).toUpperCase() 
    : (user?.name ? user.name.charAt(0).toUpperCase() : 'U');

  const displayName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}` 
    : (user?.name || 'User');

  return (
    <>
      {/* =========================================================
          1. MOBILE HEADER (Only visible on small screens)
          Contains Logo and Hamburger Button
         ========================================================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">EmpTrack</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)} 
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* =========================================================
          2. MOBILE OVERLAY (Dark background when menu is open)
         ========================================================= */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* =========================================================
          3. SIDEBAR CONTAINER (Responsive)
          - Mobile: Fixed, Slides in from left
          - Desktop: Fixed, Always visible
         ========================================================= */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:top-0
      `}>
        
        {/* Logo (Hidden on mobile because we have the header, visible on desktop) */}
        <div className="hidden md:block p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EmpTrack</h1>
              <p className="text-xs text-gray-500">Performance Hub</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-100 mt-16 md:mt-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg border-2 border-indigo-100">
              {userInitial}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeMobileMenu} // Close sidebar when link clicked
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;