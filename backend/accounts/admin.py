from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'full_name', 'phone', 'is_active_user')
    list_filter = ('role', 'is_active_user')
    search_fields = ('user__username', 'user__email', 'full_name', 'phone')