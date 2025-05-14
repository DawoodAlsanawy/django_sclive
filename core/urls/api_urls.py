from django.urls import path

from core import views

# واجهات برمجة التطبيقات
urlpatterns = [
    path('doctors/api/search/', views.doctor_search_api, name='doctor_search_api'),
    path('patients/api/search/', views.patient_search_api, name='patient_search_api'),
    path('clients/api/search/', views.client_search_api, name='client_search_api'),
    path('sick-leaves/api/search/', views.sick_leave_search_api, name='sick_leave_search_api'),
    path('companion-leaves/api/search/', views.companion_leave_search_api, name='companion_leave_search_api'),
    path('leave-prices/api/get-price/', views.leave_price_api_get_price, name='leave_price_api_get_price'),
    path('api/client/<int:client_id>/unpaid-invoices/', views.api_client_unpaid_invoices, name='api_client_unpaid_invoices'),
]
