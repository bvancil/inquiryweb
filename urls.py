from django.conf.urls.defaults import patterns, include, url
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'inquiry.views.index', name='index'),
    url(r'^inquiry/', include('inquiry.urls')),
    url(r'^accounts/login/$', 'django.contrib.auth.views.login'),
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    # Static admin files?? Why here?
    (r'^static/admin/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': settings.STATIC_ADMIN_ROOT}),
)
urlpatterns += staticfiles_urlpatterns()
