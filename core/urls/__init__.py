# استيراد المسارات من الحزم الفرعية
from django.urls import include, path

from . import (ajax_urls, api_urls, auth_urls, base_urls, client_urls,
               companion_leave_urls, doctor_urls, employer_urls, hospital_urls,
               leave_invoice_urls, leave_price_urls, patient_urls,
               payment_urls, report_urls, sick_leave_urls, user_urls)

app_name = 'core'

urlpatterns = [
    # الصفحات الأساسية
    path('', include(base_urls.urlpatterns)),

    # المصادقة
    path('', include(auth_urls.urlpatterns)),

    # إدارة المستخدمين
    path('', include(user_urls.urlpatterns)),

    # إدارة المستشفيات
    path('', include(hospital_urls.urlpatterns)),

    # إدارة جهات العمل
    path('', include(employer_urls.urlpatterns)),

    # إدارة الأطباء
    path('', include(doctor_urls.urlpatterns)),

    # إدارة المرضى
    path('', include(patient_urls.urlpatterns)),

    # إدارة العملاء
    path('', include(client_urls.urlpatterns)),

    # إدارة أسعار الإجازات
    path('', include(leave_price_urls.urlpatterns)),

    # إدارة الإجازات المرضية
    path('', include(sick_leave_urls.urlpatterns)),

    # إدارة إجازات المرافقين
    path('', include(companion_leave_urls.urlpatterns)),

    # إدارة فواتير الإجازات
    path('', include(leave_invoice_urls.urlpatterns)),

    # إدارة المدفوعات
    path('', include(payment_urls.urlpatterns)),

    # واجهات برمجة التطبيقات
    path('', include(api_urls.urlpatterns)),

    # وظائف AJAX
    path('', include(ajax_urls.urlpatterns)),

    # التقارير
    path('', include(report_urls.urlpatterns)),
]
