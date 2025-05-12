"""
URL configuration for sclive project.
"""
from core.forms import LoginForm
from core.views import register
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),

    # مسارات المصادقة
    path('login/', auth_views.LoginView.as_view(
        template_name='core/auth/login.html',
        authentication_form=LoginForm
    ), name='login'),
    path('register/', register, name='register'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('password_change/', auth_views.PasswordChangeView.as_view(
        template_name='core/auth/password_change.html'
    ), name='password_change'),
    path('password_change/done/', auth_views.PasswordChangeDoneView.as_view(
        template_name='core/auth/password_change_done.html'
    ), name='password_change_done'),
]

# إضافة مسارات الملفات الثابتة في وضع التطوير
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
