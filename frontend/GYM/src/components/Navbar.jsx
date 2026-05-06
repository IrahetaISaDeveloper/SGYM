import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Dumbbell, LogOut, LayoutDashboard, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gym-card border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Dumbbell className="h-8 w-8 text-neon-green glow-neon" />
              <span className="text-xl font-bold tracking-wider text-white">SMART <span className="text-neon-green">FIT</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-slate-400 hidden sm:block">
                  Hola, <span className="text-white font-medium">{user.name}</span>
                </span>
                
                {user.role === 'admin' || user.role === 'staff' ? (
                  <>
                    <Link to="/dashboard" className="p-2 text-slate-300 hover:text-neon-green transition-colors" title="Dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                    </Link>
                    <Link to="/machines" className="p-2 text-slate-300 hover:text-neon-green transition-colors" title="Machines">
                      <Settings className="h-5 w-5" />
                    </Link>
                  </>
                ) : null}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block">Salir</span>
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="text-slate-300 hover:text-neon-green transition-colors font-medium">Ingresar</Link>
                <Link to="/register" className="text-gym-darker bg-neon-green hover:bg-lime-400 px-4 py-1 rounded-md font-bold transition-colors">Registro</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
