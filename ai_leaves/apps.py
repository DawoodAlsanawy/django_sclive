from django.apps import AppConfig


class AiLeavesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ai_leaves'
    verbose_name = 'طلبات الإجازات الذكية'

    def ready(self):
        """تنفيذ الإعدادات عند بدء التطبيق"""
        # لا نقوم بتحميل نموذج BERT تلقائيًا عند بدء التطبيق
        # سيتم تحميله عند الحاجة فقط
        pass
    # def ready(self):
    #     """تنفيذ الإعدادات عند بدء التطبيق"""
    #     try:
    #         # تحميل نموذج BERT عند بدء التطبيق
    #         from ai_leaves.bert_processor import load_model
    #         load_model()
    #     except Exception as e:
    #         print(f"خطأ في تحميل نموذج BERT: {e}")
