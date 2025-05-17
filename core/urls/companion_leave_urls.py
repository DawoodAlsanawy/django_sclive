from django.urls import path

from core import views

# إدارة إجازات المرافقين
urlpatterns = [
    path('companion-leaves/', views.companion_leave_list, name='companion_leave_list'),
    path('companion-leaves/create/', views.companion_leave_create, name='companion_leave_create'),
    path('companion-leaves/create-with-invoice/', views.companion_leave_create_with_invoice, name='companion_leave_create_with_invoice'),
    path('companion-leaves/<int:companion_leave_id>/', views.companion_leave_detail, name='companion_leave_detail'),
    path('companion-leaves/<int:companion_leave_id>/edit/', views.companion_leave_edit, name='companion_leave_edit'),
    path('companion-leaves/<int:companion_leave_id>/delete/', views.companion_leave_delete, name='companion_leave_delete'),
    path('companion-leaves/<int:companion_leave_id>/print/', views.companion_leave_print, name='companion_leave_print'),
]
