from django.db import models
from django.contrib.auth.models import User
from django.forms import ModelForm
from django.core import serializers
import tagging 

EVENT_CHOICES = (
    ('Q', 'Question'),
    ('P', 'Prediction'),
    ('O', 'Observation'),
    ('E', 'Explanation'),
    ('M', 'Model'),
    )

class Event (models.Model):
    "Inquiry Event"
    add_datetime = models.DateTimeField('Created', auto_now_add=True)
    mod_datetime = models.DateTimeField('Modified', auto_now=True)
    author = models.ForeignKey(User, null=True, blank=True) # null and blank set to allow null values to be changed to current user
    referants = models.ManyToManyField('self', symmetrical=False, blank=True, null=True)
    event_type = models.CharField('I have a', max_length=1, choices=EVENT_CHOICES)
    description = models.CharField(max_length=300)
    def __unicode__(self):
        return (u'%s. %s' % (self.event_type, self.description))
    def json(self):
        "Return the json serialization."
        return serializers.serialize("json", [self]);
    def referants_ids_json(self):
        "Return all the ids for referant inquiry events in json."
        return serializers.serialize("json", self.referants.all(), fields=('id'))
    def references_json(self):
        "Return all inquiry events for which the given event is a referant in json."
        return serializers.serialize("json", self.references());

    def references(self):
        "Return all inquiry events for which the given event is a referant."
        return Event.objects.filter(referants__id=self.id)
    def get_descendents_later_than(self, timestamp):
        return self.references().filter(mod_datetime__gt=timestamp)

tagging.register(Event)
        
class EventForm(ModelForm):
     class Meta:
         model = Event 
    
