"""
URL configuration for sclive project.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include, path

from core.forms import LoginForm
from core.views import password_change, register

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('ai-leaves/', include('ai_leaves.urls')),  # مسارات طلبات الإجازات الذكية

    # مسارات المصادقة
    path('login/', auth_views.LoginView.as_view(
        template_name='core/auth/login.html',
        authentication_form=LoginForm
    ), name='login'),
    path('register/', register, name='register'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('password_change/', password_change, name='password_change'),
    path('password_change/done/', auth_views.PasswordChangeDoneView.as_view(
        template_name='core/auth/password_change_done.html'
    ), name='password_change_done'),
]

# إضافة مسارات الملفات الثابتة في وضع التطوير
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
