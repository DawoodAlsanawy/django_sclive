from django.contrib import admin

from .models import LeaveRequest


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    """إدارة طلبات الإجازات في لوحة الإدارة"""
    list_display = ('id', 'leave_type', 'processed', 'leave_id', 'created_at')
    list_filter = ('processed', 'leave_type', 'created_at')
    search_fields = ('request_text', 'leave_id')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('معلومات الطلب', {
            'fields': ('request_text', 'leave_type')
        }),
        ('حالة المعالجة', {
            'fields': ('processed', 'leave_id')
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    actions = ['process_selected_requests']

    def process_selected_requests(self, request, queryset):
        """معالجة الطلبات المحددة"""
        processed_count = 0
        for leave_request in queryset.filter(processed=False):
            if leave_request.process_request():
                processed_count += 1

        if processed_count:
            self.message_user(request, f'تمت معالجة {processed_count} طلب بنجاح')

    process_selected_requests.short_description = 'معالجة الطلبات المحددة'
