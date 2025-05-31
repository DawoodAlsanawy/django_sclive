from django.urls import path

from core.views import inquiry_views

# مسارات الاستعلامات
urlpatterns = [
    path('inquiries/slenquiry/', inquiry_views.sick_leave_inquiry, name='sick_leave_inquiry'),
]
