from django.urls import path

from . import views

app_name = 'core'

urlpatterns = [
    # الصفحة الرئيسية
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('verify/', views.verify, name='verify'),

    # إدارة المستخدمين
    path('users/', views.user_list, name='user_list'),
    path('users/create/', views.user_create, name='user_create'),
    path('users/<int:user_id>/edit/', views.user_edit, name='user_edit'),
    path('users/<int:user_id>/delete/', views.user_delete, name='user_delete'),

    # إدارة المستشفيات
    path('hospitals/', views.hospital_list, name='hospital_list'),
    path('hospitals/create/', views.hospital_create, name='hospital_create'),
    path('hospitals/<int:hospital_id>/edit/', views.hospital_edit, name='hospital_edit'),
    path('hospitals/<int:hospital_id>/delete/', views.hospital_delete, name='hospital_delete'),

    # إدارة جهات العمل
    path('employers/', views.employer_list, name='employer_list'),
    path('employers/create/', views.employer_create, name='employer_create'),
    path('employers/<int:employer_id>/edit/', views.employer_edit, name='employer_edit'),
    path('employers/<int:employer_id>/delete/', views.employer_delete, name='employer_delete'),

    # إدارة الأطباء
    path('doctors/', views.doctor_list, name='doctor_list'),
    path('doctors/create/', views.doctor_create, name='doctor_create'),
    path('doctors/<int:doctor_id>/edit/', views.doctor_edit, name='doctor_edit'),
    path('doctors/<int:doctor_id>/delete/', views.doctor_delete, name='doctor_delete'),
    path('doctors/api/search/', views.doctor_search_api, name='doctor_search_api'),

    # إدارة المرضى
    path('patients/', views.patient_list, name='patient_list'),
    path('patients/create/', views.patient_create, name='patient_create'),
    path('patients/<int:patient_id>/', views.patient_detail, name='patient_detail'),
    path('patients/<int:patient_id>/edit/', views.patient_edit, name='patient_edit'),
    path('patients/<int:patient_id>/delete/', views.patient_delete, name='patient_delete'),
    path('patients/api/search/', views.patient_search_api, name='patient_search_api'),

    # إدارة العملاء
    path('clients/', views.client_list, name='client_list'),
    path('clients/create/', views.client_create, name='client_create'),
    path('clients/<int:client_id>/', views.client_detail, name='client_detail'),
    path('clients/<int:client_id>/edit/', views.client_edit, name='client_edit'),
    path('clients/<int:client_id>/delete/', views.client_delete, name='client_delete'),
    path('clients/api/search/', views.client_search_api, name='client_search_api'),

    # إدارة أسعار الإجازات
    path('leave-prices/', views.leave_price_list, name='leave_price_list'),
    path('leave-prices/create/', views.leave_price_create, name='leave_price_create'),
    path('leave-prices/<int:leave_price_id>/edit/', views.leave_price_edit, name='leave_price_edit'),
    path('leave-prices/<int:leave_price_id>/delete/', views.leave_price_delete, name='leave_price_delete'),
    path('leave-prices/api/get-price/', views.leave_price_api_get_price, name='leave_price_api_get_price'),

    # إدارة الإجازات المرضية
    path('sick-leaves/', views.sick_leave_list, name='sick_leave_list'),
    path('sick-leaves/create/', views.sick_leave_create, name='sick_leave_create'),
    path('sick-leaves/<int:sick_leave_id>/', views.sick_leave_detail, name='sick_leave_detail'),
    path('sick-leaves/<int:sick_leave_id>/edit/', views.sick_leave_edit, name='sick_leave_edit'),
    path('sick-leaves/<int:sick_leave_id>/delete/', views.sick_leave_delete, name='sick_leave_delete'),
    path('sick-leaves/api/search/', views.sick_leave_search_api, name='sick_leave_search_api'),

    # إدارة إجازات المرافقين
    path('companion-leaves/', views.companion_leave_list, name='companion_leave_list'),
    path('companion-leaves/create/', views.companion_leave_create, name='companion_leave_create'),
    path('companion-leaves/<int:companion_leave_id>/', views.companion_leave_detail, name='companion_leave_detail'),
    path('companion-leaves/<int:companion_leave_id>/edit/', views.companion_leave_edit, name='companion_leave_edit'),
    path('companion-leaves/<int:companion_leave_id>/delete/', views.companion_leave_delete, name='companion_leave_delete'),
    path('companion-leaves/api/search/', views.companion_leave_search_api, name='companion_leave_search_api'),

    # إدارة فواتير الإجازات
    path('leave-invoices/', views.leave_invoice_list, name='leave_invoice_list'),
    path('leave-invoices/create/', views.leave_invoice_create, name='leave_invoice_create'),
    path('leave-invoices/<int:leave_invoice_id>/', views.leave_invoice_detail, name='leave_invoice_detail'),
    path('leave-invoices/<int:leave_invoice_id>/edit/', views.leave_invoice_edit, name='leave_invoice_edit'),
    path('leave-invoices/<int:leave_invoice_id>/delete/', views.leave_invoice_delete, name='leave_invoice_delete'),

    # إدارة المدفوعات
    path('payments/', views.payment_list, name='payment_list'),
    path('payments/create/', views.payment_create, name='payment_create'),
    path('payments/<int:payment_id>/', views.payment_detail, name='payment_detail'),
    path('payments/<int:payment_id>/edit/', views.payment_edit, name='payment_edit'),
    path('payments/<int:payment_id>/delete/', views.payment_delete, name='payment_delete'),

    # التقارير
    path('reports/', views.report_index, name='report_index'),
    path('reports/sick-leaves/', views.report_sick_leaves, name='report_sick_leaves'),
    path('reports/companion-leaves/', views.report_companion_leaves, name='report_companion_leaves'),
    path('reports/invoices/', views.report_invoices, name='report_invoices'),
    path('reports/payments/', views.report_payments, name='report_payments'),
    path('reports/clients/', views.report_clients, name='report_clients'),
]
