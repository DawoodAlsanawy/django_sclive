"""
اختبار الأداء تحت الحمل لنظام إدارة الإجازات المرضية
"""

import os
import sys
import time
import random
import datetime
import requests
import threading
import statistics
from concurrent.futures import ThreadPoolExecutor

# إعداد المسار للمشروع
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sclive.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from django.test import Client
from django.urls import reverse

User = get_user_model()

# إعدادات الاختبار
NUM_USERS = 10  # عدد المستخدمين المتزامنين
NUM_REQUESTS = 100  # عدد الطلبات لكل مستخدم
ENDPOINTS = [
    'core:home',
    'core:client_list',
    'core:leave_invoice_list',
    'core:payment_list',
]

# قائمة لتخزين أوقات الاستجابة
response_times = []

# قفل للتزامن
lock = threading.Lock()

def login_user(client, username, password):
    """تسجيل دخول المستخدم"""
    return client.login(username=username, password=password)

def make_request(client, endpoint):
    """إرسال طلب إلى نقطة النهاية المحددة وقياس وقت الاستجابة"""
    url = reverse(endpoint)
    start_time = time.time()
    response = client.get(url)
    end_time = time.time()
    
    response_time = (end_time - start_time) * 1000  # تحويل إلى مللي ثانية
    
    with lock:
        response_times.append(response_time)
    
    return response.status_code, response_time

def user_session(user_id):
    """محاكاة جلسة مستخدم"""
    username = f'testuser{user_id}'
    password = 'testpassword'
    
    # إنشاء مستخدم إذا لم يكن موجودًا
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username,
            email=f'testuser{user_id}@example.com',
            password=password
        )
    
    # إنشاء عميل اختبار
    client = Client()
    
    # تسجيل دخول المستخدم
    if not login_user(client, username, password):
        print(f"فشل تسجيل دخول المستخدم {username}")
        return
    
    # إرسال طلبات متعددة
    for _ in range(NUM_REQUESTS):
        endpoint = random.choice(ENDPOINTS)
        status_code, response_time = make_request(client, endpoint)
        
        if status_code != 200:
            print(f"خطأ في الطلب: {endpoint}, الحالة: {status_code}")

def run_load_test():
    """تشغيل اختبار الحمل"""
    print(f"بدء اختبار الحمل مع {NUM_USERS} مستخدم متزامن و {NUM_REQUESTS} طلب لكل مستخدم")
    print(f"إجمالي الطلبات: {NUM_USERS * NUM_REQUESTS}")
    
    start_time = time.time()
    
    # إنشاء مجموعة من المواضيع لمحاكاة المستخدمين المتزامنين
    with ThreadPoolExecutor(max_workers=NUM_USERS) as executor:
        executor.map(user_session, range(NUM_USERS))
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # حساب الإحصائيات
    if response_times:
        avg_response_time = statistics.mean(response_times)
        median_response_time = statistics.median(response_times)
        min_response_time = min(response_times)
        max_response_time = max(response_times)
        p95_response_time = sorted(response_times)[int(len(response_times) * 0.95)]
        
        # طباعة النتائج
        print("\nنتائج اختبار الحمل:")
        print(f"إجمالي الوقت: {total_time:.2f} ثانية")
        print(f"متوسط وقت الاستجابة: {avg_response_time:.2f} مللي ثانية")
        print(f"وسيط وقت الاستجابة: {median_response_time:.2f} مللي ثانية")
        print(f"أقل وقت استجابة: {min_response_time:.2f} مللي ثانية")
        print(f"أعلى وقت استجابة: {max_response_time:.2f} مللي ثانية")
        print(f"وقت الاستجابة عند النسبة المئوية 95: {p95_response_time:.2f} مللي ثانية")
        print(f"الطلبات في الثانية: {(NUM_USERS * NUM_REQUESTS) / total_time:.2f}")
    else:
        print("لم يتم تسجيل أي أوقات استجابة")

if __name__ == "__main__":
    run_load_test()
