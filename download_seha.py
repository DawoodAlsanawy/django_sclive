"""
سكريبت لتنزيل موقع seha.sa وحفظه محليًا باستخدام Selenium
"""
import os
import shutil
import sys
import time
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

# إنشاء مجلد لحفظ الموقع
output_dir = 'seha_website'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# قائمة الروابط التي تم زيارتها
visited_urls = set()
# قائمة الروابط التي يجب زيارتها
urls_to_visit = ['https://seha.sa']
# قائمة ملفات الأصول (CSS, JS, الصور)
assets = set()

# إعداد متصفح Chrome
def setup_driver():
    """إعداد متصفح Chrome للتصفح الآلي مع إعدادات متقدمة للتغلب على حماية المواقع"""
    chrome_options = Options()

    # إعدادات أساسية
    chrome_options.add_argument("--headless")  # تشغيل المتصفح بدون واجهة
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")

    # إعدادات متقدمة للتغلب على حماية المواقع
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)

    # تعيين User-Agent مشابه للمتصفحات العادية
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36")

    # إضافة المزيد من الـ Headers
    chrome_options.add_argument("--accept-language=ar-SA,ar;q=0.9,en-US;q=0.8,en;q=0.7")

    # تعطيل الصور لتسريع التنزيل
    chrome_prefs = {
        "profile.default_content_setting_values": {
            "images": 2,  # 2 = block images
            "notifications": 2  # 2 = block notifications
        },
        "profile.managed_default_content_settings.images": 2
    }
    chrome_options.add_experimental_option("prefs", chrome_prefs)

    print("جاري تثبيت وإعداد ChromeDriver...")

    try:
        # تثبيت وإعداد ChromeDriver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)

        # تعيين مهلة تحميل الصفحة
        driver.set_page_load_timeout(45)

        # تعديل الـ navigator.webdriver للتغلب على كشف الروبوتات
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

        print("تم إعداد المتصفح بنجاح!")
        return driver
    except Exception as e:
        print(f"حدث خطأ أثناء إعداد المتصفح: {e}")
        raise

# إنشاء متصفح Chrome
try:
    driver = setup_driver()
except Exception as e:
    print(f"فشل في إنشاء المتصفح: {e}")
    sys.exit(1)

def is_valid_url(url):
    """التحقق مما إذا كان الرابط صالحًا وينتمي إلى نفس الموقع"""
    parsed = urlparse(url)
    return bool(parsed.netloc) and parsed.netloc.endswith('seha.sa')

def download_page(url):
    """تنزيل صفحة ويب وحفظها محليًا باستخدام Selenium مع معالجة محسنة للأخطاء"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"تنزيل: {url} (محاولة {attempt+1}/{max_retries})")

            # استخدام Selenium للوصول إلى الصفحة
            driver.get(url)

            # انتظار تحميل الصفحة (يمكن زيادة الوقت إذا كانت الصفحة بطيئة)
            wait_time = 8  # زيادة وقت الانتظار للتأكد من تحميل الصفحة بالكامل
            print(f"انتظار {wait_time} ثوانٍ لتحميل الصفحة...")
            time.sleep(wait_time)

            # التحقق من أن الصفحة تم تحميلها بشكل صحيح
            if "You need to enable JavaScript to run this app" in driver.page_source:
                print("تم اكتشاف رسالة JavaScript - محاولة تنفيذ سكريبت إضافي...")
                # محاولة تنفيذ بعض السكريبتات لتجاوز الحماية
                driver.execute_script("document.body.style.display='block';")
                time.sleep(3)  # انتظار إضافي بعد تنفيذ السكريبت

            # الحصول على محتوى الصفحة بعد تنفيذ JavaScript
            page_source = driver.page_source

            # التحقق من أن الصفحة تحتوي على محتوى مفيد
            if len(page_source) < 500 or "403 Forbidden" in page_source:
                if attempt < max_retries - 1:
                    print(f"محتوى الصفحة قصير جدًا أو محظور. إعادة المحاولة...")
                    time.sleep(5)  # انتظار قبل إعادة المحاولة
                    continue
                else:
                    print(f"فشلت جميع المحاولات لتنزيل {url}")
                    return set()

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
                f.write(page_source)

            print(f"تم حفظ الصفحة في: {local_path}")

            # استخدام BeautifulSoup لتحليل HTML
            soup = BeautifulSoup(page_source, 'html.parser')

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

            # تنزيل الصور المضمنة في الصفحة
            for img in soup.find_all('img'):
                if img.has_attr('src'):
                    img_url = urljoin(url, img['src'])
                    assets.add(img_url)

            print(f"تم العثور على {len(links)} رابط و {len(assets)} ملف أصول في الصفحة")
            return links

        except TimeoutException:
            print(f"انتهت مهلة تحميل الصفحة {url}. محاولة {attempt+1}/{max_retries}")
            if attempt < max_retries - 1:
                time.sleep(5)  # انتظار قبل إعادة المحاولة
                continue
        except WebDriverException as e:
            print(f"خطأ في متصفح Selenium: {e}")
            # محاولة إعادة تشغيل المتصفح في حالة حدوث خطأ
            try:
                print("إعادة تشغيل المتصفح...")
                driver.quit()
                driver = setup_driver()
                if attempt < max_retries - 1:
                    continue
            except Exception as e2:
                print(f"فشل في إعادة تشغيل المتصفح: {e2}")
        except Exception as e:
            print(f"خطأ غير متوقع في تنزيل {url}: {e}")
            if attempt < max_retries - 1:
                time.sleep(5)  # انتظار قبل إعادة المحاولة
                continue

    print(f"فشلت جميع المحاولات لتنزيل {url}")
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
                response.raise_for_status()  # رفع استثناء في حالة فشل الطلب
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
            query_filename = parsed_url.query.replace('=', '_').replace('&', '_')
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

def main():
    """الدالة الرئيسية لتنزيل الموقع مع معالجة محسنة للأخطاء والتقدم"""
    max_pages = 50  # تقليل الحد الأقصى لعدد الصفحات للتنزيل لتسريع العملية
    page_count = 0
    failed_urls = []  # قائمة بالروابط التي فشل تنزيلها
    start_time = time.time()  # وقت بدء التنزيل

    try:
        print("\n" + "="*50)
        print("بدء تنزيل موقع seha.sa...")
        print("="*50)
        print(f"الحد الأقصى للصفحات: {max_pages}")
        print(f"مجلد الحفظ: {os.path.abspath(output_dir)}")
        print("="*50 + "\n")

        # تنزيل الصفحة الرئيسية أولاً
        print("تنزيل الصفحة الرئيسية...")
        home_links = download_page('https://seha.sa')
        visited_urls.add('https://seha.sa')
        page_count += 1

        # إضافة روابط الصفحة الرئيسية إلى قائمة الانتظار
        for link in home_links:
            if link not in visited_urls and is_valid_url(link):
                urls_to_visit.append(link)

        print(f"تم العثور على {len(urls_to_visit)} رابط في الصفحة الرئيسية")

        # تنزيل باقي الصفحات
        while urls_to_visit and page_count < max_pages:
            # عرض تقدم التنزيل
            progress = (page_count / max_pages) * 100
            elapsed_time = time.time() - start_time
            print("\n" + "-"*50)
            print(f"التقدم: {progress:.1f}% ({page_count}/{max_pages})")
            print(f"الوقت المنقضي: {elapsed_time:.1f} ثانية")
            print(f"الروابط المتبقية: {len(urls_to_visit)}")
            print("-"*50)

            # الحصول على الرابط التالي
            url = urls_to_visit.pop(0)
            if url not in visited_urls and is_valid_url(url):
                # تنزيل الصفحة
                links = download_page(url)

                if links:  # إذا نجح التنزيل
                    visited_urls.add(url)
                    page_count += 1

                    # إضافة روابط جديدة إلى قائمة الانتظار
                    new_links_count = 0
                    for link in links:
                        if link not in visited_urls and link not in urls_to_visit and is_valid_url(link):
                            urls_to_visit.append(link)
                            new_links_count += 1

                    print(f"تمت إضافة {new_links_count} رابط جديد إلى قائمة الانتظار")
                else:
                    # إذا فشل التنزيل، أضف الرابط إلى قائمة الروابط الفاشلة
                    failed_urls.append(url)
                    print(f"فشل تنزيل: {url}")

                # انتظار قليلاً لتجنب الحظر
                wait_time = 3
                print(f"انتظار {wait_time} ثوانٍ قبل تنزيل الصفحة التالية...")
                time.sleep(wait_time)

        print("\n" + "="*50)
        print(f"اكتمل تنزيل الصفحات: {page_count} صفحة")
        if failed_urls:
            print(f"فشل تنزيل {len(failed_urls)} رابط:")
            for i, url in enumerate(failed_urls[:10]):  # عرض أول 10 روابط فاشلة فقط
                print(f"  {i+1}. {url}")
            if len(failed_urls) > 10:
                print(f"  ... و{len(failed_urls)-10} رابط آخر")

        print("\nجاري تنزيل الأصول (CSS, JS, الصور)...")

        # تنزيل الأصول
        asset_count = 0
        total_assets = len(assets)
        print(f"إجمالي الأصول المكتشفة: {total_assets}")

        for i, asset_url in enumerate(assets):
            # عرض تقدم تنزيل الأصول
            if i % 10 == 0:  # عرض التقدم كل 10 أصول
                progress = (i / total_assets) * 100
                print(f"تقدم تنزيل الأصول: {progress:.1f}% ({i}/{total_assets})")

            if download_asset(asset_url):
                asset_count += 1
                # انتظار قليلاً بين تنزيل الأصول
                time.sleep(0.2)  # تقليل وقت الانتظار لتسريع التنزيل

        # حساب الوقت الإجمالي
        total_time = time.time() - start_time
        minutes = int(total_time // 60)
        seconds = int(total_time % 60)

        print("\n" + "="*50)
        print(f"تم الانتهاء من تنزيل {page_count} صفحة و {asset_count}/{total_assets} ملف أصول.")
        print(f"الوقت المستغرق: {minutes} دقيقة و {seconds} ثانية")
        print(f"تم حفظ الموقع في المجلد: {os.path.abspath(output_dir)}")
        print("="*50)

        # إنشاء ملف index.html للوصول السهل
        create_index_file()

        # إغلاق متصفح Selenium
        print("\nإغلاق متصفح Selenium...")
        driver.quit()

        # تشغيل خادم ويب محلي
        start_local_server()

    except KeyboardInterrupt:
        print("\n" + "="*50)
        print("تم إيقاف التنزيل بواسطة المستخدم.")
        print(f"تم تنزيل {page_count} صفحة قبل الإيقاف.")
        print("="*50)

        # إغلاق متصفح Selenium
        try:
            driver.quit()
        except:
            pass

        # سؤال المستخدم إذا كان يريد تشغيل الخادم المحلي
        try:
            choice = input("\nهل تريد تشغيل الخادم المحلي لعرض ما تم تنزيله؟ (y/n): ")
            if choice.lower() == 'y':
                create_index_file()
                start_local_server()
        except:
            pass

    except Exception as e:
        print("\n" + "="*50)
        print(f"حدث خطأ أثناء تنزيل الموقع: {e}")
        print(f"تم تنزيل {page_count} صفحة قبل حدوث الخطأ.")
        print("="*50)

        # إغلاق متصفح Selenium
        try:
            driver.quit()
        except:
            pass

def start_local_server():
    """تشغيل خادم ويب محلي لعرض الموقع"""
    import http.server
    import socketserver
    import webbrowser

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

def create_index_file():
    """إنشاء ملف index.html في المجلد الرئيسي للوصول السهل"""
    index_path = os.path.join(output_dir, 'index.html')

    # إنشاء قائمة بالصفحات التي تم تنزيلها
    page_links = []
    for url in visited_urls:
        parsed_url = urlparse(url)
        if parsed_url.netloc.endswith('seha.sa'):
            page_links.append({
                'url': url,
                'path': parsed_url.path or '/',
                'title': parsed_url.path or 'الصفحة الرئيسية'
            })

    # ترتيب الصفحات حسب المسار
    page_links.sort(key=lambda x: x['path'])

    # إنشاء HTML للصفحة
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
        h2 {
            color: #0078d4;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
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
        .pages-list {
            background-color: white;
            border-radius: 5px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .page-link {
            display: block;
            padding: 10px;
            border-bottom: 1px solid #eee;
            text-decoration: none;
            color: #333;
        }
        .page-link:hover {
            background-color: #f5f5f5;
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

        <a href="seha.sa/index.html" class="main-link">فتح الصفحة الرئيسية</a>

        <div class="pages-list">
            <h2>الصفحات المتاحة</h2>
"""

    # إضافة روابط الصفحات
    for page in page_links:
        local_path = f"seha.sa{page['path']}"
        if local_path.endswith('/'):
            local_path += 'index.html'
        elif not os.path.splitext(local_path)[1]:
            local_path += '.html'

        html_content += f'            <a href="{local_path}" class="page-link">{page["title"]}</a>\n'

    html_content += """
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

if __name__ == "__main__":
    main()
