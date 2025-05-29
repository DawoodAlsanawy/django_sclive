#!/bin/bash

# ========================================
# Django Sick Leave Management System
# Automated Deployment Script for Namecheap
# سكريبت النشر التلقائي لـ Namecheap
# Domain: sehea.net
# ========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="sehea.net"
PROJECT_NAME="sclive"
CPANEL_USERNAME=""  # Will be detected automatically
DB_PASSWORD=""      # Will be generated automatically
EMAIL_PASSWORD=""   # Will be generated automatically

# Paths
HOME_DIR="/home/$(whoami)"
PUBLIC_HTML="$HOME_DIR/public_html"
PROJECT_DIR="$PUBLIC_HTML/$PROJECT_NAME"
BACKUP_DIR="$HOME_DIR/backups"
LOG_FILE="$HOME_DIR/deployment.log"

# ========================================
# Utility Functions
# ========================================

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOG_FILE"
}

generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# ========================================
# Pre-deployment Checks
# ========================================

check_requirements() {
    log "Checking system requirements..."

    # Check if we're in the right environment
    if [[ ! -f "manage.py" ]]; then
        error "manage.py not found. Please run this script from the Django project root."
    fi

    # Detect cPanel username
    CPANEL_USERNAME=$(whoami)
    log "Detected cPanel username: $CPANEL_USERNAME"

    # Check Python version
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    log "Python version: $PYTHON_VERSION"

    # Check if required commands exist
    for cmd in mysql php curl; do
        if ! command -v $cmd &> /dev/null; then
            error "$cmd is not installed or not in PATH"
        fi
    done

    log "✓ All requirements met"
}

# ========================================
# Database Setup
# ========================================

setup_database() {
    log "Setting up MySQL database..."

    DB_NAME="${CPANEL_USERNAME}_sclive"
    DB_USER="${CPANEL_USERNAME}_sclive"
    DB_PASSWORD=$(generate_password)

    # Create database and user via MySQL
    mysql -u "$CPANEL_USERNAME" -p << EOF
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

    if [[ $? -eq 0 ]]; then
        log "✓ Database created successfully"
        log "Database: $DB_NAME"
        log "User: $DB_USER"
        echo "$DB_PASSWORD" > "$HOME_DIR/.db_password"
        chmod 600 "$HOME_DIR/.db_password"
    else
        error "Failed to create database"
    fi
}

# ========================================
# Project Deployment
# ========================================

deploy_project() {
    log "Deploying Django project..."

    # Create project directory
    mkdir -p "$PROJECT_DIR"
    mkdir -p "$PROJECT_DIR/logs"
    mkdir -p "$PROJECT_DIR/cache"
    mkdir -p "$BACKUP_DIR"

    # Copy project files (excluding unnecessary files)
    rsync -av --exclude='venv/' \
              --exclude='__pycache__/' \
              --exclude='*.pyc' \
              --exclude='.git/' \
              --exclude='node_modules/' \
              --exclude='*.log' \
              ./ "$PROJECT_DIR/"

    log "✓ Project files copied"
}

# ========================================
# Environment Configuration
# ========================================

setup_environment() {
    log "Setting up environment configuration..."

    # Generate secret key
    SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")

    # Generate email password
    EMAIL_PASSWORD=$(generate_password)

    # Create .env file
    cat > "$PROJECT_DIR/.env" << EOF
# ========================================
# Production Environment - sehea.net
# Generated on $(date)
# ========================================

# Django Core Settings
SECRET_KEY=$SECRET_KEY
DEBUG=False
ALLOWED_HOSTS=sehea.net,www.sehea.net,localhost,127.0.0.1

# Database Configuration
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_HOST=localhost
DB_PORT=3306

# Static and Media Files
STATIC_ROOT=$PROJECT_DIR/staticfiles
MEDIA_ROOT=$PROJECT_DIR/media

# Email Configuration
EMAIL_HOST=mail.sehea.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@sehea.net
EMAIL_HOST_PASSWORD=$EMAIL_PASSWORD
DEFAULT_FROM_EMAIL=نظام إدارة الإجازات المرضية <noreply@sehea.net>

# Security Settings
SECURE_SSL_REDIRECT=True

# Application Settings
COMPANY_NAME=شركة سهيا للرعاية الطبية
SUPPORT_EMAIL=support@sehea.net

# System Settings
ITEMS_PER_PAGE=25
LOG_LEVEL=INFO
LOG_DIR=$PROJECT_DIR/logs
CACHE_LOCATION=$PROJECT_DIR/cache
EOF

    chmod 600 "$PROJECT_DIR/.env"
    log "✓ Environment configuration created"

    # Save passwords securely
    echo "Email Password: $EMAIL_PASSWORD" >> "$HOME_DIR/.credentials"
    chmod 600 "$HOME_DIR/.credentials"
}

# ========================================
# Python Dependencies
# ========================================

install_dependencies() {
    log "Installing Python dependencies..."

    cd "$PROJECT_DIR"

    # Install dependencies
    python3 -m pip install --user -r requirements-production.txt

    if [[ $? -eq 0 ]]; then
        log "✓ Dependencies installed successfully"
    else
        error "Failed to install dependencies"
    fi
}

# ========================================
# Django Setup
# ========================================

setup_django() {
    log "Setting up Django application..."

    cd "$PROJECT_DIR"

    # Set Django settings module
    export DJANGO_SETTINGS_MODULE="sclive.settings_production"

    # Run migrations
    python3 manage.py migrate --settings=sclive.settings_production

    # Collect static files
    python3 manage.py collectstatic --noinput --settings=sclive.settings_production

    # Initialize database
    python3 manage.py init_db --settings=sclive.settings_production

    log "✓ Django setup completed"
}

# ========================================
# Web Server Configuration
# ========================================

setup_webserver() {
    log "Configuring web server..."

    # Copy .htaccess to public_html
    cp "$PROJECT_DIR/.htaccess" "$PUBLIC_HTML/.htaccess"

    # Create index.py in public_html
    cat > "$PUBLIC_HTML/index.py" << EOF
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Django WSGI Application for sehea.net
Auto-generated on $(date)
"""

import os
import sys
import django
from django.core.wsgi import get_wsgi_application

# Add project paths
sys.path.insert(0, '$PROJECT_DIR')
sys.path.insert(0, '$PROJECT_DIR/sclive')
sys.path.insert(0, '$HOME_DIR/.local/lib/python3.8/site-packages')

# Set environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sclive.settings_production')

# Load environment variables
from dotenv import load_dotenv
load_dotenv('$PROJECT_DIR/.env')

try:
    django.setup()
    application = get_wsgi_application()
except Exception as e:
    def application(environ, start_response):
        status = '500 Internal Server Error'
        headers = [('Content-Type', 'text/html; charset=utf-8')]
        start_response(status, headers)

        error_html = f"""
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>خطأ في الخادم - sehea.net</title>
            <style>
                body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                .error {{ background: #f8d7da; color: #721c24; padding: 20px; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <div class="error">
                <h1>خطأ في تحميل النظام</h1>
                <p>يرجى التواصل مع الدعم الفني</p>
                <p>البريد الإلكتروني: support@sehea.net</p>
                <hr>
                <small>Error: {str(e)}</small>
            </div>
        </body>
        </html>
        """.encode('utf-8')

        return [error_html]
EOF

    chmod +x "$PUBLIC_HTML/index.py"

    # Set proper permissions
    find "$PROJECT_DIR" -type f -exec chmod 644 {} \;
    find "$PROJECT_DIR" -type d -exec chmod 755 {} \;
    chmod 600 "$PROJECT_DIR/.env"

    log "✓ Web server configured"
}

# ========================================
# SSL Certificate Setup
# ========================================

setup_ssl() {
    log "Setting up SSL certificate for sehea.net..."

    # Create SSL directory
    SSL_DIR="$HOME_DIR/ssl"
    mkdir -p "$SSL_DIR"

    # Generate private key
    openssl genrsa -out "$SSL_DIR/sehea.net.key" 2048

    # Generate certificate signing request
    cat > "$SSL_DIR/ssl.conf" << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = SA
ST = Riyadh
L = Riyadh
O = Sehea Medical Care
OU = IT Department
CN = sehea.net

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = sehea.net
DNS.2 = www.sehea.net
EOF

    openssl req -new -key "$SSL_DIR/sehea.net.key" -out "$SSL_DIR/sehea.net.csr" -config "$SSL_DIR/ssl.conf"

    # Generate self-signed certificate (temporary)
    openssl x509 -req -days 365 -in "$SSL_DIR/sehea.net.csr" -signkey "$SSL_DIR/sehea.net.key" -out "$SSL_DIR/sehea.net.crt" -extensions v3_req -extfile "$SSL_DIR/ssl.conf"

    # Set permissions
    chmod 600 "$SSL_DIR"/*.key
    chmod 644 "$SSL_DIR"/*.crt

    log "✓ SSL certificate generated"
    warning "Please install the SSL certificate in cPanel > SSL/TLS"
    warning "Certificate file: $SSL_DIR/sehea.net.crt"
    warning "Private key file: $SSL_DIR/sehea.net.key"

    # Try to get Let's Encrypt certificate if certbot is available
    if command -v certbot &> /dev/null; then
        log "Attempting to get Let's Encrypt certificate..."
        certbot certonly --webroot -w "$PUBLIC_HTML" -d sehea.net -d www.sehea.net --email admin@sehea.net --agree-tos --non-interactive

        if [[ $? -eq 0 ]]; then
            log "✓ Let's Encrypt certificate obtained"
        else
            warning "Let's Encrypt failed, using self-signed certificate"
        fi
    fi
}

# ========================================
# Email Setup
# ========================================

setup_email() {
    log "Setting up email accounts..."

    # Create email setup instructions
    cat > "$HOME_DIR/email_setup.txt" << EOF
Email Setup Instructions for sehea.net
=====================================

Please create the following email accounts in cPanel:

1. noreply@sehea.net
   Password: $EMAIL_PASSWORD

2. admin@sehea.net
   Password: $(generate_password)

3. support@sehea.net
   Password: $(generate_password)

SMTP Settings:
- Server: mail.sehea.net
- Port: 587
- Security: TLS
- Authentication: Yes

These accounts are configured in the Django application.
EOF

    log "✓ Email setup instructions created: $HOME_DIR/email_setup.txt"
}

# ========================================
# Backup Setup
# ========================================

setup_backup() {
    log "Setting up automated backups..."

    # Create backup script
    cat > "$HOME_DIR/backup_sclive.sh" << EOF
#!/bin/bash
# Automated backup script for sehea.net
# Generated on $(date)

DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_DIR"
PROJECT_DIR="$PROJECT_DIR"

# Create backup directory
mkdir -p "\$BACKUP_DIR/\$DATE"

# Backup database
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > "\$BACKUP_DIR/\$DATE/database.sql"

# Backup project files
tar -czf "\$BACKUP_DIR/\$DATE/project_files.tar.gz" -C "$PUBLIC_HTML" "$PROJECT_NAME"

# Backup media files
tar -czf "\$BACKUP_DIR/\$DATE/media_files.tar.gz" -C "$PROJECT_DIR" "media"

# Remove backups older than 7 days
find "\$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: \$DATE"
EOF

    chmod +x "$HOME_DIR/backup_sclive.sh"

    # Add to crontab (daily backup at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * $HOME_DIR/backup_sclive.sh >> $HOME_DIR/backup.log 2>&1") | crontab -

    log "✓ Automated backup configured"
}

# ========================================
# Health Check
# ========================================

health_check() {
    log "Performing health check..."

    # Check if website is accessible
    sleep 5  # Wait for server to start

    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://sehea.net" || echo "000")

    if [[ "$HTTP_STATUS" == "200" ]] || [[ "$HTTP_STATUS" == "301" ]] || [[ "$HTTP_STATUS" == "302" ]]; then
        log "✓ Website is accessible (HTTP $HTTP_STATUS)"
    else
        warning "Website returned HTTP $HTTP_STATUS"
    fi

    # Check database connection
    cd "$PROJECT_DIR"
    python3 manage.py check --database default --settings=sclive.settings_production

    if [[ $? -eq 0 ]]; then
        log "✓ Database connection successful"
    else
        warning "Database connection issues detected"
    fi

    log "✓ Health check completed"
}

# ========================================
# Deployment Summary
# ========================================

deployment_summary() {
    log "Deployment Summary"
    echo "===========================================" | tee -a "$LOG_FILE"
    echo "Domain: https://sehea.net" | tee -a "$LOG_FILE"
    echo "Project Directory: $PROJECT_DIR" | tee -a "$LOG_FILE"
    echo "Database: $DB_NAME" | tee -a "$LOG_FILE"
    echo "Database User: $DB_USER" | tee -a "$LOG_FILE"
    echo "SSL Certificate: $SSL_DIR/sehea.net.crt" | tee -a "$LOG_FILE"
    echo "Backup Script: $HOME_DIR/backup_sclive.sh" | tee -a "$LOG_FILE"
    echo "Log File: $LOG_FILE" | tee -a "$LOG_FILE"
    echo "===========================================" | tee -a "$LOG_FILE"

    echo "" | tee -a "$LOG_FILE"
    echo "Next Steps:" | tee -a "$LOG_FILE"
    echo "1. Install SSL certificate in cPanel" | tee -a "$LOG_FILE"
    echo "2. Create email accounts (see: $HOME_DIR/email_setup.txt)" | tee -a "$LOG_FILE"
    echo "3. Test the website: https://sehea.net" | tee -a "$LOG_FILE"
    echo "4. Configure DNS if needed" | tee -a "$LOG_FILE"
    echo "5. Set up monitoring" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    log "🎉 Deployment completed successfully!"
}

# ========================================
# Main Deployment Function
# ========================================

main() {
    log "Starting automated deployment for sehea.net..."

    check_requirements
    setup_database
    deploy_project
    setup_environment
    install_dependencies
    setup_django
    setup_webserver
    setup_ssl
    setup_email
    setup_backup
    health_check
    deployment_summary

    log "🚀 sehea.net is now live!"
}

# ========================================
# Error Handling
# ========================================

trap 'error "Deployment failed at line $LINENO"' ERR

# ========================================
# Execute Main Function
# ========================================

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
fi

# Check if we have the required arguments
if [[ $# -gt 0 ]]; then
    case $1 in
        --help|-h)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --help, -h     Show this help message"
            echo "  --check        Run pre-deployment checks only"
            echo "  --backup       Create backup only"
            echo "  --ssl          Setup SSL only"
            echo ""
            echo "Example: bash deploy_namecheap.sh"
            exit 0
            ;;
        --check)
            check_requirements
            exit 0
            ;;
        --backup)
            setup_backup
            exit 0
            ;;
        --ssl)
            setup_ssl
            exit 0
            ;;
        *)
            error "Unknown option: $1. Use --help for usage information."
            ;;
    esac
fi

main "$@"
