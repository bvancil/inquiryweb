from models import Event
from django.contrib import admin

class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'author','event_type', 'description')
    fieldsets = [
        (None, {'fields': ['referants'] } ),
        ('Inquiry Event', {'fields': ['event_type', 'description'] } ),
        ]
    def save_model(self, request, obj, form, change):
        # The following is a hack started in models.py that sets
        # the author field to none so that it can be set here to
        # the current user.
        if getattr(obj, 'author', None) is None:
            obj.author = request.user
        obj.save()
    
admin.site.register(Event, EventAdmin)
