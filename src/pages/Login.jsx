import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isSignUp) {
      const result = await signup(email, password, fullName);
      if (result.success) {
        setSuccessMsg('Account created successfully! You can now sign in.');
        setIsSignUp(false); // Switch back to login view
      } else {
        setError(result.message);
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* Left side - Intense Hero Image with Gradient Overlay */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <img
          src="https://i.pinimg.com/originals/13/ab/5b/13ab5ba671f0ca0c03336188d6a94018.jpg"
          alt="School Environment"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 flex flex-col justify-end p-16 text-white">
          <div className="p-8 rounded-2xl shadow-2xl transform translate-y-0 opacity-100 transition-all duration-700" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            <h2 className="text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              Transforming <br/> <span className="text-blue-400">School Finance.</span>
            </h2>
            <p className="text-xl text-gray-100 font-bold max-w-lg leading-relaxed">
              Experience unparalleled clarity in fee management. Empowering parents and administrators through real-time transparency.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form with High-Intensity UI */}
      <div className="w-full lg:w-[45%] flex items-center justify-center bg-white relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="max-w-md w-full space-y-8 px-6 sm:px-10 lg:px-12 py-16">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-800 pb-2">
              ElimuPay
            </h1>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">
              {isSignUp ? 'Create Parent Account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-base text-gray-500 font-medium">
              {isSignUp ? 'Sign up to manage your child\'s portal' : 'Securely access your financial portal'}
            </p>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100 shadow-sm flex items-center animate-pulse">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium border border-green-100 shadow-sm flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                {successMsg}
              </div>
            )}

            <div className="space-y-5">
              {isSignUp && (
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm"
                    placeholder="parent@elimupay.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-1.5 transition-colors group-focus-within:text-blue-600">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-lg shadow-blue-500/30 transition-all duration-200 overflow-hidden"
              >
                <span className="flex items-center">
                  {isSignUp ? 'Create Parent Account' : 'Sign in securely'}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
            
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors focus:outline-none"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'New Parent? Create an Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
