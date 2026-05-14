from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import RegistroAcceso, ChecklistTracto, Turno


@receiver(post_save, sender=RegistroAcceso)
def on_registro_saved(sender, instance, created, **kwargs):
    from .consumers import broadcast_dashboard_update
    broadcast_dashboard_update()


@receiver(post_save, sender=ChecklistTracto)
def on_checklist_saved(sender, instance, created, **kwargs):
    from .consumers import broadcast_dashboard_update
    broadcast_dashboard_update()


@receiver(post_save, sender=Turno)
def on_turno_changed(sender, instance, **kwargs):
    from .consumers import broadcast_dashboard_update
    broadcast_dashboard_update()


@receiver(pre_delete, sender=RegistroAcceso)
def on_registro_deleted(sender, instance, **kwargs):
    from .consumers import broadcast_dashboard_update
    broadcast_dashboard_update()