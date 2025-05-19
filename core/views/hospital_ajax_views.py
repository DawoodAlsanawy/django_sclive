from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from core.forms import HospitalForm
from core.models import Hospital


@login_required
@require_POST
def hospital_create_ajax(request):
    """إنشاء مستشفى جديد عبر AJAX"""
    form = HospitalForm(request.POST, request.FILES)
    if form.is_valid():
        hospital = form.save()
        return JsonResponse({
            'success': True,
            'hospital': {
                'id': hospital.id,
                'name': hospital.name
            }
        })
    else:
        return JsonResponse({
            'success': False,
            'errors': form.errors
        })
