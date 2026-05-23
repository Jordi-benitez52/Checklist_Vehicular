export const environment = {
  production: true,
  // ================================================================
  // CONFIGURACIÓN DE PRODUCCIÓN
  // ================================================================
  // IMPORTANTE: Antes de compilar para producción, actualiza la URL
  // con la URL del servidor donde esté desplegado el backend.
  //
  // ¿Cómo saber la IP del servidor?
  //   - Windows: ipconfig (busca "Dirección IPv4")
  //   - Linux/Mac: hostname -I
  //
  // Ejemplos:
  //   - apiUrl: 'http://192.168.1.100:8000/api/platform'
  //   - wsUrl: 'ws://192.168.1.100:8000/ws/dashboard/'
  // ================================================================
  apiUrl: 'http://localhost:8000/api/platform',
  wsUrl: 'ws://localhost:8000/ws/dashboard/'
};