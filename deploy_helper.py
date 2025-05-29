#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Django Sick Leave Management System
Python Deployment Helper for sehea.net
مساعد النشر بـ Python لموقع sehea.net
"""

import os
import sys
import subprocess
import json
import requests
import time
from pathlib import Path
from datetime import datetime

class SeheaDeploymentHelper:
    """مساعد النشر التلقائي لموقع sehea.net"""
    
    def __init__(self):
        self.domain = "sehea.net"
        self.project_name = "sclive"
        self.cpanel_username = os.getenv('USER', 'unknown')
        self.home_dir = Path.home()
        self.public_html = self.home_dir / "public_html"
        self.project_dir = self.public_html / self.project_name
        self.log_file = self.home_dir / "deployment_python.log"
        
    def log(self, message, level="INFO"):
        """تسجيل الرسائل"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] [{level}] {message}"
        print(log_message)
        
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(log_message + "\n")
    
    def run_command(self, command, check=True):
        """تنفيذ أوامر النظام"""
        self.log(f"Executing: {command}")
        try:
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True, 
                check=check
            )
            if result.stdout:
                self.log(f"Output: {result.stdout.strip()}")
            return result
        except subprocess.CalledProcessError as e:
            self.log(f"Command failed: {e}", "ERROR")
            if e.stderr:
                self.log(f"Error: {e.stderr.strip()}", "ERROR")
            raise
    
    def check_domain_dns(self):
        """فحص إعدادات DNS للدومين"""
        self.log("Checking DNS configuration for sehea.net...")
        
        try:
            # فحص A record
            result = self.run_command(f"nslookup {self.domain}")
            if "Address:" in result.stdout:
                self.log("✓ DNS A record found")
            else:
                self.log("⚠ DNS A record not found", "WARNING")
            
            # فحص WWW record
            result = self.run_command(f"nslookup www.{self.domain}")
            if "Address:" in result.stdout:
                self.log("✓ DNS WWW record found")
            else:
                self.log("⚠ DNS WWW record not found", "WARNING")
                
        except Exception as e:
            self.log(f"DNS check failed: {e}", "ERROR")
    
    def setup_ssl_letsencrypt(self):
        """إعداد شهادة Let's Encrypt SSL"""
        self.log("Setting up Let's Encrypt SSL certificate...")
        
        try:
            # التحقق من وجود certbot
            self.run_command("which certbot")
            
            # الحصول على شهادة SSL
            certbot_command = (
                f"certbot certonly --webroot "
                f"-w {self.public_html} "
                f"-d {self.domain} "
                f"-d www.{self.domain} "
                f"--email admin@{self.domain} "
                f"--agree-tos --non-interactive"
            )
            
            result = self.run_command(certbot_command, check=False)
            
            if result.returncode == 0:
                self.log("✓ Let's Encrypt SSL certificate obtained successfully")
                
                # إعداد التجديد التلقائي
                cron_command = (
                    '(crontab -l 2>/dev/null; echo "0 12 * * * '
                    '/usr/bin/certbot renew --quiet") | crontab -'
                )
                self.run_command(cron_command)
                self.log("✓ SSL auto-renewal configured")
                
                return True
            else:
                self.log("Let's Encrypt failed, will use self-signed certificate", "WARNING")
                return False
                
        except Exception as e:
            self.log(f"Let's Encrypt setup failed: {e}", "ERROR")
            return False
    
    def create_ssl_certificate(self):
        """إنشاء شهادة SSL (Let's Encrypt أو self-signed)"""
        self.log("Creating SSL certificate...")
        
        # محاولة الحصول على Let's Encrypt أولاً
        if self.setup_ssl_letsencrypt():
            return True
        
        # إنشاء شهادة self-signed كبديل
        ssl_dir = self.home_dir / "ssl"
        ssl_dir.mkdir(exist_ok=True)
        
        # إنشاء المفتاح الخاص
        key_file = ssl_dir / f"{self.domain}.key"
        csr_file = ssl_dir / f"{self.domain}.csr"
        crt_file = ssl_dir / f"{self.domain}.crt"
        
        # إنشاء ملف التكوين
        config_content = f"""[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = SA
ST = Riyadh
L = Riyadh
O = Sehea Medical Care
OU = IT Department
CN = {self.domain}

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = {self.domain}
DNS.2 = www.{self.domain}
"""
        
        config_file = ssl_dir / "ssl.conf"
        with open(config_file, "w") as f:
            f.write(config_content)
        
        # إنشاء المفتاح الخاص
        self.run_command(f"openssl genrsa -out {key_file} 2048")
        
        # إنشاء طلب الشهادة
        self.run_command(
            f"openssl req -new -key {key_file} -out {csr_file} -config {config_file}"
        )
        
        # إنشاء الشهادة
        self.run_command(
            f"openssl x509 -req -days 365 -in {csr_file} -signkey {key_file} "
            f"-out {crt_file} -extensions v3_req -extfile {config_file}"
        )
        
        # تعيين الصلاحيات
        self.run_command(f"chmod 600 {key_file}")
        self.run_command(f"chmod 644 {crt_file}")
        
        self.log("✓ Self-signed SSL certificate created")
        self.log(f"Certificate: {crt_file}")
        self.log(f"Private Key: {key_file}")
        
        return True
    
    def test_website(self):
        """اختبار الموقع"""
        self.log("Testing website accessibility...")
        
        urls_to_test = [
            f"http://{self.domain}",
            f"https://{self.domain}",
            f"http://www.{self.domain}",
            f"https://www.{self.domain}"
        ]
        
        for url in urls_to_test:
            try:
                response = requests.get(url, timeout=10, allow_redirects=True)
                self.log(f"✓ {url} - Status: {response.status_code}")
                
                if response.status_code == 200:
                    # فحص محتوى الصفحة
                    if "Django" in response.text or "sclive" in response.text:
                        self.log(f"✓ Django application detected at {url}")
                    else:
                        self.log(f"⚠ Unexpected content at {url}", "WARNING")
                        
            except requests.exceptions.RequestException as e:
                self.log(f"✗ {url} - Error: {e}", "ERROR")
    
    def setup_monitoring(self):
        """إعداد مراقبة الموقع"""
        self.log("Setting up website monitoring...")
        
        # إنشاء سكريبت مراقبة
        monitor_script = self.home_dir / "monitor_sehea.py"
        
        monitor_content = f'''#!/usr/bin/env python3
import requests
import smtplib
from email.mime.text import MIMEText
from datetime import datetime

def check_website():
    try:
        response = requests.get("https://{self.domain}", timeout=30)
        if response.status_code == 200:
            print(f"✓ Website is up - {{datetime.now()}}")
            return True
        else:
            print(f"✗ Website returned {{response.status_code}} - {{datetime.now()}}")
            return False
    except Exception as e:
        print(f"✗ Website is down: {{e}} - {{datetime.now()}}")
        return False

def send_alert(message):
    try:
        msg = MIMEText(message)
        msg['Subject'] = 'sehea.net Alert'
        msg['From'] = 'monitor@{self.domain}'
        msg['To'] = 'admin@{self.domain}'
        
        # Configure SMTP settings here
        # server = smtplib.SMTP('mail.{self.domain}', 587)
        # server.starttls()
        # server.login('monitor@{self.domain}', 'password')
        # server.send_message(msg)
        # server.quit()
        
        print(f"Alert would be sent: {{message}}")
    except Exception as e:
        print(f"Failed to send alert: {{e}}")

if __name__ == "__main__":
    if not check_website():
        send_alert("Website {self.domain} is down!")
'''
        
        with open(monitor_script, "w") as f:
            f.write(monitor_content)
        
        self.run_command(f"chmod +x {monitor_script}")
        
        # إضافة مراقبة كل 5 دقائق
        cron_command = (
            '(crontab -l 2>/dev/null; echo "*/5 * * * * '
            f'{monitor_script} >> {self.home_dir}/monitor.log 2>&1") | crontab -'
        )
        self.run_command(cron_command)
        
        self.log("✓ Website monitoring configured")
    
    def optimize_performance(self):
        """تحسين أداء الموقع"""
        self.log("Optimizing website performance...")
        
        # تحسين قاعدة البيانات
        try:
            os.chdir(self.project_dir)
            
            # تحسين جداول قاعدة البيانات
            self.run_command(
                "python3 manage.py shell -c \""
                "from django.db import connection; "
                "cursor = connection.cursor(); "
                "cursor.execute('OPTIMIZE TABLE core_patient, core_doctor, core_hospital, core_sickleave, core_companionleave'); "
                "print('Database optimized')\""
            )
            
            self.log("✓ Database optimized")
            
        except Exception as e:
            self.log(f"Database optimization failed: {e}", "WARNING")
        
        # تحسين الملفات الثابتة
        try:
            # ضغط ملفات CSS و JS
            static_dir = self.project_dir / "staticfiles"
            if static_dir.exists():
                self.run_command(f"find {static_dir} -name '*.css' -exec gzip -k {{}} \\;")
                self.run_command(f"find {static_dir} -name '*.js' -exec gzip -k {{}} \\;")
                self.log("✓ Static files compressed")
                
        except Exception as e:
            self.log(f"Static files optimization failed: {e}", "WARNING")
    
    def create_deployment_report(self):
        """إنشاء تقرير النشر"""
        self.log("Creating deployment report...")
        
        report_file = self.home_dir / "sehea_deployment_report.txt"
        
        report_content = f"""
========================================
sehea.net Deployment Report
========================================
Deployment Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Domain: {self.domain}
Project: {self.project_name}
cPanel User: {self.cpanel_username}

Directories:
- Project: {self.project_dir}
- Public HTML: {self.public_html}
- Home: {self.home_dir}

Files Created:
- SSL Certificate: {self.home_dir}/ssl/{self.domain}.crt
- SSL Private Key: {self.home_dir}/ssl/{self.domain}.key
- Environment File: {self.project_dir}/.env
- WSGI File: {self.public_html}/index.py
- Backup Script: {self.home_dir}/backup_sclive.sh
- Monitor Script: {self.home_dir}/monitor_sehea.py

URLs to Test:
- https://{self.domain}
- https://www.{self.domain}
- https://{self.domain}/admin/

Next Steps:
1. Install SSL certificate in cPanel
2. Create email accounts in cPanel
3. Configure DNS if needed
4. Test all functionality
5. Set up regular backups

Support:
- Email: support@{self.domain}
- Documentation: {self.project_dir}/README.md
- Logs: {self.log_file}

========================================
"""
        
        with open(report_file, "w", encoding="utf-8") as f:
            f.write(report_content)
        
        self.log(f"✓ Deployment report created: {report_file}")
    
    def run_full_deployment(self):
        """تنفيذ النشر الكامل"""
        self.log("Starting full deployment for sehea.net...")
        
        try:
            # فحص DNS
            self.check_domain_dns()
            
            # إنشاء شهادة SSL
            self.create_ssl_certificate()
            
            # اختبار الموقع
            time.sleep(5)  # انتظار قليل
            self.test_website()
            
            # إعداد المراقبة
            self.setup_monitoring()
            
            # تحسين الأداء
            self.optimize_performance()
            
            # إنشاء التقرير
            self.create_deployment_report()
            
            self.log("🎉 Full deployment completed successfully!")
            
        except Exception as e:
            self.log(f"Deployment failed: {e}", "ERROR")
            raise

def main():
    """الدالة الرئيسية"""
    if len(sys.argv) > 1:
        if sys.argv[1] in ['--help', '-h']:
            print("Usage: python3 deploy_helper.py [option]")
            print("Options:")
            print("  --help, -h    Show this help")
            print("  --ssl         Setup SSL only")
            print("  --test        Test website only")
            print("  --monitor     Setup monitoring only")
            print("  --optimize    Optimize performance only")
            return
    
    helper = SeheaDeploymentHelper()
    
    if len(sys.argv) > 1:
        option = sys.argv[1]
        if option == '--ssl':
            helper.create_ssl_certificate()
        elif option == '--test':
            helper.test_website()
        elif option == '--monitor':
            helper.setup_monitoring()
        elif option == '--optimize':
            helper.optimize_performance()
        else:
            print(f"Unknown option: {option}")
    else:
        helper.run_full_deployment()

if __name__ == "__main__":
    main()
