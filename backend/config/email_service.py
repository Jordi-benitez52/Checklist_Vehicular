from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from datetime import datetime


def get_admin_emails():
    from django.contrib.auth.models import User
    admins = User.objects.filter(
        profile__role='admin',
        profile__is_active_user=True,
        is_active=True
    ).exclude(email='').values_list('email', flat=True)
    return list(admins)


def send_login_notification(user_profile, request):
    if not getattr(settings, 'LOGIN_NOTIFICATION_ENABLED', True):
        return

    try:
        user = user_profile.user
        guard_email = user.email

        if not guard_email:
            return

        fecha_hora = datetime.now().strftime('%d/%m/%Y %H:%M')

        admin_emails = get_admin_emails() if getattr(settings, 'LOGIN_NOTIFICATION_INCLUDE_ADMINS', True) else []

        subject_guard = '[LRA Checklist] Inicio de sesion detectado'
        subject_admin = f'[LRA] Guardia {user_profile.full_name} inicio sesion'

        html_content_guard = f'''
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #059669, #047857); padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">LRA Checklist Vehicular</h2>
            </div>
            <div style="padding: 20px; background: #f8fafc;">
                <h3 style="color: #059669;">Hola {user_profile.full_name},</h3>
                <p>Se ha iniciado sesion en tu cuenta de Checklist LRA.</p>
                <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 18px; color: #059669;">
                        <strong>Hora: {fecha_hora}</strong>
                    </p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">Si no fuiste tu, contacta al administrador.</p>
            </div>
            <div style="padding: 15px; background: #047857; color: white; text-align: center; font-size: 12px;">
                Sistema de Checklist Vehicular - LRA
            </div>
        </div>
        '''

        html_content_admin = f'''
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #059669, #047857); padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">LRA - Notificacion</h2>
            </div>
            <div style="padding: 20px; background: #f8fafc;">
                <h3 style="color: #059669;">El guardia {user_profile.full_name} ha iniciado sesion.</h3>
                <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 16px; color: #059669;">
                        <strong>Hora: {fecha_hora}</strong>
                    </p>
                </div>
            </div>
            <div style="padding: 15px; background: #047857; color: white; text-align: center; font-size: 12px;">
                Sistema de Checklist Vehicular - LRA
            </div>
        </div>
        '''

        email_guard = EmailMultiAlternatives(
            subject=subject_guard,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[guard_email]
        )
        email_guard.attach_alternative(html_content_guard, 'text/html')
        try:
            email_guard.send()
        except Exception as e:
            import logging
            logger = logging.getLogger('django')
            logger.error(f'Error enviando email de notificacion de login a {guard_email}: {e}')

        if admin_emails:
            email_admin = EmailMultiAlternatives(
                subject=subject_admin,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[settings.DEFAULT_FROM_EMAIL],
                bcc=admin_emails
            )
            email_admin.attach_alternative(html_content_admin, 'text/html')
            try:
                email_admin.send()
            except Exception as e:
                import logging
                logger = logging.getLogger('django')
                logger.error(f'Error enviando email de notificacion de login a admins: {e}')

    except Exception as e:
        import logging
        logger = logging.getLogger('django')
        logger.error(f'Error general en send_login_notification: {e}')