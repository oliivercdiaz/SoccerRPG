import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // Aquí guardamos los datos que vienen del servidor
  const [jugador, setJugador] = useState<any>(null);
  const [mensaje, setMensaje] = useState("Bienvenido al Centro de Alto Rendimiento");

  // Función para pedir los datos al servidor
  const entrenar = async () => {
    try {
      // Llamamos a tu servidor (Backend)
      const respuesta = await axios.get('http://localhost:3000/entrenar');
      
      // Actualizamos la pantalla con los nuevos datos
      setJugador(respuesta.data.estado);
      setMensaje(respuesta.data.mensaje);
    
    } catch (error) {
      setMensaje("Error de conexión con el servidor.");
    }
  };

  // Cargar datos iniciales al abrir la web
  useEffect(() => {
    entrenar();
  }, []);

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial', textAlign: 'center', backgroundColor: '#282c34', color: 'white', minHeight: '100vh' }}>
      <h1>⚽ Soccer RPG - Panel de Control</h1>
      
      <div style={{ border: '2px solid #61dafb', padding: '20px', borderRadius: '15px', maxWidth: '400px', margin: '0 auto' }}>
        <h2>Estado del Jugador</h2>
        
        {jugador ? (
          <div style={{ textAlign: 'left', marginLeft: '20%' }}>
            <p>👤 <strong>Nombre:</strong> {jugador.nombre}</p>
            <p>💪 <strong>Fuerza:</strong> <span style={{color: '#61dafb', fontSize: '20px'}}>{jugador.fuerza}</span></p>
            <p>⚡ <strong>Energía:</strong> {jugador.energia} / 100</p>
          </div>
        ) : (
          <p>Cargando datos del servidor...</p>
        )}

        <hr style={{ borderColor: '#555', margin: '20px 0' }} />
        
        <p style={{ color: '#ffd700', fontStyle: 'italic' }}>"{mensaje}"</p>

        <button 
          onClick={entrenar}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#e91e63',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          🏋️ ENTRENAR AHORA
        </button>
      </div>
    </div>
  );
}

export default App;