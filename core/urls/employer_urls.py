from django.urls import path

from core import views

# إدارة جهات العمل
urlpatterns = [
    path('employers/', views.employer_list, name='employer_list'),
    path('employers/create/', views.employer_create, name='employer_create'),
    path('employers/<int:employer_id>/', views.employer_detail, name='employer_detail'),
    path('employers/<int:employer_id>/edit/', views.employer_edit, name='employer_edit'),
    path('employers/<int:employer_id>/delete/', views.employer_delete, name='employer_delete'),
]
