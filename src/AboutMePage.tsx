import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AboutMePage(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050814',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      padding: '4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Tombol Kembali ke Beranda */}
      <button 
        onClick={() => navigate('/')}
        style={{
          alignSelf: 'flex-start',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(0,188,212,0.3)',
          color: '#00bcd4',
          padding: '0.6rem 1.2rem',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginBottom: '3rem',
          transition: 'all 0.2s'
        }}
      >
        ← Kembali ke Portofolio
      </button>

      <div style={{ maxWidth: '700px', width: '100%' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 900, 
          letterSpacing: '-0.03em',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg,#00bcd4,#76ff03)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          AMBISI & PERJUANGAN
        </h1>

        <div style={{
          background: 'rgba(10,15,30,0.7)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '2rem',
          lineHeight: '1.8',
          color: 'rgba(255,255,255,0.75)',
          fontSize: '1.1rem'
        }}>
          <p style={{ marginBottom: '1.5rem' }}>
            Halo! Saya adalah seorang Full-Stack Developer muda yang saat ini masih duduk di bangku kelas 7 SMP. 
            Bagi saya, usia bukan batasan untuk menguasai teknologi industri seperti <span style={{ color: '#00bcd4' }}>React, TypeScript, dan Tailwind CSS</span>.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Setiap sore, saya melatih fisik dan kecepatan melalui latihan <span style={{ color: '#76ff03' }}>sprint</span>. 
            Filosofi sprint ini juga saya bawa ke dunia koding: mengeksekusi proyek dengan cepat, efisien, dan presisi tinggi.
          </p>
          <p>
            Target besar saya setelah lulus SMK nanti adalah menembus <span style={{ color: '#00bcd4', fontWeight: 'bold' }}>ITB (Institut Teknologi Bandung)</span>, 
            kuliah di sana, dan terus melangkah hingga meraih gelar <span style={{ color: '#76ff03', fontWeight: 'bold' }}>Profesor</span> di bidang teknologi informasi.
          </p>
        </div>
      </div>
    </div>
  );
}