"""
سكريبت بسيط لتنزيل موقع seha.sa وحفظه محليًا
"""
import os
import sys
import time
import requests
import shutil
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import http.server
import socketserver
import webbrowser
import re

# إنشاء مجلد لحفظ الموقع
output_dir = 'seha_website'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# قائمة الروابط التي تم زيارتها
visited_urls = set()
# قائمة ملفات الأصول (CSS, JS, الصور)
assets = set()

def is_valid_url(url):
    """التحقق مما إذا كان الرابط صالحًا وينتمي إلى نفس الموقع"""
    parsed = urlparse(url)
    return bool(parsed.netloc) and parsed.netloc.endswith('seha.sa')

def download_page(url):
    """تنزيل صفحة ويب وحفظها محليًا"""
    try:
        print(f"تنزيل: {url}")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://seha.sa/',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        }
        
        # محاولة التنزيل مع إعادة المحاولة
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=headers, timeout=15)
                response.raise_for_status()
                break
            except (requests.exceptions.RequestException, requests.exceptions.HTTPError) as e:
                if attempt < max_retries - 1:
                    print(f"فشل في المحاولة {attempt+1} لتنزيل {url}: {e}. إعادة المحاولة...")
                    time.sleep(2)
                else:
                    raise
        
        # تحديد اسم الملف المحلي
        parsed_url = urlparse(url)
        local_path = os.path.join(output_dir, parsed_url.netloc + parsed_url.path)
        
        # التعامل مع المسارات التي تنتهي بـ /
        if parsed_url.path.endswith('/') or not parsed_url.path:
            local_path = os.path.join(local_path, 'index.html')
        elif not os.path.splitext(parsed_url.path)[1]:
            local_path = local_path + '.html'
            
        # إنشاء المجلدات اللازمة
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        # حفظ محتوى الصفحة
        with open(local_path, 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        # استخدام BeautifulSoup لتحليل HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # استخراج الروابط من الصفحة
        links = set()
        for a_tag in soup.find_all('a', href=True):
            link = a_tag['href']
            # تحويل الروابط النسبية إلى روابط مطلقة
            absolute_link = urljoin(url, link)
            if is_valid_url(absolute_link):
                links.add(absolute_link)
        
        # استخراج روابط الأصول (CSS, JS, الصور)
        for tag in soup.find_all(['link', 'script', 'img']):
            if tag.has_attr('src'):
                asset_url = urljoin(url, tag['src'])
                assets.add(asset_url)
            elif tag.has_attr('href') and tag.get('rel') == ['stylesheet']:
                asset_url = urljoin(url, tag['href'])
                assets.add(asset_url)
        
        return links
    
    except Exception as e:
        print(f"خطأ في تنزيل {url}: {e}")
        return set()

def download_asset(url):
    """تنزيل ملف أصول (CSS, JS, صورة) وحفظه محليًا"""
    try:
        print(f"تنزيل الأصل: {url}")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://seha.sa/'
        }
        
        # محاولة التنزيل مع إعادة المحاولة
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()
                break
            except (requests.exceptions.RequestException, requests.exceptions.HTTPError) as e:
                if attempt < max_retries - 1:
                    print(f"فشل في المحاولة {attempt+1} لتنزيل {url}: {e}. إعادة المحاولة...")
                    time.sleep(2)
                else:
                    raise
        
        # تحديد اسم الملف المحلي
        parsed_url = urlparse(url)
        local_path = os.path.join(output_dir, parsed_url.netloc + parsed_url.path)
        
        # التعامل مع المسارات التي تحتوي على معلمات استعلام
        if parsed_url.query:
            # إنشاء اسم ملف آمن من معلمات الاستعلام
            query_filename = re.sub(r'[^\w\-_]', '_', parsed_url.query)
            base, ext = os.path.splitext(local_path)
            if ext:
                local_path = f"{base}_{query_filename}{ext}"
            else:
                local_path = f"{local_path}_{query_filename}"
        
        # إنشاء المجلدات اللازمة
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        # حفظ محتوى الملف
        with open(local_path, 'wb') as f:
            f.write(response.content)
            
        return local_path
            
    except Exception as e:
        print(f"خطأ في تنزيل الأصل {url}: {e}")
        return None

def create_index_file():
    """إنشاء ملف index.html في المجلد الرئيسي للوصول السهل"""
    index_path = os.path.join(output_dir, 'index.html')
    
    html_content = """
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>موقع صحة المحلي</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5; 
            color: #333; 
            direction: rtl;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            background-color: #0078d4;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        h1 { margin: 0; }
        .main-link {
            display: block;
            background-color: #0078d4;
            color: white;
            text-align: center;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 18px;
            text-decoration: none;
            font-weight: bold;
        }
        .main-link:hover {
            background-color: #005a9e;
        }
        .info-box {
            background-color: white;
            border-radius: 5px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        footer {
            margin-top: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>موقع صحة المحلي</h1>
            <p>نسخة محلية من موقع صحة</p>
        </header>
        
        <div class="info-box">
            <p>هذه نسخة محلية من موقع صحة. يمكنك تصفح الموقع بالنقر على الرابط أدناه:</p>
            <a href="seha.sa/index.html" class="main-link">فتح موقع صحة</a>
            <p>ملاحظة: قد لا تعمل بعض الميزات التفاعلية في النسخة المحلية.</p>
        </div>
        
        <footer>
            <p>تم إنشاء هذه النسخة المحلية باستخدام سكريبت Python</p>
        </footer>
    </div>
</body>
</html>
"""
    
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

def start_local_server():
    """تشغيل خادم ويب محلي لعرض الموقع"""
    # تغيير المجلد الحالي إلى مجلد الموقع
    os.chdir(output_dir)
    
    # إنشاء خادم HTTP بسيط
    PORT = 8000
    Handler = http.server.SimpleHTTPRequestHandler
    
    print(f"\nجاري تشغيل خادم ويب محلي على المنفذ {PORT}...")
    print(f"يمكنك الوصول إلى الموقع من خلال: http://localhost:{PORT}")
    print("اضغط Ctrl+C لإيقاف الخادم")
    
    # فتح المتصفح تلقائيًا
    webbrowser.open(f"http://localhost:{PORT}")
    
    # تشغيل الخادم
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nتم إيقاف الخادم.")
            httpd.shutdown()
