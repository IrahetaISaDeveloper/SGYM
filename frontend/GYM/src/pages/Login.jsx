import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Dumbbell } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, ...user } = response.data;
      login(user, token);
      
      if (user.role === 'Admin' || user.role === 'Staff' || user.role === 'admin' || user.role === 'staff') {
        navigate('/dashboard');
      } else {
        navigate('/client-panel');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error de autenticación');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gym-card rounded-xl p-8 shadow-2xl border border-slate-800">
        <div className="text-center mb-8">
          <Dumbbell className="h-12 w-12 text-neon-green mx-auto mb-4 glow-neon" />
          <h2 className="text-3xl font-bold text-white">Inicia Sesión</h2>
          <p className="text-slate-400 mt-2">Accede a tu cuenta Smart Fit</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gym-darker border border-slate-700 rounded-md text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-colors"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gym-darker border border-slate-700 rounded-md text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-neon-green text-gym-darker font-bold py-3 px-4 rounded-md hover:bg-lime-400 transition-colors shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)]"
          >
            Ingresar
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-neon-green hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
