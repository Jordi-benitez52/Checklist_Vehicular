// ============================================================
// CHECKLIST TRACTO - MODELO DE DATOS
// ============================================================

export type SeccionStatus = 'pendiente' | 'completo' | 'observacion' | 'falla';
export type EstatusGeneral = 'aprobado' | 'rechazado' | 'condicionado';
export type EstadoItem = 'bueno' | 'regular' | 'malo' | 'na';
export type NivelEnum = 'maximo' | 'media' | 'minimo';
export type PosicionLlanta = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

// ============================================================
// SECCIONES DEL FORMULARIO
// ============================================================

export interface SeccionState {
  status: SeccionStatus;
  expanded: boolean;
  titulo: string;
  icono: string;
  resumen: string;
}

export interface DatosGenerales {
  empresa: string;
  tipo_vehiculo: string;
  modelo: string;
  marca: string;
  anio: number | null;
  kilometraje: number | null;
  odometro: number | null;
  placa: string;
  fecha: string;
  hora: string;
  guardia_id: number;
  turno_id: number;
  // Precargados del registro
  vehiculo_id?: number;
  conductor_id?: number;
  registro_acceso_id?: number;
}

export interface DatosConductor {
  nombre: string;
  licencia: string;
  empresa: string;
  telefono: string;
  observaciones: string;
}

export interface AccesorioItem {
  contiene: boolean;
  estado: EstadoItem;
  observacion: string;
}

export interface ItemLuz {
  estado: EstadoItem;
  observacion: string;
}

export interface ItemEspejo {
  estado: EstadoItem;
  observacion: string;
}

export interface ItemVentana {
  estado: EstadoItem;
  observacion: string;
}

export interface MotorFluidos {
  // Aceite
  aceite_nivel: NivelEnum | null;
  aceite_relleno: boolean;
  aceite_fugas: boolean;
  aceite_deterioro: boolean;
  aceite_observaciones: string;
  // Enfriamiento
  enfriamiento_frio: boolean;
  enfriamiento_nivel: NivelEnum | null;
  enfriamiento_relleno: boolean;
  enfriamiento_cantidad: string;
  enfriamiento_fugas: boolean;
  enfriamiento_observaciones: string;
}

export interface SistemaFrenos {
  freno_estacionamiento: boolean;
  freno_servicio: boolean;
  freno_nivel: NivelEnum | null;
  freno_relleno: boolean;
  freno_observaciones: string;
}

export interface Lodera {
  estado: 'bueno' | 'malo' | 'roto' | 'otro' | null;
  observaciones: string;
}

export interface SistemaCombustible {
  filtro_filtraciones: boolean;
  otras_filtraciones: boolean;
  observaciones: string;
}

export interface LlantaItem {
  mes: string;
  anio: number | null;
  estado: 'bueno' | 'desgaste' | 'malo' | 'na';
  psi: number | null;
  observaciones: string;
}

export interface EvidenciaItem {
  id?: number;
  seccion: string;
  descripcion: string;
  archivo: File | string; // File para nuevo, string (URL) para existente
  esNueva: boolean;
}

export interface FirmasSeccion {
  firma_operador: string; // base64
  nombre_operador: string;
  firma_vigilante: string;
  nombre_vigilante: string;
  firma_supervisor: string;
  nombre_supervisor: string;
}

// ============================================================
// FORMULARIO COMPLETO
// ============================================================

export interface ChecklistTractoForm {
  // Acordeón 1: Datos Generales
  datosGenerales: DatosGenerales;

  // Acordeón 2: Datos Conductor
  datosConductor: DatosConductor;

  // Acordeón 3: Sistemas/Accesorios (33 items)
  accesorios: { [key: number]: AccesorioItem };

  // Acordeón 4: Luces/Espejos/Ventanas
  luces: { [key: string]: ItemLuz };
  espejos: { [key: string]: ItemEspejo };
  ventanas: { [key: string]: ItemVentana };

  // Acordeón 5: Motor/Fluidos
  motorFluidos: MotorFluidos;

  // Acordeón 6: Frenos
  frenos: SistemaFrenos;

  // Acordeón 7: Loderas
  loderas: {
    num_loderas: number;
    izquierda: Lodera;
    derecha: Lodera;
  };

  // Acordeón 8: Combustible
  combustible: SistemaCombustible;

  // Acordeón 9: Llantas (8 posiciones)
  llantas: { [key in PosicionLlanta]: LlantaItem };

  // Acordeón 10: Evidencias
  evidencias: EvidenciaItem[];

  // Acordeón 11: Observaciones
  observaciones_generales: string;
  advertencias_sistema: string[];

  // Acordeón 12: Firmas
  firmas: FirmasSeccion;

  // Acordeón 13: Resultado
  estatus_general: EstatusGeneral | null;
  resultado_justificacion: string;
}

// ============================================================
// DATOS DE CATÁLOGO (DEL BACKEND)
// ============================================================

export interface CatalogoItem {
  id: number;
  nombre: string;
  seccion: string;
  seccion_display: string;
  tipo_respuesta: string;
  tipo_respuesta_display: string;
  orden: number;
}

export interface CatalogoResponse {
  items: CatalogoItem[];
  secciones: string[];
}

// ============================================================
// RESPUESTA PARA API
// ============================================================

export interface ResultadoItem {
  item: number;
  valor: string;
  observacion: string;
}

export interface LlantaItemApi {
  posicion: string;
  estado: string;
  mes: string;
  anio: number;
  psi: number;
  observacion: string;
}

export interface ChecklistSubmitData {
  registro_acceso: number;
  estatus_general: EstatusGeneral;
  observaciones_generales: string;
  firma_operador_data: string;
  firma_vigilante_data: string;
  firma_supervisor_data: string;
  nombre_operador: string;
  nombre_vigilante: string;
  nombre_supervisor: string;
  resultados: ResultadoItem[];
  llamadas: LlantaItemApi[];
}

// ============================================================
// CONSTANTES
// ============================================================

export const POSICIONES_LLANTAS: { posicion: PosicionLlanta; label: string }[] = [
  { posicion: '1', label: 'Delantera izquierda' },
  { posicion: '2', label: 'Delantera derecha' },
  { posicion: '3', label: 'Trasera ext. izq.' },
  { posicion: '4', label: 'Trasera ext. der.' },
  { posicion: '5', label: 'Trasera int. izq.' },
  { posicion: '6', label: 'Trasera int. der.' },
  { posicion: '7', label: 'Remolque 1' },
  { posicion: '8', label: 'Remolque 2' },
];

export const LUCES_ITEMS = [
  { id: 'intermitente_izq', label: 'Intermitente izquierdo' },
  { id: 'intermitente_der', label: 'Intermitente derecho' },
  { id: 'luces_bajas', label: 'Luces bajas' },
  { id: 'luces_altas', label: 'Luces altas' },
  { id: 'frenos', label: 'Luces de freno' },
  { id: 'retroceso', label: 'Luz de retroceso' },
  { id: 'micas', label: 'Micas' },
  { id: 'estacionamiento', label: 'Luces de estacionamiento' },
];

export const ESPEJOS_ITEMS = [
  { id: 'lateral_izq', label: 'Lateral izquierdo' },
  { id: 'lateral_der', label: 'Lateral derecho' },
  { id: 'concavos', label: 'Cóncavos' },
  { id: 'banqueteros', label: 'Banqueteros' },
];

export const VENTANAS_ITEMS = [
  { id: 'alzavidrios_izq', label: 'Alzavidrios izquierdo' },
  { id: 'alzavidrios_der', label: 'Alzavidrios derecho' },
  { id: 'parabrisas', label: 'Parabrisas' },
  { id: 'chapas', label: 'Chapas' },
];

export const ACCESORIOS_ITEMS = [
  'Asientos', 'Bocina', 'Botiquín', 'Alicate', 'Desarmador plano',
  'Desarmador estrella', 'Llaves 5/16-3/4', 'Perica', 'Martillo',
  'Pinza', 'Calefacción', 'Cuñas', 'Dirección', 'Extintor',
  'Keno', 'Gata', 'Instrumentos de tablero', 'Lavaparabrisas',
  'Llave de rueda', 'Luces de trocha', 'Rueda de repuesto',
  'Triángulos reflectantes', 'Visera parasol', 'Logos', 'Conos', 'Matraca'
];

export const SECCIONES_EVIDENCIA = [
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'luces', label: 'Luces' },
  { value: 'motor', label: 'Motor' },
  { value: 'frenos', label: 'Frenos' },
  { value: 'llantas', label: 'Llantas' },
  { value: 'general', label: 'General' },
];

export const COLOR_BADGES = {
  pendiente: '#9ca3af',
  completo: '#10b981',
  observacion: '#f59e0b',
  falla: '#ef4444',
};