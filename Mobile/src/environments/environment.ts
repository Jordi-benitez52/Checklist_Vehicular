export const environment = {
  production: false,
  // ================================================================
  // CONFIGURACIÓN DEL SERVIDOR
  // ================================================================
  // IMPORTANTE: Cambia la URL según el entorno.
  //
  // Entornos:
  //   - Desarrollo local: 'http://localhost:8000/api/platform'
  //   - Railway (production): Actualiza después de desplegar en Railway
  //   - Teléfono en red WiFi: 'http://192.168.0.248:8000/api/platform'
  //
  // ¿Cómo saber la IP del servidor?
  //   - Windows: ipconfig (busca "Dirección IPv4")
  //   - Linux/Mac: hostname -I
  // ================================================================
  apiUrl: 'https://tu-app.railway.app/api/platform'
};