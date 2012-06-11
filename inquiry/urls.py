from django.conf.urls.defaults import *
from django.views.generic import DetailView, ListView
from inquiry.models import Event

urlpatterns = patterns('inquiry.views',
    url(r'^$', ListView.as_view(
            queryset=Event.objects.filter(event_type='Q').order_by('-mod_datetime'),
            context_object_name='latest_question_list',
            template_name='index.html')), # testing generic views
    url(r'^stream$', ListView.as_view(
            queryset=Event.objects.order_by('-mod_datetime'),
            context_object_name='latest_question_list',
            template_name='index.html')), # testing generic views; TODO: change to a template that shows timestamp, event type too
    url(r'^event/(?P<event_id>\d+)$', 'detail'),
    url(r'^event/new$', 'new_event'),
    url(r'^event/(?P<event_id>\d+)/children/(?P<format>\w+)/$', 'xhr_children'),  
    url(r'^event/(?P<event_id>\d+)/(?P<format>\w+)/$', 'xhr_detail'),  
    url(r'^event/(?P<event_id>\d+)/updates/(?P<base_timestamp>\d\d\d\d-\d\d-\d\dT\d\d:\d\d)/(?P<format>\w+)/$', 'xhr_last_updated'),
    url(r'^event/all/(?P<format>\w+)/$', 'xhr_all'),
    url(r'^author/(?P<author_id>\d+)$', 'author_name'),
                      
)
