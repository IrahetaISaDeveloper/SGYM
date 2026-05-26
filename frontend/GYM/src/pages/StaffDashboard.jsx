import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, QrCode, Search, CheckCircle, XCircle, Settings2, Camera, ShoppingBag, Bell, Loader2 } from 'lucide-react';
import QrScanner from '../components/QrScanner';
import POSSystem from '../components/POSSystem';

const StaffDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [planId, setPlanId] = useState('');
  const [amount, setAmount] = useState('');
  
  // QR Scanner State
  const [qrToken, setQrToken] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const [plans, setPlans] = useState([]);

  // Shift & Cash Drawer state
  const [activeShift, setActiveShift] = useState(null);
  const [shiftLoading, setShiftLoading] = useState(true);

  // Tab navigation
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'pos' | 'alerts'

  // Notifications state
  const [notifications, setNotifications] = useState(null);
  const [checkingNotifications, setCheckingNotifications] = useState(false);

  const fetchUsersAndPlans = async () => {
    try {
      const [usersRes, plansRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/plans')
      ]);
      setUsers(usersRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveShift = async () => {
    try {
      const res = await api.get('/api/shifts/active');
      setActiveShift(res.data);
    } catch (err) {
      console.error('Error al cargar turno de caja', err);
    } finally {
      setShiftLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndPlans();
    fetchActiveShift();
  }, []);

  const handleCheckExpirations = async () => {
    setCheckingNotifications(true);
    try {
      const res = await api.post('/api/notifications/check-expiring');
      setNotifications(res.data.results);
      // Actualizar la lista de miembros también
      fetchUsersAndPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al verificar vencimientos');
    } finally {
      setCheckingNotifications(false);
    }
  };

  const handleRenewClick = (user) => {
    setSelectedUser(user);
    if (plans.length > 0) {
      setPlanId(plans[0]._id);
      setAmount(plans[0].price);
    } else {
      setPlanId('');
      setAmount('');
    }
    setIsModalOpen(true);
  };

  const handlePlanChange = (e) => {
    const selectedPlanId = e.target.value;
    setPlanId(selectedPlanId);
    const selectedPlan = plans.find(p => p._id === selectedPlanId);
    if (selectedPlan) {
      setAmount(selectedPlan.price);
    }
  };

  const submitRenewal = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/users/${selectedUser._id}/renew`, {
        planId,
        amount: Number(amount)
      });
      setIsModalOpen(false);
      fetchUsersAndPlans(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Error al renovar membresía');
    }
  };

  const handleScanQR = async (e) => {
    e.preventDefault();
    await validateToken(qrToken);
  };

  const validateToken = async (token) => {
    setScanResult(null);
    setIsValidating(true);
    try {
      const response = await api.post('/api/access/scan', { token });
      setScanResult({ success: true, message: response.data.message || 'Acceso Permitido', data: response.data });
      setQrToken('');
    } catch (err) {
      setScanResult({ success: false, message: err.response?.data?.message || 'Acceso Denegado' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleCameraResult = async (decoded) => {
    setShowScanner(false);
    await validateToken(decoded);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
        <Link 
          to="/machines" 
          className="inline-flex items-center gap-2 bg-gym-card hover:bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Settings2 className="h-5 w-5 text-neon-green" />
          <span>Gestión de Máquinas</span>
        </Link>
      </div>

      {/* Premium Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-8 gap-6">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 pb-4 font-bold text-sm tracking-wider uppercase transition-all relative cursor-pointer ${
            activeTab === 'members' 
              ? 'text-neon-green font-extrabold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Control de Acceso y Miembros</span>
          {activeTab === 'members' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neon-green shadow-[0_0_10px_#ccff00]"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('pos')}
          className={`flex items-center gap-2 pb-4 font-bold text-sm tracking-wider uppercase transition-all relative cursor-pointer ${
            activeTab === 'pos' 
              ? 'text-neon-green font-extrabold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Caja y Punto de Venta (POS)</span>
          {activeTab === 'pos' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neon-green shadow-[0_0_10px_#ccff00]"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 pb-4 font-bold text-sm tracking-wider uppercase transition-all relative cursor-pointer ${
            activeTab === 'alerts' 
              ? 'text-neon-green font-extrabold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Alertas y Vencimientos</span>
          {activeTab === 'alerts' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neon-green shadow-[0_0_10px_#ccff00]"></div>
          )}
        </button>
      </div>

      {activeTab === 'members' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* QR Scanner Simulator */}
          <div className="bg-gym-card rounded-xl p-6 border border-slate-800 shadow-lg lg:col-span-1">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <QrCode className="text-neon-green h-6 w-6" />
                <h2 className="text-xl font-bold text-white">Validar Acceso QR</h2>
              </div>
              <button
                onClick={() => setShowScanner(true)}
                title="Usar cámara"
                className="flex items-center gap-2 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 text-neon-green text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Usar Cámara</span>
              </button>
            </div>
            
            <form onSubmit={handleScanQR} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Pega el token del cliente aquí</label>
                <input
                  type="text"
                  value={qrToken}
                  onChange={(e) => setQrToken(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gym-darker border border-slate-700 rounded-md text-white focus:border-neon-green focus:outline-none"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                />
              </div>
              <button
                type="submit"
                disabled={isValidating}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-white font-medium py-2 rounded-md transition-colors"
              >
                {isValidating ? <><Loader2 className="animate-spin inline h-4 w-4 mr-1" /> Validando...</> : 'Validar Acceso'}
              </button>
            </form>

            {scanResult && (
              <div className={`mt-4 p-4 rounded-md flex items-center gap-3 ${scanResult.success ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {scanResult.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                <span className="font-medium">{scanResult.message}</span>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-gym-card rounded-xl border border-slate-800 shadow-lg lg:col-span-2 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Users className="text-neon-green h-6 w-6" />
                <h2 className="text-xl font-bold text-white">Miembros</h2>
              </div>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Buscar..." className="pl-9 pr-4 py-1.5 bg-gym-darker border border-slate-700 rounded-md text-sm text-white focus:border-neon-green focus:outline-none" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gym-darker text-slate-400 text-sm border-b border-slate-800">
                    <th className="px-6 py-4 font-medium">Nombre</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Estado</th>
                    <th className="px-6 py-4 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {loading ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No hay usuarios registrados</td></tr>
                  ) : (
                    users.map(user => (
                      <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-white">{user.name}</td>
                        <td className="px-6 py-4 text-slate-400">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (user.membershipStatus === 'Activa' || user.membershipStatus === 'active')
                              ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {(user.membershipStatus === 'Activa' || user.membershipStatus === 'active') ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRenewClick(user)}
                            className="text-sm bg-gym-darker border border-slate-600 hover:border-neon-green text-slate-300 hover:text-neon-green px-3 py-1.5 rounded transition-colors"
                          >
                            Renovar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'pos' ? (
        <div className="mb-8">
          {shiftLoading ? (
            <div className="text-center py-20 text-slate-500 font-medium">
              <span className="inline-flex items-center gap-2 animate-pulse text-neon-green"><Loader2 className="h-5 w-5 animate-spin" /> Cargando estado de la caja...</span>
            </div>
          ) : (
            <POSSystem activeShift={activeShift} onShiftChange={setActiveShift} />
          )}
        </div>
      ) : (
        <div className="bg-gym-card rounded-xl border border-slate-800 shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Bell className="text-neon-green h-6 w-6" />
              <h2 className="text-xl font-bold text-white">Alertas de Vencimiento</h2>
            </div>
            <button 
              onClick={handleCheckExpirations}
              disabled={checkingNotifications}
              className="bg-neon-green hover:bg-lime-400 text-gym-darker font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              {checkingNotifications ? 'Verificando...' : 'Verificar Vencimientos Ahora'}
            </button>
          </div>

          {notifications ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Próximos a Vencer (3 días)</h3>
                {notifications.expiringSoon.length === 0 ? (
                  <p className="text-slate-400 text-sm">No hay membresías próximas a vencer.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notifications.expiringSoon.map(user => (
                      <div key={user._id} className="bg-gym-darker border border-yellow-500/30 p-4 rounded-lg">
                        <p className="font-bold text-yellow-400">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                        <p className="text-xs text-slate-500 mt-2">Vence en {user.daysLeft} día(s) - {user.plan}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">Membresías Auto-Vencidas Hoy</h3>
                {notifications.autoExpired.length === 0 ? (
                  <p className="text-slate-400 text-sm">No se encontraron membresías vencidas automáticamente.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notifications.autoExpired.map(user => (
                      <div key={user._id} className="bg-gym-darker border border-red-500/30 p-4 rounded-lg">
                        <p className="font-bold text-red-400">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                        <p className="text-xs text-slate-500 mt-2">Marcado como vencido - {user.plan}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Haz clic en "Verificar Vencimientos Ahora" para buscar usuarios con membresías próximas a vencer y marcar las expiradas.</p>
            </div>
          )}
        </div>
      )}

      {/* Renewal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gym-card rounded-xl p-6 border border-slate-800 shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Renovar Membresía</h3>
            <p className="text-slate-400 mb-6 text-sm">Usuario: <span className="text-white font-medium">{selectedUser?.name}</span></p>
            
            <form onSubmit={submitRenewal} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Plan de Membresía</label>
                <select
                  value={planId}
                  onChange={handlePlanChange}
                  required
                  className="w-full px-4 py-2 bg-gym-darker border border-slate-700 rounded-md text-white focus:border-neon-green focus:outline-none"
                >
                  <option value="" disabled>Selecciona un plan</option>
                  {plans.map(plan => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} - ${plan.price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Monto Pagado ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  className="w-full px-4 py-2 bg-gym-darker border border-slate-700 rounded-md text-white"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neon-green text-gym-darker font-bold rounded-md hover:bg-lime-400 transition-colors"
                >
                  Confirmar Renovación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera QR Scanner Modal */}
      {showScanner && (
        <QrScanner
          onResult={handleCameraResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default StaffDashboard;
