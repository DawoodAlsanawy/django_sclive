from django.urls import path

from core import views

# إدارة المدفوعات
urlpatterns = [
    path('payments/', views.payment_list, name='payment_list'),
    path('payments/create/', views.payment_create, name='payment_create'),
    path('payments/<int:payment_id>/', views.payment_detail, name='payment_detail'),
    path('payments/<int:payment_id>/edit/', views.payment_edit, name='payment_edit'),
    path('payments/<int:payment_id>/delete/', views.payment_delete, name='payment_delete'),
    path('payments/<int:payment_id>/print/', views.payment_print, name='payment_print'),
]
