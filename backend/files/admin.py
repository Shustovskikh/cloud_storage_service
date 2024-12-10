from django.contrib import admin
from django.utils.html import format_html
from .models import File
from django.http import HttpResponse

class FileAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'size', 'uploaded_at', 'auto_deleted_at', 'get_shared_link', 'get_download_link', 'delete_file_action')
    list_filter = ('user', 'uploaded_at', 'auto_deleted_at')
    search_fields = ('name', 'user__username')
    actions = ['delete_selected_files']

    def get_download_link(self, obj):
        """
	Adding a link to download the file
	"""
        url = obj.get_shared_url()
        return format_html('<a href="{}" target="_blank">Download</a>', url)

    def get_shared_link(self, obj):
        """
	Adding a link to get a unique download link
	"""
        url = obj.get_shared_url()
        return format_html('<a href="{}" target="_blank">Get Shared Link</a>', url)

    def delete_file_action(self, obj):
        """
	Add a button to delete the file directly from the admin panel
	"""
        return format_html('<a class="button" href="/admin/files/file/{}/delete/">Delete</a>', obj.pk)

    def delete_selected_files(self, request, queryset):
        """
	Deleting selected files via the admin panel
	"""
        for file in queryset:
            file.file.delete()
            file.delete()
        self.message_user(request, "Selected files have been deleted.")

    delete_selected_files.short_description = "Delete selected files"

# We register the File model with the addition of admin settings
admin.site.register(File, FileAdmin)
