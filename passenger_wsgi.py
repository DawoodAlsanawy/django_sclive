# -*- coding: utf-8 -*-
import sys, os

sys.path.insert(0, os.path.dirname(__file__))
os.environ['DJANGO_SETTINGS_MODULE'] = 'sclive.settings'  # عدّل الاسم حسب مجلد الإعدادات

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
