import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta


def get_dashboard_stats():
    from platform_core.models import (
        RegistroAcceso, Turno, Vehiculo, ChecklistTracto
    )

    now = timezone.now()
    seven_days_ago = now - timedelta(days=7)

    total_registros = RegistroAcceso.objects.count()
    total_turnos_abiertos = Turno.objects.filter(abierto=True).count()
    total_vehiculos = Vehiculo.objects.filter(activo=True).count()
    total_checklists_tracto = ChecklistTracto.objects.count()

    daily_data = RegistroAcceso.objects.filter(
        fecha_hora__gte=seven_days_ago
    ).values('fecha_hora__date', 'tipo_movimiento').annotate(
        total=Count('id')
    ).order_by('fecha_hora__date')

    dias = sorted(set(daily_data.values_list('fecha_hora__date', flat=True)))
    labels = [d.strftime('%d/%m') for d in dias]
    entradas = []
    salidas = []
    for d in dias:
        ent = daily_data.filter(fecha_hora__date=d, tipo_movimiento='entrada').first()
        sal = daily_data.filter(fecha_hora__date=d, tipo_movimiento='salida').first()
        entradas.append(ent['total'] if ent else 0)
        salidas.append(sal['total'] if sal else 0)

    tipo_data = RegistroAcceso.objects.values('tipo_entidad').annotate(total=Count('id'))
    tipos_labels = [t['tipo_entidad'] for t in tipo_data]
    tipos_data = [t['total'] for t in tipo_data]

    checklist_data = ChecklistTracto.objects.values('estatus_general').annotate(total=Count('id'))
    estatus_labels = [c['estatus_general'] for c in checklist_data]
    estatus_data = [c['total'] for c in checklist_data]

    return {
        'total_registros': total_registros,
        'total_turnos_abiertos': total_turnos_abiertos,
        'total_vehiculos': total_vehiculos,
        'total_checklists_tracto': total_checklists_tracto,
        'chart_labels': labels,
        'entradas': entradas,
        'salidas': salidas,
        'tipos_labels': tipos_labels,
        'tipos_data': tipos_data,
        'estatus_labels': estatus_labels,
        'estatus_data': estatus_data,
    }


class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'dashboard_updates'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        datos = await self.get_dashboard_data()
        await self.send(text_data=json.dumps({
            'type': 'initial_data',
            'data': datos
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')

        if message_type == 'request_update':
            datos = await self.get_dashboard_data()
            await self.send(text_data=json.dumps({
                'type': 'dashboard_update',
                'data': datos
            }))

    async def dashboard_message(self, event):
        datos = event['data']

        await self.send(text_data=json.dumps({
            'type': 'dashboard_update',
            'data': datos
        }))

    @database_sync_to_async
    def get_dashboard_data(self):
        return get_dashboard_stats()


def broadcast_dashboard_update():
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync

    try:
        channel_layer = get_channel_layer()
        datos = get_dashboard_stats()

        async_to_sync(channel_layer.group_send)(
            'dashboard_updates',
            {
                'type': 'dashboard_message',
                'data': datos
            }
        )
    except Exception:
        pass