import React, { useState, useEffect, useContext } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, ShieldCheck, AlertCircle, RefreshCw, Wrench, CheckCircle2, Star, ChevronRight, Flame } from 'lucide-react';
import AccessCalendar from '../components/AccessCalendar';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';

const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin()
});

const ClientPanel = () => {
  const { user } = useContext(AuthContext);
  const [qrToken, setQrToken] = useState('');
  const [loadingQr, setLoadingQr] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  
  // Machine reporting state
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');

  // Access Logs state
  const [accessLogs, setAccessLogs] = useState([]);
  
  // Note: We might need to fetch the specific user details if AuthContext doesn't have the updated membershipStatus
  // For now we'll assume it is part of `user` or fetch if needed. Let's fetch the full user profile to be safe.
  const [profile, setProfile] = useState(user);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/api/users/${user._id}`);
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile", error);
    }
  };

  const generateQR = async () => {
    // We expect profile.totpSecret to exist from the /me or /login endpoints
    if (profile && profile.totpSecret) {
      try {
        const token = await totp.generate({ secret: profile.totpSecret });
        const payload = JSON.stringify({ id: profile._id, code: token });
        setQrToken(payload);
        
        // Calculate remaining seconds in current 30s window
        const epoch = Math.floor(Date.now() / 1000);
        const step = 30;
        const remainder = epoch % step;
        setTimeLeft(step - remainder);
        setLoadingQr(false);
      } catch (error) {
        console.error("Error generating TOTP locally", error);
      }
    } else {
      // If we don't have the secret yet, fetch profile to get it
      fetchProfile();
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await api.get('/api/machines');
      // Only show operative machines to report
      setMachines(response.data.filter(m => m.status.toLowerCase() === 'operativa'));
    } catch (error) {
      console.error("Error fetching machines", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/access/my-logs');
      setAccessLogs(response.data);
    } catch (error) {
      console.error("Error fetching access logs", error);
    }
  };

  const handleReportMachine = async (e) => {
    e.preventDefault();
    if (!selectedMachine) return;
    
    setIsReporting(true);
    setReportSuccess('');
    try {
      await api.put(`/api/machines/${selectedMachine}/report`);
      setReportSuccess('Máquina reportada exitosamente. ¡Gracias!');
      setSelectedMachine('');
      fetchMachines(); // refresh list
      setTimeout(() => setReportSuccess(''), 5000);
    } catch (error) {
      console.error("Error reporting machine", error);
      alert('Error al reportar la máquina. Inténtalo de nuevo.');
    } finally {
      setIsReporting(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    generateQR();
    fetchMachines();
    fetchLogs();

    // Regenerate exactly when the 30s window rolls over
    const checkIntervalId = setInterval(() => {
      const epoch = Math.floor(Date.now() / 1000);
      if (epoch % 30 === 0) {
        generateQR();
      }
    }, 1000);

    const countdownId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Fallback if interval misses the exact 0 second
          generateQR();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(checkIntervalId);
      clearInterval(countdownId);
    };
  }, [profile?.totpSecret]); // re-run when secret is available

  const isActive = profile?.membershipStatus === 'Activa' || profile?.membershipStatus === 'active';

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
          <p className="text-slate-400 text-sm">Gestiona tu acceso</p>
        </div>
        
        {profile?.currentStreak > 0 && (
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 border border-orange-500/30">
            <div className="flex items-center gap-1">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-xl font-bold text-white leading-none">{profile.currentStreak}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Racha</span>
          </div>
        )}
      </div>

      {/* Status Card */}
      <div className={`rounded-2xl p-6 mb-6 shadow-xl border relative overflow-hidden ${
        isActive 
          ? 'bg-gradient-to-br from-gym-card to-slate-800 border-neon-green/30' 
          : 'bg-gradient-to-br from-gym-card to-slate-800 border-red-500/30'
      }`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <DumbbellBg className="h-24 w-24" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isActive ? 'bg-neon-green/20' : 'bg-red-500/20'}`}>
              <CreditCard className={`h-6 w-6 ${isActive ? 'text-neon-green' : 'text-red-500'}`} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Estado de Membresía</p>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isActive ? 'text-neon-green' : 'text-red-500'}`}>
                {isActive ? 'ACTIVA' : 'INACTIVA'}
                {isActive ? <ShieldCheck className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              </h2>
            </div>
          </div>
          
          <div className="bg-gym-darker/50 rounded-lg p-3 border border-slate-700 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400">Plan Actual</p>
              <p className="text-white font-medium">{profile?.planId?.name || 'Membresía Básica'}</p>
            </div>
            {profile?.membershipExpiration && (
              <div className="text-right">
                <p className="text-xs text-slate-400">Vence el</p>
                <p className="text-white font-medium text-sm">
                  {new Date(profile.membershipExpiration).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Section */}
      <div className="bg-gym-card rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col items-center">
        <h3 className="text-lg font-bold text-white mb-2">Tu Código de Acceso</h3>
        <p className="text-sm text-slate-400 text-center mb-6">
          Acerca este código al escáner en la entrada para ingresar al gimnasio.
        </p>

        <div className="bg-white p-4 rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.15)] relative">
          {loadingQr || !qrToken ? (
            <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-100 rounded-lg">
              <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
            </div>
          ) : (
            <>
              {!isActive && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-xl p-4 text-center">
                  <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                  <p className="text-gym-darker font-bold">Membresía Inactiva</p>
                  <p className="text-sm text-slate-600">Renueva para acceder</p>
                </div>
              )}
              <QRCodeCanvas value={qrToken} size={200} level="H" />
            </>
          )}
        </div>
        
        {isActive && (
          <div className="mt-6 flex items-center gap-2 text-sm">
            <RefreshCw className={`h-4 w-4 ${timeLeft < 10 ? 'text-red-400 animate-spin' : 'text-slate-400'}`} />
            <span className={timeLeft < 10 ? 'text-red-400 font-medium' : 'text-slate-400'}>
              Actualizando en {timeLeft}s
            </span>
          </div>
        )}
      </div>

      {/* Calendar Section */}
      <AccessCalendar logs={accessLogs} />

      {/* Premium Routine Card */}
      {profile?.currentPlan?.isPremium && (
        <Link 
          to="/my-routine" 
          className="block bg-gradient-to-br from-gym-card to-slate-800 rounded-2xl p-6 mt-6 border border-neon-green/30 shadow-xl hover:border-neon-green/60 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-green/20">
                <Star className="h-5 w-5 text-neon-green" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Mi Rutina Premium</h3>
                <p className="text-sm text-slate-400">Ver ejercicios del día y tu calendario semanal</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-neon-green group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      )}

      {/* Report Machine Section */}
      <div className="bg-gym-card rounded-2xl p-6 mt-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-slate-800">
            <Wrench className="h-5 w-5 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-white">Reportar Máquina</h3>
        </div>
        
        <p className="text-sm text-slate-400 mb-4">
          ¿Encontraste una máquina averiada? Ayúdanos a mantener el gimnasio en óptimas condiciones.
        </p>

        {reportSuccess ? (
          <div className="bg-neon-green/10 border border-neon-green/30 text-neon-green px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            {reportSuccess}
          </div>
        ) : (
          <form onSubmit={handleReportMachine} className="space-y-4">
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gym-darker border border-slate-700 rounded-md text-white focus:border-neon-green focus:outline-none text-sm"
            >
              <option value="" disabled>Selecciona la máquina averiada</option>
              {machines.map(m => (
                <option key={m._id} value={m._id}>
                  {m.internalCode} - {m.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isReporting || !selectedMachine}
              className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-md transition-colors text-sm flex justify-center items-center gap-2"
            >
              {isReporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              {isReporting ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// SVG Icon for Background
const DumbbellBg = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.4 14.4 9.6 9.6M18.65 21.35a5 5 0 0 1-7.07-7.07l-6.23-6.23a2 2 0 1 1 2.83-2.83l6.23 6.23a5 5 0 0 1 7.07 7.07Z"/>
    <path d="m21.5 2.5-4 4"/>
    <path d="M2.5 21.5l4-4"/>
  </svg>
);

export default ClientPanel;
