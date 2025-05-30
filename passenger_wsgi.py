# -*- coding: utf-8 -*-
# import sys
# import os

# path = '/home/seheyura/django_sclive'  # عدله حسب المسار الصحيح
# if path not in sys.path:
#     sys.path.insert(0, path)

# os.environ['DJANGO_SETTINGS_MODULE'] = 'sclive.settings'

# from django.core.wsgi import get_wsgi_application
# application = get_wsgi_application()
from sclive.wsgi import application
