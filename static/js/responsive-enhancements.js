/**
 * ملف JavaScript للتحسينات المتجاوبة
 * يحتوي على وظائف لتحسين تجربة المستخدم على جميع الأجهزة
 */

$(document).ready(function() {
    
    // تحسينات الجداول للأجهزة المحمولة
    function enhanceTables() {
        $('.table-responsive').each(function() {
            const table = $(this).find('table');
            if (table.length && $(window).width() <= 768) {
                
                // إضافة فئات للنصوص الطويلة
                table.find('td').each(function() {
                    const text = $(this).text().trim();
                    if (text.length > 15) {
                        $(this).addClass('text-truncate-mobile');
                        $(this).attr('title', text);
                    }
                });
                
                // إضافة مؤشر التمرير الأفقي
                if (!$(this).find('.scroll-indicator').length) {
                    $(this).append('<div class="scroll-indicator text-center mt-2"><small class="text-muted"><i class="fas fa-arrows-alt-h"></i> اسحب للتمرير</small></div>');
                }
            }
        });
    }
    
    // تحسين النماذج للأجهزة المحمولة
    function enhanceForms() {
        if ($(window).width() <= 768) {
            // تحسين مجموعات الأزرار
            $('.btn-group').each(function() {
                if (!$(this).hasClass('enhanced-mobile')) {
                    $(this).addClass('enhanced-mobile d-grid gap-2');
                    $(this).find('.btn').removeClass('btn-sm').addClass('btn');
                }
            });
            
            // تحسين حقول الإدخال
            $('.form-control, .form-select').each(function() {
                if (!$(this).hasClass('enhanced-mobile')) {
                    $(this).addClass('enhanced-mobile');
                    // منع التكبير في iOS
                    if ($(this).attr('type') !== 'file') {
                        $(this).css('font-size', '16px');
                    }
                }
            });
        }
    }
    
    // تحسين الترقيم للأجهزة المحمولة
    function enhancePagination() {
        $('.pagination').each(function() {
            if ($(window).width() <= 768) {
                const items = $(this).find('.page-item');
                const activeIndex = items.index($(this).find('.page-item.active'));
                
                items.each(function(index) {
                    const isFirst = index === 0;
                    const isLast = index === items.length - 1;
                    const isActive = $(this).hasClass('active');
                    const isNearActive = Math.abs(index - activeIndex) <= 1;
                    
                    if (!isFirst && !isLast && !isActive && !isNearActive) {
                        $(this).hide();
                    }
                });
            }
        });
    }
    
    // تحسين البطاقات للأجهزة المحمولة
    function enhanceCards() {
        if ($(window).width() <= 768) {
            $('.card').each(function() {
                if (!$(this).hasClass('enhanced-mobile')) {
                    $(this).addClass('enhanced-mobile');
                    
                    // تحسين padding للبطاقات
                    const cardBody = $(this).find('.card-body');
                    if (cardBody.length) {
                        cardBody.addClass('p-3');
                    }
                    
                    // تحسين العناوين
                    $(this).find('h1, h2, h3, h4, h5, h6').each(function() {
                        $(this).addClass('responsive-heading');
                    });
                }
            });
        }
    }
    
    // تحسين القوائم المنسدلة
    function enhanceDropdowns() {
        $('.dropdown-menu').each(function() {
            if ($(window).width() <= 768) {
                $(this).addClass('dropdown-menu-mobile');
            }
        });
    }
    
    // إضافة مؤشرات التحميل للأزرار
    function addLoadingIndicators() {
        $('form').on('submit', function() {
            const submitBtn = $(this).find('button[type="submit"]');
            if (submitBtn.length) {
                const originalText = submitBtn.html();
                submitBtn.html('<i class="fas fa-spinner fa-spin me-2"></i>جاري المعالجة...');
                submitBtn.prop('disabled', true);
                
                // إعادة تعيين النص بعد 10 ثوانٍ كحد أقصى
                setTimeout(function() {
                    submitBtn.html(originalText);
                    submitBtn.prop('disabled', false);
                }, 10000);
            }
        });
    }
    
    // تحسين الرسائل التنبيهية
    function enhanceAlerts() {
        $('.alert').each(function() {
            if (!$(this).find('.btn-close').length) {
                $(this).append('<button type="button" class="btn-close" data-bs-dismiss="alert"></button>');
            }
            
            // إضافة أيقونات للرسائل
            if (!$(this).find('i').length) {
                let icon = 'fas fa-info-circle';
                if ($(this).hasClass('alert-success')) icon = 'fas fa-check-circle';
                else if ($(this).hasClass('alert-danger')) icon = 'fas fa-exclamation-circle';
                else if ($(this).hasClass('alert-warning')) icon = 'fas fa-exclamation-triangle';
                
                $(this).prepend(`<i class="${icon} me-2"></i>`);
            }
        });
    }
    
    // تحسين الشارات
    function enhanceBadges() {
        $('.badge').each(function() {
            if (!$(this).hasClass('enhanced')) {
                $(this).addClass('enhanced');
                
                // إضافة أيقونات للشارات حسب المحتوى
                const text = $(this).text().toLowerCase();
                if (text.includes('نشط') || text.includes('active')) {
                    $(this).prepend('<i class="fas fa-check me-1"></i>');
                } else if (text.includes('ملغ') || text.includes('cancelled')) {
                    $(this).prepend('<i class="fas fa-times me-1"></i>');
                } else if (text.includes('منته') || text.includes('expired')) {
                    $(this).prepend('<i class="fas fa-clock me-1"></i>');
                }
            }
        });
    }
    
    // تحسين الروابط الخارجية
    function enhanceExternalLinks() {
        $('a[href^="http"], a[href^="mailto:"], a[href^="tel:"]').each(function() {
            if (!$(this).hasClass('enhanced')) {
                $(this).addClass('enhanced');
                
                if ($(this).attr('href').startsWith('mailto:')) {
                    $(this).attr('title', 'إرسال بريد إلكتروني');
                } else if ($(this).attr('href').startsWith('tel:')) {
                    $(this).attr('title', 'إجراء مكالمة');
                } else if ($(this).attr('href').startsWith('http')) {
                    $(this).attr('target', '_blank');
                    $(this).attr('rel', 'noopener noreferrer');
                    $(this).attr('title', 'فتح في نافذة جديدة');
                }
            }
        });
    }
    
    // تطبيق جميع التحسينات
    function applyAllEnhancements() {
        enhanceTables();
        enhanceForms();
        enhancePagination();
        enhanceCards();
        enhanceDropdowns();
        enhanceAlerts();
        enhanceBadges();
        enhanceExternalLinks();
    }
    
    // تطبيق التحسينات عند تحميل الصفحة
    applyAllEnhancements();
    addLoadingIndicators();
    
    // إعادة تطبيق التحسينات عند تغيير حجم الشاشة
    $(window).on('resize', function() {
        // إزالة الفئات المحسنة لإعادة تطبيقها
        $('.enhanced-mobile').removeClass('enhanced-mobile');
        $('.enhanced').removeClass('enhanced');
        
        // تطبيق التحسينات مرة أخرى
        setTimeout(applyAllEnhancements, 100);
    });
    
    // تحسين الأداء بتأخير التحسينات عند التمرير
    let scrollTimeout;
    $(window).on('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            enhanceTables();
        }, 150);
    });
    
    // إضافة دعم اللمس للعناصر التفاعلية
    if ('ontouchstart' in window) {
        $('.btn, .nav-link, .page-link, .card').addClass('touch-enabled');
    }
    
    // تحسين إمكانية الوصول
    $('img').each(function() {
        if (!$(this).attr('alt')) {
            $(this).attr('alt', 'صورة');
        }
    });
    
    // إضافة مؤشر التحميل العام
    $(document).ajaxStart(function() {
        if (!$('#global-loader').length) {
            $('body').append('<div id="global-loader" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.8); z-index: 9999;"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">جاري التحميل...</span></div></div>');
        }
    }).ajaxStop(function() {
        $('#global-loader').remove();
    });
});

// إضافة أنماط CSS للتحسينات
const responsiveStyles = `
<style>
.text-truncate-mobile {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
}

.scroll-indicator {
    animation: fadeInOut 3s ease-in-out infinite;
}

@keyframes fadeInOut {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
}

.dropdown-menu-mobile {
    font-size: 14px;
    min-width: 200px;
}

.touch-enabled {
    min-height: 44px;
    min-width: 44px;
}

.enhanced {
    transition: all 0.3s ease;
}

@media (max-width: 768px) {
    .responsive-heading {
        font-size: clamp(1.2rem, 4vw, 2rem) !important;
    }
    
    .btn-group.enhanced-mobile .btn {
        margin-bottom: 5px;
    }
    
    .card.enhanced-mobile {
        margin-bottom: 1rem;
    }
    
    .table-responsive {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
}
</style>
`;

// إضافة الأنماط إلى الصفحة
$('head').append(responsiveStyles);
