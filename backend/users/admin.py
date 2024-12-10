from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from files.models import File

if admin.site.is_registered(CustomUser):
    admin.site.unregister(CustomUser)

class CustomUserAdmin(UserAdmin):
    list_display = UserAdmin.list_display + ('get_files_count',)

    def get_files_count(self, obj):
        """
	Returns the number of files uploaded by the user
	"""
        return File.objects.filter(user=obj).count()
    get_files_count.short_description = 'Files Count'

# Registering the user's model with changes
admin.site.register(CustomUser, CustomUserAdmin)
