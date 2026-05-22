import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;
const VITE_ACCOUNTS_API_URL = import.meta.env.VITE_ACCOUNTS_API_URL;

const API_HOST = window.location.hostname;
const API_PORT = '8000';

const getBaseURL = (path) => {
  if (path === 'accounts') {
    return VITE_ACCOUNTS_API_URL || VITE_API_URL || `http://${API_HOST}:${API_PORT}`;
  }
  return VITE_API_URL || `http://${API_HOST}:${API_PORT}`;
};

const PLATFORM_API_BASE_URL = `${getBaseURL('platform')}/api/platform`;
const ACCOUNTS_API_BASE_URL = `${getBaseURL('accounts')}/api/accounts`;

const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const platformApi = createApiInstance(PLATFORM_API_BASE_URL);
export const accountsApi = createApiInstance(ACCOUNTS_API_BASE_URL);

export const authService = {
  login: (data) =>
    accountsApi.post('/login/', data),
  verifyCode: (tempToken, code) =>
    accountsApi.post('/login/verify-code/', { temp_token: tempToken, code }),
  resendCode: (tempToken) =>
    accountsApi.post('/login/resend-code/', { temp_token: tempToken }),
  requestPasswordReset: (email) =>
    accountsApi.post('/password-reset/', { email }),
  confirmPasswordReset: (code, newPassword) =>
    accountsApi.post('/password-reset/confirm/', { code, new_password: newPassword }),
  verifyGoogleToken: (google_user_id, access_token) =>
    accountsApi.post('/google/callback/', { google_user_id, access_token }),
  logout: () => accountsApi.post('/logout/'),
  getProfile: () => accountsApi.get('/me/'),
  updateProfile: (data) => accountsApi.patch('/me/editar/', data),
};

export const usuariosService = {
  getAll: (params = {}) => accountsApi.get('/usuarios/', { params }),
  getById: (id) => accountsApi.get(`/usuarios/${id}/`),
  create: (data) => accountsApi.post('/usuarios/crear/', data),
  update: (id, data) => accountsApi.put(`/usuarios/${id}/`, data),
  patch: (id, data) => accountsApi.patch(`/usuarios/${id}/`, data),
  delete: (id) => accountsApi.delete(`/usuarios/${id}/`),
};

export const vehiculosService = {
  getAll: (params = {}) => platformApi.get('/vehiculos/', { params }),
  getById: (id) => platformApi.get(`/vehiculos/${id}/`),
  create: (data) => platformApi.post('/vehiculos/crear/', data),
  update: (id, data) => platformApi.put(`/vehiculos/${id}/editar/`, data),
  deactivate: (id) => platformApi.patch(`/vehiculos/${id}/desactivar/`),
};

export const empleadosService = {
  getAll: (params = {}) => platformApi.get('/empleados/', { params }),
  getById: (id) => platformApi.get(`/empleados/${id}/`),
  create: (data) => platformApi.post('/empleados/crear/', data),
  update: (id, data) => platformApi.put(`/empleados/${id}/`, data),
  deactivate: (id) => platformApi.patch(`/empleados/${id}/desactivar/`),
};

export const conductoresService = {
  getAll: (params = {}) => platformApi.get('/conductores/', { params }),
  getById: (id) => platformApi.get(`/conductores/${id}/`),
  create: (data) => platformApi.post('/conductores/crear/', data),
  update: (id, data) => platformApi.put(`/conductores/${id}/editar/`, data),
  deactivate: (id) => platformApi.patch(`/conductores/${id}/desactivar/`),
  getDisponibles: () => platformApi.get('/conductores/disponibles/'),
};

export const turnosService = {
  getAll: (params = {}) => platformApi.get('/turnos/', { params }),
  getById: (id) => platformApi.get(`/turnos/${id}/`),
  create: (data) => platformApi.post('/turnos/crear/', data),
  close: (id, data) => platformApi.patch(`/turnos/${id}/cerrar/`, data),
  getAbierto: () => platformApi.get('/turnos/', { params: { abierto: 'true' } }),
};

export const registrosService = {
  getAll: (params = {}) => platformApi.get('/registros-acceso/', { params }),
  getById: (id) => platformApi.get(`/registros-acceso/${id}/`),
  create: (data) => platformApi.post('/registros-acceso/crear/', data),
  getPendientesSalida: () =>
    platformApi.get('/registros-acceso/pendientes-salida/'),
};

export const checklistsService = {
  getAll: (params = {}) => platformApi.get('/checklists-tracto/', { params }),
  getById: (id) => platformApi.get(`/checklists-tracto/${id}/`),
  create: (data) => platformApi.post('/checklists-tracto/crear/', data),
  getCatalogoItems: () => platformApi.get('/checklists-tracto/catalogo-items/'),
};

export const asignacionesService = {
  getConductorVehiculo: () => platformApi.get('/asignaciones/conductor-vehiculo/'),
  createConductorVehiculo: (data) =>
    platformApi.post('/asignaciones/conductor-vehiculo/crear/', data),
  desasignarConductorVehiculo: (id) =>
    platformApi.patch(`/asignaciones/conductor-vehiculo/desasignar/?id=${id}`),
  getEmpleadoVehiculo: () => platformApi.get('/asignaciones/empleado-vehiculo/'),
  createEmpleadoVehiculo: (data) =>
    platformApi.post('/asignaciones/empleado-vehiculo/crear/', data),
};

export const vehiculosDisponiblesService = {
  getDisponibles: () => platformApi.get('/vehiculos/disponibles/'),
  getEnInstalacion: () => platformApi.get('/vehiculos/en-instalacion/'),
  getDentro: () => platformApi.get('/vehiculos/dentro/'),
};

export const auditoriaService = {
  getAuditoria: (params = {}) => platformApi.get('/auditoria/', { params }),
  getBitacora: (params = {}) => platformApi.get('/bitacora/', { params }),
};

export const visitantesService = {
  getAll: (params = {}) => platformApi.get('/visitantes/', { params }),
  getPendientes: () => platformApi.get('/visitantes/pendientes/'),
};

export const historialService = {
  getHistorial: (params = {}) => platformApi.get('/historial-uso-vehiculo/', { params }),
};

export const notificacionesService = {
  getAll: (params = {}) => platformApi.get('/notificaciones/', { params }),
  markRead: (id) => platformApi.patch(`/notificaciones/${id}/leer/`),
  markAllRead: () => platformApi.patch('/notificaciones/leer-todos/'),
};

export default platformApi;