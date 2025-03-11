import { useEffect } from 'react';
import { testBackendConnection } from './api/testConnection';

function App() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        await testBackendConnection();
      } catch (error) {
        console.error("Error en la conexión:", error);
      }
    };

    // Llamamos la función y retornamos la promesa para evitar la advertencia
    fetchData().catch(console.error);
  }, []);

  return <h1>React conectado a Django 🎉</h1>;
}

export default App;