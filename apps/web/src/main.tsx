import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return <main><h1>Web Attendance</h1><p>Sistem absensi berbasis foto, waktu server, dan lokasi perangkat.</p><p>Fondasi aplikasi berhasil dimuat.</p></main>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
