import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudentProfile from './pages/AdminStudentProfile';
import FeeStructures from './pages/admin/FeeStructures';
import Transactions from './pages/admin/Transactions';
import Students from './pages/admin/Students';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import Login from './pages/Login';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'parent') return <Navigate to="/parent" replace />;
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<HomeRedirect />} />
            
            <Route element={<ProtectedRoute allowedRole="parent" />}>
              <Route path="/parent" element={<ParentDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/student/:id" element={<AdminStudentProfile />} />
              <Route path="/admin/fee-structures" element={<FeeStructures />} />
              <Route path="/admin/transactions" element={<Transactions />} />
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
