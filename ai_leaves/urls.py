from django.urls import path

from . import views

app_name = 'ai_leaves'

urlpatterns = [
    # طلبات الإجازات
    path('', views.leave_request_list, name='leave_request_list'),
    path('create/', views.leave_request_create, name='leave_request_create'),
    path('<int:request_id>/process/', views.leave_request_process, name='leave_request_process'),
]
