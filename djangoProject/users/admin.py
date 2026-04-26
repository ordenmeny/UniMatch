from django.contrib import admin
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.admin import UserAdmin
from .models import *


class CustomUserAdmin(UserAdmin):
    list_display = ('first_name', 'last_name', 'username', 'email', 'is_active_pair', 'date_joined')
    list_display_links = ('first_name', 'last_name', 'username', 'email')
    # list_editable = ('chat_id', )

    fields_to_set = ("email", "image", "hobby", 'birth', 'is_active_pair', 'first_name', 'last_name', 'tg_link')
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Personal info"), {"fields": fields_to_set}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )


admin.site.register(get_user_model(), CustomUserAdmin)
admin.site.register(HobbyModel)

class PairsModelAdmin(admin.ModelAdmin):
    list_display = ('user1', 'user2', 'is_archived')
    list_display_links = ('user1', 'user2', 'is_archived')

admin.site.register(PairsModel, PairsModelAdmin)
# admin.site.register(CurrentPairsModel)
