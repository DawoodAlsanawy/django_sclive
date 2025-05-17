from django.urls import path

from core import views

# وظائف AJAX
urlpatterns = [
    path('patients/create-ajax/', views.patient_create_ajax, name='patient_create_ajax'),
    path('doctors/create-ajax/', views.doctor_create_ajax, name='doctor_create_ajax'),
    path('hospitals/create-ajax/', views.hospital_create_ajax, name='hospital_create_ajax'),
    path('clients/create-ajax/', views.client_create_ajax, name='client_create_ajax'),
    path('companions/create-ajax/', views.companion_create_ajax, name='companion_create_ajax'),
]
