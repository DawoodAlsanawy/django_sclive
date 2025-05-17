from django.urls import path

from core import views

# الصفحات الأساسية
urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('verify/', views.verify, name='verify'),
    path('leaves/update-status/', views.update_all_leaves_status, name='update_all_leaves_status'),
]
