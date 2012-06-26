from django.shortcuts import get_object_or_404, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.template import Context, loader, RequestContext
from django.utils import simplejson
from django.core import serializers
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
import datetime

from inquiry.models import Event, EventForm

@login_required
def index(request):
    "Just return questions"
    latest_question_list = Event.objects.filter(event_type='Q').order_by('-mod_datetime')
    t = loader.get_template('index.html')
    c = Context({
        'latest_question_list':latest_question_list,
    })
    return HttpResponse(t.render(c))

    
@login_required
def detail(request, event_id):
    event = get_object_or_404(Event, pk=event_id)
    return render_to_response('detail.html',{'event': event},context_instance=RequestContext(request))

@login_required
def new_event(request):
    "view to submit new inquiry event"
    if request.method == 'POST': # Good, that's all we'll allow.
        form = EventForm(request.POST)
        if form.is_valid():
            event = form.save(commit=False)
            event.author = request.user
            event.save()
            return HttpResponseRedirect('/') # TODO: include hidden field 
    else:
        form = EventForm() #TODO: populate references with responded event id
    return render_to_response('neweventform.html', {'form': form}, context_instance=RequestContext(request))
    pass

# start of XmtHttpRequest views

@login_required
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

@login_required
def xhr_detail(request, event_id, format):
    """
    Returns a serialized object (according to format, xml or json) that gives the referring items.
    """
    def _data():
        "Pass a function so that the data can be retrieved in a lazy manner after we have decided whether or not to serve it."
        event = get_object_or_404(Event, pk=event_id)
        return [event]
    return xhr_generic(request, _data, format)

@login_required
def xhr_children(request, event_id, format):
    """
    Returns a serialized object (according to format) that gives the referring items.
    """
    def _data():
        "Pass a function so that the data can be retrieved in a lazy manner after we have decided whether or not to serve it."
        event = get_object_or_404(Event, pk=event_id)
        return event.references()
    return xhr_generic(request, _data, format)

@login_required
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

@login_required
def author_name(request, author_id):
    author = get_object_or_404(User, pk=author_id)
    if author.first_name:
        name = author.first_name
        if author.last_name:
            name += ' ' + author.last_name
    else:
        name = author.username
    #return render_to_response('author.txt',{'author': name},context_instance=RequestContext(request))
    return HttpResponse(name)

def logout_view(request):
    logout(request)
    return HttpResponseRedirect('/')
