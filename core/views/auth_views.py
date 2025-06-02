from django.contrib import messages
from django.contrib.auth import login, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.shortcuts import redirect, render

from core.forms import RegisterForm


def register(request):
    """تسجيل حساب جديد"""
    # if request.user.is_authenticated:
    #     return redirect('core:home')

    # if request.method == 'POST':
    #     form = RegisterForm(request.POST)
    #     if form.is_valid():
    #         user = form.save()
    #         login(request, user)
    #         messages.success(request, 'تم تسجيل حسابك بنجاح')
    #         return redirect('core:home')
    # else:
    #     form = RegisterForm()

    # return render(request, 'core/auth/login.html', {'form': form})
    return render(request, 'core/auth/login.html')


@login_required
def password_change(request):
    """تغيير كلمة المرور"""
    # if request.method == 'POST':
    #     form = PasswordChangeForm(request.user, request.POST)
    #     if form.is_valid():
    #         user = form.save()
    #         # تحديث جلسة المستخدم لمنع تسجيل الخروج
    #         update_session_auth_hash(request, user)
    #         messages.success(request, 'تم تغيير كلمة المرور بنجاح')
    #         return redirect('password_change_done')
    # else:
    #     form = PasswordChangeForm(request.user)

    # return render(request, 'core/auth/login.html', {'form': form})
    return render(request, 'core/auth/login.html')
