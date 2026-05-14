export const VALIDATORS = {
  maxLength: (max: number) => (value: string | null | undefined): string | null => {
    if (!value) return null;
    return value.length <= max ? null : `Máximo ${max} caracteres`;
  },

  placa: (v: string | null | undefined): string | null => {
    if (!v) return null;
    const clean = v.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (clean.length < 5) return 'La placa debe tener al menos 5 caracteres';
    return VALIDATORS.maxLength(8)(clean);
  },

  numeroEmpleado: (v: string | null | undefined): string | null => {
    return VALIDATORS.maxLength(8)(v);
  },

  numeroLicencia: (v: string | null | undefined): string | null => {
    return VALIDATORS.maxLength(8)(v);
  },

  telefono: (v: string | null | undefined): string | null => {
    return VALIDATORS.maxLength(10)(v);
  },

  nombre: (v: string | null | undefined): string | null => {
    return VALIDATORS.maxLength(100)(v);
  },

  observaciones: (v: string | null | undefined): string | null => {
    return VALIDATORS.maxLength(200)(v);
  },

  validar: (campo: string, valor: string | null | undefined): string | null => {
    switch (campo) {
      case 'placa': return VALIDATORS.placa(valor);
      case 'numeroEmpleado': return VALIDATORS.numeroEmpleado(valor);
      case 'numeroLicencia': return VALIDATORS.numeroLicencia(valor);
      case 'telefono': return VALIDATORS.telefono(valor);
      case 'nombre': return VALIDATORS.nombre(valor);
      case 'observaciones': return VALIDATORS.observaciones(valor);
      default: return null;
    }
  }
};