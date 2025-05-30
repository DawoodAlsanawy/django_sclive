from django.urls import path

from core import views

# إدارة الإجازات المرضية
urlpatterns = [
    path('sick-leaves/', views.sick_leave_list, name='sick_leave_list'),
    path('sick-leaves/create/', views.sick_leave_create, name='sick_leave_create'),
    path('sick-leaves/create-with-invoice/', views.sick_leave_create_with_invoice, name='sick_leave_create_with_invoice'),
    path('sick-leaves/<int:sick_leave_id>/', views.sick_leave_detail, name='sick_leave_detail'),
    path('sick-leaves/<int:sick_leave_id>/edit/', views.sick_leave_edit, name='sick_leave_edit'),
    path('sick-leaves/<int:sick_leave_id>/delete/', views.sick_leave_delete, name='sick_leave_delete'),
    path('sick-leaves/<int:sick_leave_id>/print/', views.sick_leave_print, name='sick_leave_print'),
]
