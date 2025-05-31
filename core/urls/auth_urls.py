from django.urls import path

from core import views

# مسارات المصادقة
urlpatterns = [
    path('register/', views.register, name='register'),
    path('password-change/', views.password_change, name='password_change'),
]
