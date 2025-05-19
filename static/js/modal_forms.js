/**
 * نماذج النوافذ المنبثقة JS
 *
 * هذا الملف يحتوي على وظائف للتعامل مع النوافذ المنبثقة لإنشاء الكيانات
 * في نظام إدارة الإجازات المرضية.
 */

// دالة لتهيئة النوافذ المنبثقة عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة النوافذ المنبثقة في Bootstrap
    var modals = document.querySelectorAll('.modal');
    if (modals.length > 0) {
        modals.forEach(function(modal) {
            new bootstrap.Modal(modal);
        });
    }
});

// دالة لتحديث حقل select2 بخيار جديد وتحديده
function updateSelect2WithNewOption(selectId, optionValue, optionText) {
    // إنشاء خيار جديد
    var newOption = new Option(optionText, optionValue, true, true);

    // إضافة الخيار إلى القائمة المنسدلة
    $(selectId).append(newOption).trigger('change');
}

// دالة لمعالجة استجابة الخادم بعد إرسال نموذج النافذة المنبثقة
function handleModalFormResponse(response, modalId, targetSelectId) {
    if (response.success) {
        // إغلاق النافذة المنبثقة
        $(modalId).modal('hide');

        // تحديث حقل select2 بالخيار الجديد
        updateSelect2WithNewOption(
            targetSelectId,
            response.object_id,
            response.object_text
        );

        // عرض رسالة النجاح
        showNotification('success', response.message);
    } else {
        // عرض أخطاء النموذج
        showFormErrors(modalId, response.errors);

        // عرض رسالة الخطأ
        showNotification('error', response.message || 'حدث خطأ أثناء معالجة النموذج.');
    }
}

// دالة لعرض الأخطاء في النموذج
function showFormErrors(modalId, errors) {
    // مسح الأخطاء السابقة
    $(modalId + ' .invalid-feedback').remove();
    $(modalId + ' .is-invalid').removeClass('is-invalid');

    // عرض الأخطاء الجديدة
    for (var field in errors) {
        var inputField = $(modalId + ' [name="' + field + '"]');
        inputField.addClass('is-invalid');

        // إنشاء رسالة خطأ
        var errorDiv = $('<div class="invalid-feedback"></div>');
        errorDiv.text(errors[field].join(' '));

        // إدراج الرسالة بعد الحقل
        inputField.after(errorDiv);
    }
}

// دالة لعرض الإشعارات
function showNotification(type, message) {
    // إنشاء إشعار باستخدام Bootstrap alerts
    const alertClass = type === 'success' ? 'success' :
                       type === 'error' ? 'danger' :
                       type === 'warning' ? 'warning' : 'info';

    const alertHtml = `
        <div class="alert alert-${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    // عرض الإشعار في الحاوية المناسبة
    const alertContainer = $('.modal.show').find('[id^="alert-container"]');
    if (alertContainer.length > 0) {
        alertContainer.html(alertHtml);
    } else {
        // إنشاء حاوية مؤقتة للإشعار إذا لم تكن موجودة
        if ($('#temp-alert-container').length === 0) {
            $('body').prepend('<div id="temp-alert-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>');
        }
        $('#temp-alert-container').html(alertHtml);

        // إخفاء الإشعار بعد 5 ثوان
        setTimeout(function() {
            $('#temp-alert-container .alert').alert('close');
        }, 5000);
    }
}

// إرسال نماذج النوافذ المنبثقة باستخدام AJAX
$(document).ready(function() {
    // نموذج المريض
    $('#patient-form').on('submit', function(e) {
        e.preventDefault();

        $.ajax({
            url: '/patients/create-ajax/', // عنوان URL ثابت
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                handleModalFormResponse(response, '#patientModal', '#id_patient');
            },
            error: function(xhr, status, error) {
                console.error("خطأ في إرسال نموذج المريض:", status, error);
                showNotification('error', 'خطأ في الاتصال بالخادم.');
            }
        });
    });

    // نموذج المرافق
    $('#companion-form').on('submit', function(e) {
        e.preventDefault();

        $.ajax({
            url: '/companions/create-ajax/', // عنوان URL ثابت
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                // تحديث حقل صلة القرابة في نموذج إجازة المرافق إذا كان موجودًا
                if (response.relation && $('#id_relation').length > 0) {
                    $('#id_relation').val(response.relation);
                }

                handleModalFormResponse(response, '#companionModal', '#id_companion');
            },
            error: function(xhr, status, error) {
                console.error("خطأ في إرسال نموذج المرافق:", status, error);
                showNotification('error', 'خطأ في الاتصال بالخادم.');
            }
        });
    });

    // نموذج الطبيب
    $('#doctor-form').on('submit', function(e) {
        e.preventDefault();

        $.ajax({
            url: '/doctors/create-ajax/', // عنوان URL ثابت
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                handleModalFormResponse(response, '#doctorModal', '#id_doctor');
            },
            error: function(xhr, status, error) {
                console.error("خطأ في إرسال نموذج الطبيب:", status, error);
                showNotification('error', 'خطأ في الاتصال بالخادم.');
            }
        });
    });

    // نموذج المستشفى
    $('#hospital-form').on('submit', function(e) {
        e.preventDefault();

        // إنشاء كائن FormData للتعامل مع الملفات
        var formData = new FormData(this);

        $.ajax({
            url: '/hospitals/create-ajax/', // عنوان URL ثابت
            type: 'POST',
            data: formData,
            processData: false, // مهم للتعامل مع الملفات
            contentType: false, // مهم للتعامل مع الملفات
            dataType: 'json',
            success: function(response) {
                handleModalFormResponse(response, '#hospitalModal', '#id_new_doctor_hospital');

                // إذا تم فتح نافذة المستشفى المنبثقة من نافذة الطبيب المنبثقة
                if ($('#doctorModal').data('waiting-for-hospital')) {
                    $('#doctorModal').modal('show');
                    $('#doctorModal').data('waiting-for-hospital', false);
                }
            },
            error: function(xhr, status, error) {
                console.error("خطأ في إرسال نموذج المستشفى:", status, error);
                showNotification('error', 'خطأ في الاتصال بالخادم.');
            }
        });
    });

    // نموذج العميل
    $('#client-form').on('submit', function(e) {
        e.preventDefault();

        $.ajax({
            url: '/clients/create-ajax/', // عنوان URL ثابت
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                handleModalFormResponse(response, '#clientModal', '#id_client');
            },
            error: function(xhr, status, error) {
                console.error("خطأ في إرسال نموذج العميل:", status, error);
                showNotification('error', 'خطأ في الاتصال بالخادم.');
            }
        });
    });

    // زر لفتح نافذة المستشفى المنبثقة من نافذة الطبيب المنبثقة
    $('#add-hospital-modal-btn').on('click', function() {
        $('#doctorModal').data('waiting-for-hospital', true);
    });
});
