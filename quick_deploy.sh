#!/bin/bash

# ========================================
# Quick Deployment Script for sehea.net
# سكريبت النشر السريع لموقع sehea.net
# ========================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN="sehea.net"
PROJECT_NAME="sclive"

echo -e "${BLUE}"
cat << "EOF"
 ____       _                   _   _ ______ _______
/ ___|  ___| |__   ___  __ _   | \ | |  ____|__   __|
\___ \ / _ \ '_ \ / _ \/ _` |  |  \| | |__     | |
 ___) |  __/ | | |  __/ (_| |  | |\  |  __|    | |
|____/ \___|_| |_|\___|\__,_|  |_| \_|_____|   |_|

        Automated Deployment System
        نظام النشر التلقائي
EOF
echo -e "${NC}"

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# ========================================
# Quick Checks
# ========================================

quick_check() {
    log "Running quick deployment checks..."
    
    # Check if we're in the right directory
    if [[ ! -f "manage.py" ]]; then
        error "manage.py not found. Please run from Django project root."
    fi
    
    # Check required files
    required_files=(
        "deploy_namecheap.sh"
        "deploy_helper.py"
        "requirements-production.txt"
        ".htaccess"
        "index.py"
        ".env.production"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error "Required file missing: $file"
        fi
    done
    
    log "✓ All required files present"
    
    # Check Python version
    python_version=$(python3 --version 2>&1 | cut -d' ' -f2)
    log "Python version: $python_version"
    
    # Check if we can connect to MySQL
    if command -v mysql &> /dev/null; then
        log "✓ MySQL client available"
    else
        warning "MySQL client not found"
    fi
    
    log "✓ Quick checks completed"
}

# ========================================
# Interactive Setup
# ========================================

interactive_setup() {
    log "Starting interactive setup..."
    
    # Get cPanel username
    default_username=$(whoami)
    read -p "Enter your cPanel username [$default_username]: " cpanel_username
    cpanel_username=${cpanel_username:-$default_username}
    
    # Get database password
    read -s -p "Enter MySQL root password (or press Enter to generate): " mysql_password
    echo
    
    if [[ -z "$mysql_password" ]]; then
        mysql_password=$(openssl rand -base64 16)
        log "Generated MySQL password: $mysql_password"
    fi
    
    # Confirm domain
    read -p "Confirm domain name [$DOMAIN]: " domain_input
    domain_input=${domain_input:-$DOMAIN}
    
    # Save configuration
    cat > deployment_config.env << EOF
CPANEL_USERNAME=$cpanel_username
MYSQL_PASSWORD=$mysql_password
DOMAIN=$domain_input
PROJECT_NAME=$PROJECT_NAME
DEPLOYMENT_DATE=$(date)
EOF
    
    log "✓ Configuration saved to deployment_config.env"
}

# ========================================
# One-Click Deployment
# ========================================

one_click_deploy() {
    log "Starting one-click deployment for $DOMAIN..."
    
    # Make scripts executable
    chmod +x deploy_namecheap.sh
    chmod +x deploy_helper.py
    
    # Run main deployment script
    log "Executing main deployment script..."
    bash deploy_namecheap.sh
    
    # Run Python helper
    log "Running Python deployment helper..."
    python3 deploy_helper.py
    
    log "✓ One-click deployment completed"
}

# ========================================
# Post-Deployment Tasks
# ========================================

post_deployment() {
    log "Running post-deployment tasks..."
    
    # Test website
    log "Testing website accessibility..."
    if curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" | grep -q "200\|301\|302"; then
        log "✓ Website is accessible"
    else
        warning "Website may not be accessible yet"
    fi
    
    # Create admin user
    log "Creating Django admin user..."
    cd ~/public_html/$PROJECT_NAME
    
    python3 manage.py shell --settings=sclive.settings_production << EOF
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@$DOMAIN', 'admin123')
    print('Admin user created: admin/admin123')
else:
    print('Admin user already exists')
EOF
    
    # Generate deployment summary
    cat > ~/deployment_summary.txt << EOF
========================================
sehea.net Deployment Summary
========================================
Date: $(date)
Domain: https://$DOMAIN
Admin URL: https://$DOMAIN/admin/
Admin User: admin
Admin Pass: admin123

Important Files:
- Project: ~/public_html/$PROJECT_NAME
- Environment: ~/public_html/$PROJECT_NAME/.env
- SSL Cert: ~/ssl/$DOMAIN.crt
- Backup Script: ~/backup_sclive.sh

Next Steps:
1. Change admin password
2. Install SSL certificate in cPanel
3. Create email accounts
4. Test all functionality

Support: support@$DOMAIN
========================================
EOF
    
    log "✓ Deployment summary created: ~/deployment_summary.txt"
}

# ========================================
# Main Menu
# ========================================

show_menu() {
    echo
    echo "========================================="
    echo "  sehea.net Deployment Options"
    echo "========================================="
    echo "1. Quick Check Only"
    echo "2. Interactive Setup"
    echo "3. One-Click Deploy (Full)"
    echo "4. Post-Deployment Tasks"
    echo "5. View Deployment Status"
    echo "6. Emergency Rollback"
    echo "7. Exit"
    echo "========================================="
    echo
}

view_status() {
    log "Checking deployment status..."
    
    # Check if project directory exists
    if [[ -d ~/public_html/$PROJECT_NAME ]]; then
        log "✓ Project directory exists"
    else
        warning "✗ Project directory not found"
    fi
    
    # Check if .env file exists
    if [[ -f ~/public_html/$PROJECT_NAME/.env ]]; then
        log "✓ Environment file exists"
    else
        warning "✗ Environment file not found"
    fi
    
    # Check if database exists
    if mysql -e "USE ${whoami}_sclive" 2>/dev/null; then
        log "✓ Database exists"
    else
        warning "✗ Database not found"
    fi
    
    # Check website status
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" || echo "000")
    if [[ "$status_code" == "200" ]] || [[ "$status_code" == "301" ]] || [[ "$status_code" == "302" ]]; then
        log "✓ Website is accessible (HTTP $status_code)"
    else
        warning "✗ Website not accessible (HTTP $status_code)"
    fi
}

emergency_rollback() {
    warning "Starting emergency rollback..."
    
    read -p "Are you sure you want to rollback? This will restore from backup. (y/N): " confirm
    if [[ $confirm != "y" && $confirm != "Y" ]]; then
        log "Rollback cancelled"
        return
    fi
    
    # Find latest backup
    latest_backup=$(ls -t ~/backups/ | head -1)
    if [[ -n "$latest_backup" ]]; then
        log "Restoring from backup: $latest_backup"
        
        # Restore database
        mysql ${whoami}_sclive < ~/backups/$latest_backup/database.sql
        
        # Restore files
        tar -xzf ~/backups/$latest_backup/project_files.tar.gz -C ~/public_html/
        
        log "✓ Rollback completed"
    else
        error "No backups found"
    fi
}

# ========================================
# Main Function
# ========================================

main() {
    # Check if running with arguments
    if [[ $# -gt 0 ]]; then
        case $1 in
            --quick)
                quick_check
                ;;
            --deploy)
                quick_check
                one_click_deploy
                post_deployment
                ;;
            --status)
                view_status
                ;;
            --help)
                echo "Usage: $0 [option]"
                echo "Options:"
                echo "  --quick    Run quick checks only"
                echo "  --deploy   Full deployment"
                echo "  --status   Check deployment status"
                echo "  --help     Show this help"
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
        return
    fi
    
    # Interactive mode
    while true; do
        show_menu
        read -p "Select option [1-7]: " choice
        
        case $choice in
            1)
                quick_check
                ;;
            2)
                interactive_setup
                ;;
            3)
                quick_check
                interactive_setup
                one_click_deploy
                post_deployment
                ;;
            4)
                post_deployment
                ;;
            5)
                view_status
                ;;
            6)
                emergency_rollback
                ;;
            7)
                log "Goodbye!"
                exit 0
                ;;
            *)
                error "Invalid option. Please select 1-7."
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# ========================================
# Execute
# ========================================

main "$@"
