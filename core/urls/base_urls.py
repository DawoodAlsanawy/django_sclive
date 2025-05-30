from django.urls import path
from django.views.generic import TemplateView

from core import views

# الصفحات الأساسية
urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('verify/', views.verify, name='verify'),
    path('leaves/update-status/', views.update_all_leaves_status, name='update_all_leaves_status'),
    path('test-ajax/', TemplateView.as_view(template_name='test_ajax.html'), name='test_ajax'),
    path('test-template-tags/', views.test_template_tags, name='test_template_tags'),
]
