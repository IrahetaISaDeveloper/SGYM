import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, Wrench, Settings2, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

const MachineManagement = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMachine, setNewMachine] = useState({
    internalCode: '',
    name: '',
    category: ''
  });

  const fetchMachines = async () => {
    try {
      const response = await api.get('/api/machines');
      setMachines(response.data);
    } catch (err) {
      setError('Error al cargar máquinas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const reportFailure = async (id) => {
    try {
      await api.put(`/api/machines/${id}/report`);
      fetchMachines(); // Refresh list to get updated status
    } catch (err) {
      alert('Error al reportar la falla');
    }
  };

  const submitMachine = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/machines', newMachine);
      setIsModalOpen(false);
      setNewMachine({ internalCode: '', name: '', category: '' });
      fetchMachines();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al agregar la máquina');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-neon-green" />
            Gestión de Máquinas
          </h1>
          <p className="text-slate-400 mt-2">Monitorea el estado del equipamiento del gimnasio</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-neon-green hover:bg-lime-400 text-gym-darker font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Agregar Máquina</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando máquinas...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 bg-red-500/10 rounded-xl border border-red-500/30">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {machines.map((machine) => (
            <div key={machine._id} className="bg-gym-card rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col hover:border-slate-700 transition-colors">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">
                    {machine.internalCode}
                  </span>
                  
                  {machine.status?.toLowerCase() === 'operativa' ? (
                    <span className="flex items-center gap-1 text-xs font-medium bg-neon-green/10 text-neon-green border border-neon-green/20 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      Operativa
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="h-3 w-3" />
                      En Mantenimiento
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1">{machine.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{machine.description || 'Equipamiento de gimnasio'}</p>
                
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Activity className="h-4 w-4" />
                  <span>Último mant: {machine.lastMaintenance ? new Date(machine.lastMaintenance).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              
              <div className="p-4 bg-slate-800/30 border-t border-slate-800">
                <button
                  onClick={() => reportFailure(machine._id)}
                  disabled={machine.status?.toLowerCase() !== 'operativa'}
                  className={`w-full flex justify-center items-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    machine.status?.toLowerCase() === 'operativa' 
                      ? 'bg-gym-darker border border-slate-600 text-slate-300 hover:text-red-400 hover:border-red-400 hover:bg-red-400/10'
                      : 'bg-gym-darker border border-slate-700 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Wrench className="h-4 w-4" />
                  {machine.status?.toLowerCase() === 'operativa' ? 'Reportar Falla' : 'En Reparación'}
                </button>
              </div>
            </div>
          ))}
          
          {machines.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 bg-gym-card rounded-xl border border-slate-800">
              No hay máquinas registradas en el sistema.
            </div>
          )}
        </div>
      )}

      {/* Add Machine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gym-card rounded-xl p-6 border border-slate-800 shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-6">Agregar Nueva Máquina</h3>
            
            <form onSubmit={submitMachine} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Código Interno</label>
                <input
                  type="text"
                  value={newMachine.internalCode}
                  onChange={(e) => setNewMachine({...newMachine, internalCode: e.target.value})}
                  required
                  className="w-full px-4 py-2 bg-gym-darker border border-slate-700 rounded-md text-white focus:border-neon-green focus:outline-none"
                  placeholder="Ej: TDM-01"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                  required
                  className="w-full px-4 py-2 bg-gym-darker border border-slate-700 rounded-md text-white focus:border-neon-green focus:outline-none"
                  placeholder="Ej: Caminadora Caminadora Pro"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Categoría</label>
                <select
                  value={newMachine.category}
                  onChange={(e) => setNewMachine({...newMachine, category: e.target.value})}
                  required
                  className="w-full px-4 py-2 bg-gym-darker border border-slate-700 rounded-md text-white focus:border-neon-green focus:outline-none"
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Fuerza">Fuerza</option>
                  <option value="Peso Libre">Peso Libre</option>
                  <option value="Funcional">Funcional</option>
                </select>
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
                  Guardar Máquina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineManagement;
