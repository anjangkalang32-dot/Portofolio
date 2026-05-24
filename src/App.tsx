import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VibrantPulse from './VibrantPulse';
import AboutMePage from './AboutMePage'; // Komponen halaman baru yang bakal kita bikin

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Utama Portofolio Kamu */}
        <Route path="/" element={<VibrantPulse />} />
        
        {/* Halaman Baru Khusus "Tentang Saya" */}
        <Route path="/about" element={<AboutMePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;