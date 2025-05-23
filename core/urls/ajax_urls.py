from django.urls import path

from core import views

# وظائف AJAX
urlpatterns = [
    # إنشاء الكيانات
    path('patients/create-ajax/', views.patient_create_ajax, name='patient_create_ajax'),
    path('doctors/create-ajax/', views.doctor_create_ajax, name='doctor_create_ajax'),
    path('hospitals/create-ajax/', views.hospital_create_ajax, name='hospital_create_ajax'),
    path('clients/create-ajax/', views.client_create_ajax, name='client_create_ajax'),
    path('companions/create-ajax/', views.companion_create_ajax, name='companion_create_ajax'),

    # الحصول على بيانات الكيانات للتعديل
    path('patients/<int:patient_id>/data/', views.get_patient_data, name='get_patient_data'),
    path('doctors/<int:doctor_id>/data/', views.get_doctor_data, name='get_doctor_data'),
    path('hospitals/<int:hospital_id>/data/', views.get_hospital_data, name='get_hospital_data'),
    path('companions/<int:companion_id>/data/', views.get_companion_data, name='get_companion_data'),

    # تحديث بيانات الكيانات
    path('patients/<int:patient_id>/update-ajax/', views.update_patient_ajax, name='update_patient_ajax'),
    path('doctors/<int:doctor_id>/update-ajax/', views.update_doctor_ajax, name='update_doctor_ajax'),
    path('hospitals/<int:hospital_id>/update-ajax/', views.update_hospital_ajax, name='update_hospital_ajax'),
    path('companions/<int:companion_id>/update-ajax/', views.update_companion_ajax, name='update_companion_ajax'),
]
