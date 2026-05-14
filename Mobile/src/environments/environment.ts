export const environment = {
  production: false,
  // ================================================================
  // CONFIGURACIÓN DEL SERVIDOR
  // ================================================================
  // IMPORTANTE: Cambia '127.0.0.1' por la IP del servidor donde esté
  // corriendo el backend Django.
  //
  // Ejemplos:
  //   - Para desarrollo local: 'http://127.0.0.1:8000/api/platform'
  //   - Para servidor en red local: 'http://192.168.1.50:8000/api/platform'
  //   - Para servidor con dominio: 'https://checklist.miempresa.com/api/platform'
  //
  // ¿Cómo saber la IP del servidor?
  //   - Windows: ipconfig (busca "Dirección IPv4")
  //   - Linux/Mac: hostname -I
  // ================================================================
  apiUrl: 'http://localhost:8000/api/platform'
};