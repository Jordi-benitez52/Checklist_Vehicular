from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('guardia', 'Guardia'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    full_name = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    photo = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_active_user = models.BooleanField(default=True)
    push_token = models.CharField(max_length=255, blank=True, null=True)
    numero_empleado = models.CharField(max_length=50, blank=True, default='')

    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=64, blank=True, null=True)
    two_factor_verified = models.BooleanField(default=False)

    email_on_login = models.BooleanField(default=True)

    verification_code = models.CharField(max_length=6, blank=True, null=True)
    verification_code_expires = models.DateTimeField(blank=True, null=True)
    verification_attempts = models.IntegerField(default=0)
    verification_locked_until = models.DateTimeField(blank=True, null=True)

    password_reset_code = models.CharField(max_length=64, blank=True, null=True)
    password_reset_code_expires = models.DateTimeField(blank=True, null=True)
    password_reset_attempts = models.IntegerField(default=0)
    password_reset_locked_until = models.DateTimeField(blank=True, null=True)

    known_login_ips = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

    def has_verification_code(self):
        if not self.verification_code or not self.verification_code_expires:
            return False
        from django.utils import timezone
        return timezone.now() < self.verification_code_expires

    def has_password_reset_code(self):
        if not self.password_reset_code or not self.password_reset_code_expires:
            return False
        from django.utils import timezone
        return timezone.now() < self.password_reset_code_expires

    def is_locked(self):
        from django.utils import timezone
        if self.verification_locked_until:
            return timezone.now() < self.verification_locked_until
        return False

    def is_password_reset_locked(self):
        from django.utils import timezone
        if self.password_reset_locked_until:
            return timezone.now() < self.password_reset_locked_until
        return False

    def clear_verification_code(self):
        self.verification_code = None
        self.verification_code_expires = None
        self.save()

    def clear_password_reset_code(self):
        self.password_reset_code = None
        self.password_reset_code_expires = None
        self.password_reset_attempts = 0
        self.save()