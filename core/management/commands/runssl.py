import os
import ssl
from socketserver import ThreadingMixIn
from wsgiref.simple_server import WSGIRequestHandler, WSGIServer

from django.core.management.commands.runserver import \
    Command as RunserverCommand
from django.core.servers.basehttp import get_internal_wsgi_application


# 🧠 دالة لتفكيك addr:port
def parse_addrport(addrport):
    if not addrport:
        return '127.0.0.1', 8000
    if ':' in addrport:
        addr, port = addrport.split(':', 1)
        return addr, int(port)
    return addrport, 8000


# 🔐 سيرفر يدعم SSL
class SSLWSGIServer(ThreadingMixIn, WSGIServer):
    def __init__(self, *args, certfile=None, keyfile=None, **kwargs):
        self.certfile = certfile
        self.keyfile = keyfile
        super().__init__(*args, **kwargs)

    def server_bind(self):
        # ✅ التحقق من وجود ملفات الشهادة والمفتاح قبل المتابعة
        if not (self.certfile and os.path.isfile(self.certfile)):
            raise FileNotFoundError(f"SSL certificate file not found: {self.certfile}")
        if not (self.keyfile and os.path.isfile(self.keyfile)):
            raise FileNotFoundError(f"SSL key file not found: {self.keyfile}")

        super().server_bind()
        self.socket = ssl.wrap_socket(
            self.socket,
            certfile=self.certfile,
            keyfile=self.keyfile,
            server_side=True,
            ssl_version=ssl.PROTOCOL_TLS
        )


# ⚙️ أمر Django لتشغيل HTTPS
class Command(RunserverCommand):
    help = "Starts a lightweight Web server over HTTPS for development with SSL support."

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument('--cert', help='Path to SSL certificate file (e.g. cert.pem)')
        parser.add_argument('--key', help='Path to SSL private key file (e.g. key.pem)')

    def handle(self, *args, **options):
        certfile = options.get('cert')
        keyfile = options.get('key')

        if certfile and keyfile:
            # ✅ التحقق من وجود الملفات قبل محاولة تشغيل السيرفر
            if not os.path.isfile(certfile):
                self.stderr.write(self.style.ERROR(f"❌ Certificate file not found: {certfile}"))
                return
            if not os.path.isfile(keyfile):
                self.stderr.write(self.style.ERROR(f"❌ Key file not found: {keyfile}"))
                return

            self.stdout.write(self.style.SUCCESS("🔒 Starting HTTPS server with SSL..."))

            addrport = options.get('addrport') or '127.0.0.1:8000'
            addr, port = parse_addrport(addrport)

            application = get_internal_wsgi_application()
            server_address = (addr, port)

            httpd = SSLWSGIServer(
                server_address,
                WSGIRequestHandler,
                certfile=certfile,
                keyfile=keyfile
            )
            httpd.set_app(application)

            self.stdout.write(f"✅ Serving HTTPS on https://{addr}:{port}")
            httpd.serve_forever()
        else:
            self.stdout.write(self.style.WARNING("⚠️  SSL certificate or key not provided. Falling back to HTTP."))
            super().handle(*args, **options)
