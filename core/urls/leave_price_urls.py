from django.urls import path

from core import views

# إدارة أسعار الإجازات
urlpatterns = [
    path('leave-prices/', views.leave_price_list, name='leave_price_list'),
    path('leave-prices/create/', views.leave_price_create, name='leave_price_create'),
    path('leave-prices/<int:leave_price_id>/edit/', views.leave_price_edit, name='leave_price_edit'),
    path('leave-prices/<int:leave_price_id>/delete/', views.leave_price_delete, name='leave_price_delete'),
]
