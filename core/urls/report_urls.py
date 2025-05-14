from django.urls import path

from core import views

# التقارير
urlpatterns = [
    path('reports/', views.report_index, name='report_index'),
    path('reports/sick-leaves/', views.report_sick_leaves, name='report_sick_leaves'),
    path('reports/companion-leaves/', views.report_companion_leaves, name='report_companion_leaves'),
    path('reports/invoices/', views.report_invoices, name='report_invoices'),
    path('reports/payments/', views.report_payments, name='report_payments'),
    path('reports/clients/', views.report_clients, name='report_clients'),
]
