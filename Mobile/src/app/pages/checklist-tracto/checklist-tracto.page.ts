import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-checklist-tracto',
  templateUrl: './checklist-tracto.page.html',
  styleUrls: ['./checklist-tracto.page.scss'],
  standalone: false,
})
export class ChecklistTractoPage implements OnInit, AfterViewInit {
  @ViewChild('canvasOperador') canvasOperador!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasVigilante') canvasVigilante!: ElementRef<HTMLCanvasElement>;

  user: any = null;
  turnoActual: any = null;
  registrosPendientes: any[] = [];
  catalogoItems: any[] = [];
  statsChecklist = 0;

  registroAccesoId: string = '';
  estatusGeneral: string = 'aprobado';
  observacionesGenerales: string = '';

  resultados: { [key: number]: { valor: string; observacion: string } } = {};
  tires: { [key: string]: { estado: string; observacion: string } } = {};

  evidencias: File[] = [];

  ctxOperador: CanvasRenderingContext2D | null = null;
  ctxVigilante: CanvasRenderingContext2D | null = null;
  drawingOperador = false;
  drawingVigilante = false;

  seccionActiva: string = 'datos';
  gruposAbiertos: { [key: string]: boolean } = {};

  tiresPositions = [
    { key: 'delantera_izquierda', label: 'Delantera Izq.' },
    { key: 'delantera_derecha', label: 'Delantera Der.' },
    { key: 'trasera_exterior_izquierda', label: 'Trasera Ext. Izq.' },
    { key: 'trasera_interior_izquierda', label: 'Trasera Int. Izq.' },
    { key: 'trasera_interior_derecha', label: 'Trasera Int. Der.' },
    { key: 'trasera_exterior_derecha', label: 'Trasera Ext. Der.' },
    { key: 'remolque_1_izquierda', label: 'Remolque 1 Izq.' },
    { key: 'remolque_1_derecha', label: 'Remolque 1 Der.' },
    { key: 'remolque_2_izquierda', label: 'Remolque 2 Izq.' },
    { key: 'remolque_2_derecha', label: 'Remolque 2 Der.' },
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.cargarDatos();

    for (const ll of this.tiresPositions) {
      this.tires[ll.key] = {
        estado: '',
        observacion: ''
      };
    }
  }

  ionViewWillEnter(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCanvas('operador');
      this.initCanvas('vigilante');
    }, 400);
  }

  async cargarDatos(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Cargando checklist...'
    });
    await loading.present();

    try {
      await this.cargarTurnoActual();
      await Promise.all([
        this.cargarCatalogoItems(),
        this.cargarRegistrosPendientes(),
        this.cargarStatsChecklist()
      ]);
    } finally {
      await loading.dismiss();
    }
  }

  cargarTurnoActual(): Promise<void> {
    return new Promise((resolve) => {
      const guardiaId = this.user?.id;

      this.apiService.getTurnos(true, guardiaId).subscribe({
        next: (turnos) => {
          this.turnoActual = turnos && turnos.length > 0 ? turnos[0] : null;
          resolve();
        },
        error: () => {
          this.turnoActual = null;
          resolve();
        }
      });
    });
  }

  cargarCatalogoItems(): Promise<void> {
    return new Promise((resolve) => {
      this.apiService.getChecklistTractoCatalogo().subscribe({
        next: (data) => {
          this.catalogoItems = data || [];
          for (const item of this.catalogoItems) {
            this.resultados[item.id] = { valor: '', observacion: '' };
          }
          resolve();
        },
        error: () => {
          this.catalogoItems = [];
          resolve();
        }
      });
    });
  }

  cargarRegistrosPendientes(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.turnoActual?.id) {
        this.registrosPendientes = [];
        resolve();
        return;
      }

      this.apiService.getRegistrosAcceso({ turno: this.turnoActual.id }).subscribe({
        next: (data) => {
          this.registrosPendientes = (data || []).filter((r: any) =>
            r.tipo_entidad === 'tracto' &&
            r.checklist_requerido === true &&
            r.checklist_realizado === false
          );
          resolve();
        },
        error: () => {
          this.registrosPendientes = [];
          resolve();
        }
      });
    });
  }

  cargarStatsChecklist(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.turnoActual?.id) {
        this.statsChecklist = 0;
        resolve();
        return;
      }

      this.apiService.getChecklistsTracto({ turno: this.turnoActual.id }).subscribe({
        next: (data) => {
          this.statsChecklist = (data || []).length;
          resolve();
        },
        error: () => {
          this.statsChecklist = 0;
          resolve();
        }
      });
    });
  }

  getSeccionesAgrupadas(): any[] {
    const grupos: { [key: string]: any[] } = {};
    for (const item of this.catalogoItems) {
      const key = item.seccion;
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(item);
    }

    return Object.keys(grupos).map(key => ({
      seccion: key,
      items: grupos[key]
    }));
  }

  countLlantasCompletadas(): number {
    return this.tiresPositions.filter(ll => this.tires[ll.key]?.estado).length;
  }

  getBadgeColor(estado: string): string {
    switch (estado) {
      case 'ok': return 'success';
      case 'regular': return 'warning';
      case 'mal': return 'danger';
      default: return 'medium';
    }
  }

  getBadgeLabel(estado: string): string {
    switch (estado) {
      case 'ok': return 'OK';
      case 'regular': return 'Reg.';
      case 'mal': return 'Falla';
      default: return 'N/A';
    }
  }

  onEvidenciasSelected(event: any): void {
    const files = event?.target?.files;
    this.evidencias = files ? Array.from(files) : [];
  }

  initCanvas(tipo: 'operador' | 'vigilante'): void {
    const canvasRef = tipo === 'operador' ? this.canvasOperador : this.canvasVigilante;
    if (!canvasRef) return;

    const canvas = canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width || 320;
    canvas.height = 180;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    if (tipo === 'operador') this.ctxOperador = ctx;
    else this.ctxVigilante = ctx;
  }

  getCoords(event: any, canvas: HTMLCanvasElement): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches?.[0] || event.changedTouches?.[0];

    if (touch) {
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }

    return { x: event.offsetX, y: event.offsetY };
  }

  startDraw(event: any, tipo: 'operador' | 'vigilante'): void {
    const canvas = tipo === 'operador'
      ? this.canvasOperador?.nativeElement
      : this.canvasVigilante?.nativeElement;

    const ctx = tipo === 'operador' ? this.ctxOperador : this.ctxVigilante;
    if (!canvas || !ctx) return;

    const { x, y } = this.getCoords(event, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tipo === 'operador') this.drawingOperador = true;
    else this.drawingVigilante = true;
  }

  draw(event: any, tipo: 'operador' | 'vigilante'): void {
    const canvas = tipo === 'operador'
      ? this.canvasOperador?.nativeElement
      : this.canvasVigilante?.nativeElement;

    const ctx = tipo === 'operador' ? this.ctxOperador : this.ctxVigilante;
    const drawing = tipo === 'operador' ? this.drawingOperador : this.drawingVigilante;

    if (!canvas || !ctx || !drawing) return;

    const { x, y } = this.getCoords(event, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  stopDraw(tipo: 'operador' | 'vigilante'): void {
    if (tipo === 'operador') this.drawingOperador = false;
    else this.drawingVigilante = false;
  }

  clearFirma(tipo: 'operador' | 'vigilante'): void {
    this.limpiarFirma(tipo);
  }

  limpiarFirma(tipo: 'operador' | 'vigilante'): void {
    const canvas = tipo === 'operador'
      ? this.canvasOperador?.nativeElement
      : this.canvasVigilante?.nativeElement;

    const ctx = tipo === 'operador' ? this.ctxOperador : this.ctxVigilante;

    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  obtenerFirmaBase64(tipo: 'operador' | 'vigilante'): string {
    const canvas = tipo === 'operador'
      ? this.canvasOperador?.nativeElement
      : this.canvasVigilante?.nativeElement;

    if (!canvas) return '';
    return canvas.toDataURL('image/png');
  }

  onSeccionChange(event: any): void {
    this.seccionActiva = event.detail.value;
  }

  irASiguienteSeccion(seccionActual: string): void {
    const orden: string[] = ['datos', 'checklist', 'llantas', 'firmas'];
    const idx = orden.indexOf(seccionActual);
    if (idx >= 0 && idx < orden.length - 1) {
      this.seccionActiva = orden[idx + 1];
    }
  }

  isDatosCompleto(): boolean {
    return !!this.registroAccesoId && !!this.estatusGeneral;
  }

  getDatosCompletadas(): number {
    let count = 0;
    if (this.registroAccesoId) count++;
    if (this.estatusGeneral) count++;
    return count;
  }

  isItemsCompleto(): boolean {
    return this.getItemsCompletados() === this.catalogoItems.length;
  }

  getItemsCompletados(): number {
    return this.catalogoItems.filter(item => this.resultados[item.id]?.valor).length;
  }

  isGrupoCompleto(seccion: string): boolean {
    const grupo = this.getSeccionesAgrupadas().find(g => g.seccion === seccion);
    if (!grupo) return false;
    return grupo.items.every(item => this.resultados[item.id]?.valor);
  }

  getGrupoCompletadas(seccion: string): number {
    const grupo = this.getSeccionesAgrupadas().find(g => g.seccion === seccion);
    if (!grupo) return 0;
    return grupo.items.filter(item => this.resultados[item.id]?.valor).length;
  }

  toggleGrupo(seccion: string): void {
    this.gruposAbiertos[seccion] = !this.gruposAbiertos[seccion];
  }

  isGrupoAbierto(seccion: string): boolean {
    return this.gruposAbiertos[seccion] === true;
  }

  onItemChange(): void {
  }

  getValorBadgeColor(valor: string): string {
    switch (valor) {
      case 'ok': return 'success';
      case 'mal': return 'danger';
      case 'na': return 'medium';
      default: return 'medium';
    }
  }

  getValorLabel(valor: string): string {
    switch (valor) {
      case 'ok': return 'OK';
      case 'mal': return 'Falla';
      case 'na': return 'N/A';
      default: return '';
    }
  }

  hasFirmaOperador(): boolean {
    const firma = this.obtenerFirmaBase64('operador');
    return firma && firma.length > 100;
  }

  hasFirmaVigilante(): boolean {
    const firma = this.obtenerFirmaBase64('vigilante');
    return firma && firma.length > 100;
  }

  isFirmasCompleto(): boolean {
    return this.hasFirmaOperador() && this.hasFirmaVigilante();
  }

  getFirmasCompletadas(): number {
    let count = 0;
    if (this.hasFirmaOperador()) count++;
    if (this.hasFirmaVigilante()) count++;
    return count;
  }

  isFormComplete(): boolean {
    return this.isDatosCompleto() &&
           this.isItemsCompleto() &&
           this.countLlantasCompletadas() === this.tiresPositions.length &&
           this.isFirmasCompleto();
  }

  getProgresoTexto(): string {
    const totalSecciones = 4;
    let completadas = 0;
    if (this.isDatosCompleto()) completadas++;
    if (this.isItemsCompleto()) completadas++;
    if (this.countLlantasCompletadas() === this.tiresPositions.length) completadas++;
    if (this.isFirmasCompleto()) completadas++;

    return `${completadas} de ${totalSecciones} secciones completas`;
  }

  getPendientesTexto(): string {
    const errores = this.getErroresValidacion();
    if (errores.length === 0) return 'Formulario completo, listo para guardar';
    return errores.length + ' campo(s) pendiente(s)';
  }

  getErroresValidacion(): string[] {
    const errores: string[] = [];

    if (!this.registroAccesoId) {
      errores.push('Seleccionar registro de acceso');
    }
    if (!this.estatusGeneral) {
      errores.push('Seleccionar estatus general');
    }

    const itemsSinValor = this.catalogoItems.filter(item => !this.resultados[item.id]?.valor);
    if (itemsSinValor.length > 0) {
      errores.push(`${itemsSinValor.length} item(s) de checklist sin revisar`);
    }

    const llantasSinEstado = this.tiresPositions.filter(ll => !this.tires[ll.key]?.estado);
    if (llantasSinEstado.length > 0) {
      errores.push(`${llantasSinEstado.length} llanta(s) sin revisar`);
    }

    if (!this.hasFirmaOperador()) {
      errores.push('Firma del operador pendiente');
    }
    if (!this.hasFirmaVigilante()) {
      errores.push('Firma del vigilante pendiente');
    }

    return errores;
  }

  async guardarChecklist(): Promise<void> {
    if (!this.turnoActual?.id) {
      await this.alerta('Error', 'No tienes turno abierto.');
      return;
    }

    if (!this.registroAccesoId) {
      await this.alerta('Error', 'Debes seleccionar un registro de acceso.');
      return;
    }

    const firmaOperador = this.obtenerFirmaBase64('operador');
    const firmaVigilante = this.obtenerFirmaBase64('vigilante');

    if (!firmaOperador || firmaOperador.length < 100) {
      await this.alerta('Error', 'Debes capturar la firma del operador.');
      return;
    }

    if (!firmaVigilante || firmaVigilante.length < 100) {
      await this.alerta('Error', 'Debes capturar la firma del vigilante.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando checklist...'
    });
    await loading.present();

    const resultadosPayload = this.catalogoItems
      .filter(item => this.resultados[item.id]?.valor)
      .map(item => ({
        item: item.id,
        valor: this.resultados[item.id].valor,
        observacion: this.resultados[item.id].observacion || ''
      }));

    const tiresPayload = this.tiresPositions
      .filter(ll => this.tires[ll.key]?.estado)
      .map(ll => ({
        posicion: ll.key,
        estado: this.tires[ll.key].estado,
        observacion: this.tires[ll.key].observacion || ''
      }));

    const formData = new FormData();
    formData.append('registro_acceso', this.registroAccesoId);
    formData.append('estatus_general', this.estatusGeneral);
    formData.append('observaciones_generales', this.observacionesGenerales);
    formData.append('firma_operador_data', firmaOperador);
    formData.append('firma_vigilante_data', firmaVigilante);
    formData.append('resultados', JSON.stringify(resultadosPayload));
    formData.append('llantas', JSON.stringify(tiresPayload));

    for (const file of this.evidencias) {
      formData.append('evidencias', file);
    }

    this.apiService.crearChecklistTracto(formData).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.alerta('Éxito', 'Checklist de tractocamión guardado correctamente.');
        this.resetFormulario();
        await this.cargarRegistrosPendientes();
        await this.cargarStatsChecklist();
      },
      error: async (error) => {
        await loading.dismiss();
        await this.alerta('Error', this.obtenerError(error));
      }
    });
  }

  resetFormulario(): void {
    this.registroAccesoId = '';
    this.estatusGeneral = 'aprobado';
    this.observacionesGenerales = '';
    this.evidencias = [];
    this.seccionActiva = 'datos';
    this.gruposAbiertos = {};

    for (const item of this.catalogoItems) {
      this.resultados[item.id] = { valor: '', observacion: '' };
    }

    this.tires = {};
    for (const ll of this.tiresPositions) {
      this.tires[ll.key] = { estado: '', observacion: '' };
    }
    this.limpiarFirma('operador');
    this.limpiarFirma('vigilante');
  }

  obtenerError(error: any): string {
    if (error?.error?.error) return error.error.error;

    if (typeof error?.error === 'object') {
      const firstKey = Object.keys(error.error)[0];
      if (firstKey && Array.isArray(error.error[firstKey])) return error.error[firstKey][0];
      if (firstKey && typeof error.error[firstKey] === 'string') return error.error[firstKey];
    }

    return 'No se pudo guardar el checklist.';
  }

  async alerta(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}