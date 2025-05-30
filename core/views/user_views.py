from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from core.forms import UserCreateForm, UserEditForm
from core.models import User


@login_required
def user_list(request):
    """قائمة المستخدمين"""
    users = User.objects.all()
    return render(request, 'core/users/list.html', {'users': users})


@login_required
def user_create(request):
    """إنشاء مستخدم جديد"""
    if not request.user.is_admin():
        messages.error(request, 'ليس لديك صلاحية للوصول إلى هذه الصفحة')
        return redirect('core:home')

    if request.method == 'POST':
        form = UserCreateForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, f'تم إنشاء المستخدم {user.username} بنجاح')
            return redirect('core:user_list')
    else:
        form = UserCreateForm()

    return render(request, 'core/users/create.html', {'form': form})


@login_required
def user_edit(request, user_id):
    """تعديل مستخدم"""
    if not request.user.is_admin():
        messages.error(request, 'ليس لديك صلاحية للوصول إلى هذه الصفحة')
        return redirect('core:home')

    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        form = UserEditForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, f'تم تعديل المستخدم {user.username} بنجاح')
            return redirect('core:user_list')
    else:
        form = UserEditForm(instance=user)

    return render(request, 'core/users/edit.html', {'form': form, 'user': user})


@login_required
def user_delete(request, user_id):
    """حذف مستخدم"""
    if not request.user.is_admin():
        messages.error(request, 'ليس لديك صلاحية للوصول إلى هذه الصفحة')
        return redirect('core:home')

    # منع حذف المستخدم لنفسه
    if request.user.id == int(user_id):
        messages.error(request, 'لا يمكنك حذف حسابك الخاص')
        return redirect('core:user_list')

    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        username = user.username  # حفظ اسم المستخدم قبل الحذف
        user.delete()
        messages.success(request, f'تم حذف المستخدم {username} بنجاح')
        return redirect('core:user_list')

    return render(request, 'core/users/delete.html', {'user': user})
