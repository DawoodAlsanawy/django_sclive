/**
 * Modal Forms - JavaScript para manejar formularios modales
 *
 * Este archivo contiene funciones para manejar formularios modales para agregar
 * nuevos pacientes, médicos, hospitales y acompañantes.
 */

// Función para inicializar los modales
function initializeModals() {
    // Inicializar modal de paciente
    $('#add-new-patient-btn').click(function() {
        $('#patientModal').modal('show');
    });

    // Inicializar modal de médico
    $('#add-new-doctor-btn').click(function() {
        $('#doctorModal').modal('show');
    });

    // Inicializar modal de hospital
    $('#add-new-hospital-btn').click(function() {
        $('#hospitalModal').modal('show');
    });

    // Inicializar modal de acompañante (si existe)
    $('#add-new-companion-btn').click(function() {
        $('#companionModal').modal('show');
    });

    // Inicializar modal de cliente
    $('#add-new-client-btn').click(function() {
        $('#clientModal').modal('show');
    });
}

// Función para manejar el envío del formulario de paciente
function handlePatientFormSubmit() {
    $('#patient-form').submit(function(e) {
        e.preventDefault();

        // Obtener los datos del formulario
        const formData = {
            'national_id': $('#new_patient_national_id').val(),
            'name': $('#new_patient_name').val(),
            'phone': $('#new_patient_phone').val(),
            'nationality': $('#new_patient_nationality').val(),
            'employer_name': $('#new_patient_employer_name').val(),
            'address': $('#new_patient_address').val(),
            'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
        };

        // Enviar los datos mediante AJAX
        $.ajax({
            type: 'POST',
            url: '/patients/create-ajax/',
            data: formData,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    // Crear nueva opción para el select
                    const newOption = new Option(response.patient.name, response.patient.id, true, true);

                    // Agregar la opción al select y seleccionarla
                    $('#id_patient').append(newOption).trigger('change');

                    // Cerrar el modal
                    $('#patientModal').modal('hide');

                    // Limpiar el formulario
                    $('#patient-form')[0].reset();

                    // Mostrar mensaje de éxito
                    showAlert('success', 'تم إضافة المريض بنجاح');
                } else {
                    // Mostrar errores
                    showFormErrors(response.errors);
                }
            },
            error: function(xhr, status, error) {
                showAlert('danger', 'حدث خطأ أثناء إضافة المريض');
                console.error(error);
            }
        });
    });
}

// Función para manejar el envío del formulario de médico
function handleDoctorFormSubmit() {
    $('#doctor-form').submit(function(e) {
        e.preventDefault();

        // Obtener los datos del formulario
        const formData = {
            'national_id': $('#new_doctor_national_id').val(),
            'name': $('#new_doctor_name').val(),
            'position': $('#new_doctor_position').val(),
            'hospital': $('#new_doctor_hospital').val(),
            'phone': $('#new_doctor_phone').val(),
            'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
        };

        // Enviar los datos mediante AJAX
        $.ajax({
            type: 'POST',
            url: '/doctors/create-ajax/',
            data: formData,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    // Crear nueva opción para el select
                    const newOption = new Option(response.doctor.name, response.doctor.id, true, true);

                    // Agregar la opción al select y seleccionarla
                    $('#id_doctor').append(newOption).trigger('change');

                    // Cerrar el modal
                    $('#doctorModal').modal('hide');

                    // Limpiar el formulario
                    $('#doctor-form')[0].reset();

                    // Mostrar mensaje de éxito
                    showAlert('success', 'تم إضافة الطبيب بنجاح');
                } else {
                    // Mostrar errores
                    showFormErrors(response.errors);
                }
            },
            error: function(xhr, status, error) {
                showAlert('danger', 'حدث خطأ أثناء إضافة الطبيب');
                console.error(error);
            }
        });
    });
}

// دالة لمعالجة إرسال نموذج المستشفى
function handleHospitalFormSubmit() {
    $('#hospital-form').submit(function(e) {
        e.preventDefault();

        // إنشاء كائن FormData للتعامل مع الملفات
        const formData = new FormData(this);

        // إرسال البيانات باستخدام AJAX
        $.ajax({
            type: 'POST',
            url: '/hospitals/create-ajax/',
            data: formData,
            processData: false,  // مهم لـ FormData
            contentType: false,  // مهم لـ FormData
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    // إنشاء خيار جديد للقائمة المنسدلة
                    const newOption = new Option(response.hospital.name, response.hospital.id, true, true);

                    // إضافة الخيار إلى القائمة المنسدلة وتحديده
                    $('#new_doctor_hospital').append(newOption).trigger('change');
                    $('#id_hospital').append(newOption).trigger('change');

                    // إغلاق النافذة المنبثقة
                    $('#hospitalModal').modal('hide');

                    // تنظيف النموذج
                    $('#hospital-form')[0].reset();

                    // عرض رسالة نجاح
                    showAlert('success', 'تم إضافة المستشفى بنجاح');
                } else {
                    // عرض الأخطاء
                    showFormErrors(response.errors);
                }
            },
            error: function(xhr, status, error) {
                showAlert('danger', 'حدث خطأ أثناء إضافة المستشفى');
                console.error(error);
            }
        });
    });
}

// دالة لعرض التنبيهات
function showAlert(type, message) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    // إضافة التنبيه إلى الحاوية
    $('#alert-container').html(alertHtml);

    // إخفاء التنبيه بعد 5 ثوانٍ
    setTimeout(function() {
        $('.alert').alert('close');
    }, 5000);
}

// دالة لعرض أخطاء النموذج
function showFormErrors(errors) {
    // تنظيف الأخطاء السابقة
    $('.invalid-feedback').remove();
    $('.is-invalid').removeClass('is-invalid');

    // عرض الأخطاء الجديدة
    for (const field in errors) {
        const input = $(`#${field}`);
        input.addClass('is-invalid');

        // إضافة رسالة الخطأ
        input.after(`<div class="invalid-feedback">${errors[field]}</div>`);
    }
}

// تهيئة عندما يكون المستند جاهزًا
$(document).ready(function() {
    initializeModals();
    handlePatientFormSubmit();
    handleDoctorFormSubmit();
    handleHospitalFormSubmit();
});
