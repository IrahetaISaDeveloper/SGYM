// src/components/QrScanner.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';

const QR_ELEMENT_ID = 'qr-scanner-region';

const QrScanner = ({ onResult, onClose }) => {
  const html5QrCodeRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  // Enumerate cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          setCameras(devices);
          // Prefer back camera
          const back = devices.find(d =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('trasera') ||
            d.label.toLowerCase().includes('environment')
          );
          setSelectedCamera((back || devices[0]).id);
        } else {
          setError('No se encontraron cámaras disponibles.');
        }
      })
      .catch(() => setError('No se pudo acceder a las cámaras. Verifica los permisos.'));
  }, []);

  // Start scanner
  const startScanner = async () => {
    if (!selectedCamera) return;
    setError('');
    setScanning(true);

    const html5QrCode = new Html5Qrcode(QR_ELEMENT_ID);
    html5QrCodeRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // On success — stop scanner and pass result up
          stopScanner();
          onResult(decodedText);
        },
        () => {} // Ignore "no QR found" errors
      );
      setIsStarted(true);
    } catch (err) {
      setError('No se pudo iniciar la cámara. Verifica que no esté en uso.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(() => {});
      html5QrCodeRef.current = null;
    }
    setIsStarted(false);
    setScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gym-card rounded-2xl border border-slate-800 shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-neon-green" />
            <h3 className="text-lg font-bold text-white">Escanear QR</h3>
          </div>
          <button
            onClick={() => { stopScanner(); onClose(); }}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Camera selector */}
          {cameras.length > 1 && (
            <select
              value={selectedCamera || ''}
              onChange={e => { stopScanner(); setSelectedCamera(e.target.value); }}
              className="w-full px-3 py-2 bg-gym-darker border border-slate-700 rounded-md text-white text-sm focus:border-neon-green focus:outline-none"
            >
              {cameras.map(cam => (
                <option key={cam.id} value={cam.id}>{cam.label || `Cámara ${cam.id}`}</option>
              ))}
            </select>
          )}

          {/* Scanner region */}
          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
            <div
              id={QR_ELEMENT_ID}
              className="w-full"
              style={{ minHeight: '250px' }}
            />
            {!isStarted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/90">
                <Camera className="h-14 w-14 text-slate-600" />
                <p className="text-slate-400 text-sm text-center px-4">
                  {error || 'Presiona el botón para activar la cámara'}
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3 border border-red-500/20">
              {error}
            </p>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            {!isStarted ? (
              <button
                onClick={startScanner}
                disabled={!selectedCamera || scanning}
                className="flex-1 flex items-center justify-center gap-2 bg-neon-green hover:bg-lime-400 text-gym-darker font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {scanning
                  ? <><RefreshCw className="h-4 w-4 animate-spin" /> Iniciando...</>
                  : <><Camera className="h-4 w-4" /> Activar Cámara</>
                }
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-medium py-2.5 rounded-lg transition-colors"
              >
                <CameraOff className="h-4 w-4" />
                Detener Cámara
              </button>
            )}
          </div>

          <p className="text-center text-xs text-slate-500">
            Apunta la cámara al código QR del cliente. Se procesará automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QrScanner;
