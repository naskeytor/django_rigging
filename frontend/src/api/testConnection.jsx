export const testBackendConnection = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/test/', { credentials: 'include' });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Conexión exitosa:', data);

  } catch (error) {
    console.error('Error al conectar con el backend:', error);
  }
};