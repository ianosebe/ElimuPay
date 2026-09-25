import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Users, Home, LogOut, UserCircle, LayoutDashboard, FileText, Settings, BookOpen, Receipt, BarChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!user) {
    return <Outlet />;
  }

  // Admin Layout with Sidebar
  if (user.role === 'admin') {
    const adminLinks = [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Student Profiles', path: '/admin/students', icon: Users },
      { name: 'Fee Structures', path: '/admin/fee-structures', icon: BookOpen },
      { name: 'Transactions', path: '/admin/transactions', icon: Receipt },
      { name: 'Reports', path: '/admin/reports', icon: BarChart },
      { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex-col hidden md:flex min-h-screen fixed">
          <div className="h-16 flex items-center px-6 bg-slate-950">
            <span className="text-xl font-bold text-blue-500">ElimuPay Admin</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {adminLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium text-sm">{link.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <div className="flex items-center space-x-3 mb-4 px-2">
              <UserCircle className="w-8 h-8 text-slate-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">Administrator</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
          <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:hidden">
            <span className="text-xl font-bold text-blue-600">ElimuPay</span>
            <button onClick={handleLogout} className="text-gray-500">
              <LogOut className="w-6 h-6" />
            </button>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Parent Layout with Top Navigation
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">ElimuPay</span>
              </Link>
              <div className="ml-6 flex space-x-8">
                <Link
                  to="/parent"
                  className={`${
                    location.pathname.startsWith('/parent')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700">
                <UserCircle className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 p-2 rounded-full transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
