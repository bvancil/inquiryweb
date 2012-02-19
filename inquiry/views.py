from django.shortcuts import get_object_or_404, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.template import Context, loader, RequestContext
from django.utils import simplejson
from django.core import serializers
from django.conf import settings
import datetime

from inquiry.models import Event

def index(request):
    "Just return questions"
    latest_question_list = Event.objects.filter(event_type='Q').order_by('-mod_datetime')
    t = loader.get_template('index.html')
    c = Context({
        'latest_question_list':latest_question_list,
    })
    return HttpResponse(t.render(c))

    
def detail(request, event_id):
    event = get_object_or_404(Event, pk=event_id)
    return render_to_response('detail.html',{'event': event},context_instance=RequestContext(request))
    #return HttpResponse("<p>"+unicode(event_id)+"</p>\n<p>"+unicode(event)+"</p>\n<p>\n"+unicode(event.add_datetime)+"</p>\n<p>\n"+unicode(event.mod_datetime)+"</p>\n<p>\n"+unicode(Event.objects.filter(pk=event_id).values())+"</p>\n<p>\n"+unicode(list(event.referants.values()))+"</p>")

def new_event(request):
    "view to submit new inquiry event"
    pass

# start of XmtHttpRequest views

def xhr_generic(request, data, format):
    """
    Utility method called by XmlHttpRequest-type AJAX views
    data is a 
    """
    if settings.DEBUG or request.is_ajax():
        if format == 'xml':
            mimetype = 'application/xml'
        elif format == 'json':
            mimetype = 'application/javascript'
        else:
            return HttpResponse(status=400)
        return HttpResponse(serializers.serialize(format, data()), mimetype)
    else:
        return HttpResponse(status=400)

def xhr_detail(request, event_id, format):
    """
    Returns a serialized object (according to format) that gives the referring items.
    """
    def _data():
        "Pass a function so that the data can be retrieved in a lazy manner after we have decided whether or not to serve it."
        event = get_object_or_404(Event, pk=event_id)
        return [event]
    return xhr_generic(request, _data, format)

def xhr_children(request, event_id, format):
    """
    Returns a serialized object (according to format) that gives the referring items.
    """
    def _data():
        "Pass a function so that the data can be retrieved in a lazy manner after we have decided whether or not to serve it."
        event = get_object_or_404(Event, pk=event_id)
        return event.references()
    return xhr_generic(request, _data, format)

def xhr_last_updated(request, base_timestamp, event_id, format):
    """
    Returns a json object that gives the referring items updated 
    since the base_timestamp, allowing the client to dynamically
    update a constantly updating interface.
    """
    def _data():
        "Pass a function so that the data can be retrieved in a lazy manner after we have decided whether or not to serve it."
        event = get_object_or_404(Event, pk=event_id)
        return event.get_descendents_later_than(base_timestamp)
    return xhr_generic(request, _data, format)

def xhr_all(request, format):
    """
    Return all inquiry events
    """
    def _data():
        "Pass a function so that the data can be retrieved in a lazy manner after we have decided whether or not to serve it."
        return Event.objects.all()
    return xhr_generic(request, _data, format)
