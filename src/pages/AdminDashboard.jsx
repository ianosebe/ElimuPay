import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, Receipt, BookOpen, Settings, GraduationCap, Briefcase, School } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      
      setStudentCount(count || 0);
      setLoading(false);
    };
    
    fetchStats();
  }, []);

  const quickLinks = [
    { title: 'Student Profiles', desc: 'Manage enrollments and details', icon: Users, path: '/admin/students', color: 'bg-blue-100 text-blue-600' },
    { title: 'Transactions', desc: 'View payments and balances', icon: Receipt, path: '/admin/transactions', color: 'bg-green-100 text-green-600' },
    { title: 'Fee Structures', desc: 'Manage class pricing', icon: BookOpen, path: '/admin/fee-structures', color: 'bg-purple-100 text-purple-600' },
    { title: 'Settings', desc: 'System configuration', icon: Settings, path: '/admin/settings', color: 'bg-gray-100 text-gray-600' }
  ];

  const stats = [
    { label: 'Total Students', value: loading ? '...' : studentCount, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Teachers', value: '12', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Active Classes', value: '6', icon: School, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Support Staff', value: '4', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name || 'Administrator'}. Here is what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.bg} ${stat.color} mr-4 shrink-0`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => (
            <Link key={link.title} to={link.path} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${link.color}`}>
                <link.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{link.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
