from django.urls import path
from .views import DeviceFigerPrintView , DataResptionsView
urlpatterns = [
    path('push', DataResptionsView.as_view(), name='attendance-push'),
    path('device',DeviceFigerPrintView.as_view(), name="device-figres"),
]