import React, { useState } from 'react';
import api from '../services/api';
import { 
  ShoppingBag, 
  DollarSign, 
  Plus, 
  Minus, 
  Trash2, 
  Lock, 
  Unlock, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const PRODUCTS_CATALOG = [
  { id: 'p1', name: 'Agua Mineral 💧', price: 1.00, category: 'Hidratación' },
  { id: 'p2', name: 'Bebida Energética 🔋', price: 2.50, category: 'Energía' },
  { id: 'p3', name: 'Shake de Proteína 🥤', price: 3.50, category: 'Suplementos' },
  { id: 'p4', name: 'Barra Energética 🍫', price: 2.00, category: 'Snacks' },
  { id: 'p5', name: 'Toalla Deportiva 🧼', price: 5.00, category: 'Accesorios' },
];

const POSSystem = ({ activeShift, onShiftChange }) => {
  const [initialCash, setInitialCash] = useState('0.00');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle opening cash shift
  const handleOpenShift = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/shifts/open', {
        initialCash: Number(initialCash) || 0
      });
      onShiftChange(res.data);
      setSuccessMsg('Turno de caja abierto correctamente.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al abrir el turno');
    } finally {
      setLoading(false);
    }
  };

  // Handle closing cash shift
  const handleCloseShift = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cerrar el turno de caja y realizar el arqueo?')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/shifts/close');
      onShiftChange(null);
      setSuccessMsg(`Turno cerrado correctamente. Arqueo completado.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cerrar el turno');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Remove or decrement item from cart
  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  // Remove completely from cart
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Calculate cart subtotal
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Submit checkout / cash payment
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const productsPayload = cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      const res = await api.post('/api/shifts/sale', {
        products: productsPayload
      });
      setCart([]);
      onShiftChange(res.data.shift);
      setSuccessMsg('Venta registrada en efectivo exitosamente.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  // Render Open Shift Panel
  if (!activeShift) {
    return (
      <div className="bg-gym-card rounded-xl border border-slate-800 p-8 shadow-2xl max-w-lg mx-auto relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-neon-green/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-neon-green/5 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="h-16 w-16 bg-neon-green/10 border border-neon-green/30 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-neon-green" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wider">APERTURA DE CAJA</h2>
          <p className="text-slate-400 mt-2 text-sm max-w-sm">
            Para iniciar las ventas del día y registrar transacciones en efectivo, debes abrir la caja registradora.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-neon-green text-sm flex items-center gap-3">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleOpenShift} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Fondo Inicial de Caja (Efectivo)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={initialCash}
                onChange={(e) => setInitialCash(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-3.5 bg-gym-darker border border-slate-700 rounded-lg text-white font-mono text-xl focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-neon-green hover:bg-lime-400 disabled:opacity-60 text-gym-darker font-extrabold uppercase tracking-widest rounded-lg shadow-lg shadow-neon-green/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Procesando...' : (
              <>
                <Unlock className="h-5 w-5" />
                <span>Abrir Caja Registradora</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Render Active Shift POS system
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: Catalog */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-gym-card rounded-xl border border-slate-800 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <ShoppingBag className="text-neon-green h-5 w-5" />
                Catálogo de Productos
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Haz clic en un producto para añadirlo al carrito de ventas.
              </p>
            </div>
            <span className="text-xs bg-neon-green/10 text-neon-green border border-neon-green/20 px-3 py-1 rounded-full font-mono font-semibold">
              POS Activo
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-neon-green text-sm flex items-center gap-3">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRODUCTS_CATALOG.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group relative bg-gym-darker hover:bg-slate-800 border border-slate-700/50 hover:border-neon-green/50 p-4 rounded-xl text-left transition-all duration-300 flex flex-col justify-between h-32 cursor-pointer shadow-md"
              >
                <div className="flex justify-between items-start w-full">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                      {product.category}
                    </span>
                    <h3 className="font-extrabold text-white text-base group-hover:text-neon-green transition-colors">
                      {product.name}
                    </h3>
                  </div>
                </div>
                <div className="flex justify-between items-center w-full mt-2">
                  <span className="text-neon-green font-mono font-bold text-lg">
                    ${product.price.toFixed(2)}
                  </span>
                  <div className="h-8 w-8 bg-neon-green/10 border border-neon-green/20 group-hover:bg-neon-green group-hover:text-gym-darker rounded-lg flex items-center justify-center transition-all duration-300 text-neon-green">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sales List within active shift */}
        <div className="bg-gym-card rounded-xl border border-slate-800 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="text-slate-400 h-5 w-5" />
            Ventas Recientes del Turno
          </h3>
          {activeShift.sales.length === 0 ? (
            <div className="text-center py-6 text-slate-500 border border-dashed border-slate-800 rounded-xl text-sm">
              No se han registrado ventas en este turno.
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {[...activeShift.sales].reverse().map((sale, index) => (
                <div 
                  key={sale._id || index}
                  className="bg-gym-darker/60 border border-slate-800/80 p-3.5 rounded-lg flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400 font-mono">
                      {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {sale.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}
                    </div>
                  </div>
                  <div className="text-neon-green font-mono font-extrabold text-base">
                    +${sale.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Shopping Cart & Drawer Status */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Drawer Status Panel */}
        <div className="bg-gym-card rounded-xl border border-slate-800 p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 h-2 bg-neon-green w-24"></div>
          
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-neon-green h-5 w-5" />
            Estado de la Caja
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gym-darker p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                Fondo Inicial
              </span>
              <span className="text-white font-mono font-extrabold text-lg">
                ${activeShift.initialCash.toFixed(2)}
              </span>
            </div>
            <div className="bg-gym-darker p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                Ventas de Turno
              </span>
              <span className="text-neon-green font-mono font-extrabold text-lg">
                +${activeShift.totalSales.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-gym-darker/60 border border-slate-800 p-4 rounded-xl mb-6 flex justify-between items-center">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block mb-0.5">
                Total en Caja
              </span>
              <span className="text-2xl font-black text-white font-mono">
                ${(activeShift.initialCash + activeShift.totalSales).toFixed(2)}
              </span>
            </div>
            <div className="h-10 w-10 bg-neon-green/10 rounded-full flex items-center justify-center text-neon-green">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          <button
            onClick={handleCloseShift}
            disabled={loading}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500 text-red-400 font-extrabold uppercase tracking-wider text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="h-4 w-4" />
            <span>Cerrar Turno y Arquear Caja</span>
          </button>
        </div>

        {/* Shopping Cart */}
        <div className="bg-gym-card rounded-xl border border-slate-800 p-6 shadow-lg flex flex-col min-h-[350px]">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="text-neon-green h-5 w-5" />
            Carrito de Ventas
          </h2>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="h-12 w-12 bg-slate-800/40 rounded-full flex items-center justify-center mb-3">
                <ShoppingBag className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm text-slate-500 max-w-[200px]">
                Tu carrito de ventas está vacío. Agrega productos.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div 
                    key={item.id}
                    className="flex justify-between items-center bg-gym-darker p-3 rounded-lg border border-slate-800"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <span className="text-xs text-slate-400 font-mono">
                        ${item.price.toFixed(2)} c/u
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-700 rounded-md bg-gym-darker/80 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-bold text-white font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Subtotal & Action */}
              <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-400">Total Venta</span>
                  <span className="text-2xl font-black text-neon-green font-mono">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-4 bg-neon-green hover:bg-lime-400 disabled:opacity-60 text-gym-darker font-extrabold uppercase tracking-wider text-sm rounded-lg shadow-lg shadow-neon-green/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DollarSign className="h-5 w-5" />
                  <span>Cobrar en Efectivo</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default POSSystem;
