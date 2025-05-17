from django import forms

from .models import LeaveRequest


class LeaveRequestForm(forms.ModelForm):
    """نموذج طلب الإجازة"""
    LEAVE_TYPE_CHOICES = [
        ('', '-- اختر نوع الإجازة --'),
        ('sick_leave', 'إجازة مرضية'),
        ('companion_leave', 'إجازة مرافق')
    ]

    leave_type = forms.ChoiceField(
        choices=LEAVE_TYPE_CHOICES, 
        required=True, 
        label='نوع الإجازة',
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = LeaveRequest
        fields = ['request_text', 'leave_type']
        widgets = {
            'request_text': forms.Textarea(attrs={
                'rows': 10, 
                'class': 'form-control', 
                'placeholder': 'أدخل نص طلب الإجازة هنا...',
                'dir': 'rtl'
            }),
        }
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['request_text'].label = 'نص الطلب'
        self.fields['request_text'].help_text = 'أدخل نص طلب الإجازة بالتفصيل ليتم معالجته تلقائيًا'
