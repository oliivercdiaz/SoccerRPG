import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [jugador, setJugador] = useState<any>(null);
  const [mensaje, setMensaje] = useState("Bienvenido al vestuario.");
  const [animacion, setAnimacion] = useState(false);

  // Esta URL genera una cara única basada en el nombre del jugador
  // Usamos el estilo 'avataaars' que es muy cartoon/gracioso
  const avatarUrl = jugador ? `https://api.dicebear.com/9.x/avataaars/svg?seed=${jugador.nombre}&backgroundColor=b6e3f4` : '';

  const entrenar = async () => {
    setAnimacion(true); // Activa efecto visual
    try {
      const respuesta = await axios.get('http://localhost:3000/entrenar');
      setJugador(respuesta.data.estado);
      setMensaje(respuesta.data.mensaje);
    } catch (error) {
      setMensaje("❌ Error: El servidor no responde.");
    }
    setTimeout(() => setAnimacion(false), 500); // Quita efecto a los 0.5s
  };

  useEffect(() => {
    entrenar();
  }, []);

  if (!jugador) return <div style={{color:'white', padding:'50px'}}>Cargando vestuario...</div>;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a1a2e', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      
      {/* --- TARJETA DEL JUGADOR --- */}
      <div style={{ 
        backgroundColor: '#16213e', 
        border: '4px solid #0f3460', 
        borderRadius: '20px', 
        padding: '30px', 
        width: '350px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        transform: animacion ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.1s'
      }}>
        
        {/* AVATAR */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              border: '4px solid #e94560',
              backgroundColor: '#fff'
            }} 
          />
        </div>

        <h1 style={{ color: 'white', textAlign: 'center', margin: '0 0 5px 0' }}>{jugador.nombre}</h1>
        <div style={{ color: '#888', textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>
          NIVEL {jugador.nivel} • PRINCIPIANTE
        </div>

        {/* ESTADÍSTICAS */}
        <div style={{ backgroundColor: '#0f3460', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
          
          {/* FUERZA */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e94560', fontWeight: 'bold' }}>
              <span>💪 FUERZA</span>
              <span>{jugador.fuerza}</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#1a1a2e', borderRadius: '4px', marginTop: '5px' }}>
              <div style={{ 
                width: `${Math.min(jugador.fuerza, 100)}%`, 
                height: '100%', 
                backgroundColor: '#e94560', 
                borderRadius: '4px',
                transition: 'width 0.5s'
              }}></div>
            </div>
          </div>

          {/* ENERGÍA */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4cc9f0', fontWeight: 'bold' }}>
              <span>⚡ ENERGÍA</span>
              <span>{jugador.energia} / 100</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#1a1a2e', borderRadius: '4px', marginTop: '5px' }}>
              <div style={{ 
                width: `${jugador.energia}%`, 
                height: '100%', 
                backgroundColor: '#4cc9f0', 
                borderRadius: '4px',
                transition: 'width 0.5s'
              }}></div>
            </div>
          </div>

        </div>

        {/* MENSAJE DE ACCIÓN */}
        <p style={{ 
          color: '#ffd700', 
          textAlign: 'center', 
          fontStyle: 'italic', 
          height: '40px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          "{mensaje}"
        </p>

        {/* BOTÓN GRANDE */}
        <button 
          onClick={entrenar}
          disabled={jugador.energia < 10}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: jugador.energia < 10 ? '#555' : '#e94560',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: jugador.energia < 10 ? 'not-allowed' : 'pointer',
            marginTop: '10px',
            boxShadow: '0 4px 0 #a62639',
            transition: 'all 0.1s'
          }}
        >
          {jugador.energia < 10 ? '💤 DESCANSAR (NO FUNCIONA)' : '🏋️ ENTRENAR (+10 XP)'}
        </button>

      </div>
    </div>
  );
}

export default App;