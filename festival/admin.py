from django.contrib import admin
from django.contrib.auth.models import User 
from festival.models import Festival

# Register your models here.

class AdminUtilisateur(admin.ModelAdmin):
    search_fields = ["festival_name"]
    list_display = ("user_id", "festival_id", "festival_name")
    
admin.site.register(Festival, AdminUtilisateur)
