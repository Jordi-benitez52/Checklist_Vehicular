import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardData {
  total_registros: number;
  total_turnos_abiertos: number;
  total_vehiculos: number;
  total_checklists_tracto: number;
  chart_labels: string[];
  entradas: number[];
  salidas: number[];
  tipos_labels: string[];
  tipos_data: number[];
  estatus_labels: string[];
  estatus_data: number[];
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimeout: any = null;
  private isConnected = false;

  private dashboardDataSubject = new BehaviorSubject<DashboardData | null>(null);
  dashboardData$ = this.dashboardDataSubject.asObservable();

  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  connectionStatus$ = this.connectionStatusSubject.asObservable();

  private wsUrl: string;

  constructor() {
    this.wsUrl = environment.wsUrl;
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.connectionStatusSubject.next(true);
        this.requestUpdate();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'initial_data' || data.type === 'dashboard_update') {
            this.dashboardDataSubject.next(data.data);
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      this.socket.onerror = () => {
        this.connectionStatusSubject.next(false);
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.connectionStatusSubject.next(false);
        this.scheduleReconnect();
      };

    } catch (e) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.connectionStatusSubject.next(false);
  }

  requestUpdate(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'request_update' }));
    }
  }

  isConnectedToWebSocket(): boolean {
    return this.isConnected;
  }
}