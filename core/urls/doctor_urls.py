from django.urls import path

from core import views

# إدارة الأطباء
urlpatterns = [
    path('doctors/', views.doctor_list, name='doctor_list'),
    path('doctors/create/', views.doctor_create, name='doctor_create'),
    path('doctors/<int:doctor_id>/', views.doctor_detail, name='doctor_detail'),
    path('doctors/<int:doctor_id>/edit/', views.doctor_edit, name='doctor_edit'),
    path('doctors/<int:doctor_id>/delete/', views.doctor_delete, name='doctor_delete'),
]
