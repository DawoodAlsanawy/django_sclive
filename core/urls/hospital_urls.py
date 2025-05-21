from django.urls import path

from core import views

# إدارة المستشفيات
urlpatterns = [
    path('hospitals/', views.hospital_list, name='hospital_list'),
    path('hospitals/create/', views.hospital_create, name='hospital_create'),
    path('hospitals/<int:hospital_id>/', views.hospital_detail, name='hospital_detail'),
    path('hospitals/<int:hospital_id>/edit/', views.hospital_edit, name='hospital_edit'),
    path('hospitals/<int:hospital_id>/delete/', views.hospital_delete, name='hospital_delete'),
]
