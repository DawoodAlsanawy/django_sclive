from django.urls import path

from core import views

# إدارة فواتير الإجازات
urlpatterns = [
    path('leave-invoices/', views.leave_invoice_list, name='leave_invoice_list'),
    path('leave-invoices/create/', views.leave_invoice_create, name='leave_invoice_create'),
    path('leave-invoices/<int:leave_invoice_id>/', views.leave_invoice_detail, name='leave_invoice_detail'),
    path('leave-invoices/<int:leave_invoice_id>/edit/', views.leave_invoice_edit, name='leave_invoice_edit'),
    path('leave-invoices/<int:leave_invoice_id>/delete/', views.leave_invoice_delete, name='leave_invoice_delete'),
]
