# Import all views from their respective modules
try:
    # Base views
    # API views
    from .api_views import *
    from .api_views import (api_client_unpaid_invoices, client_search_api,
                            companion_leave_search_api, doctor_search_api,
                            generate_companion_leave_id_api, generate_sick_leave_id_api,
                            leave_price_api_get_price, patient_search_api,
                            sick_leave_search_api)
    # Auth views
    from .auth_views import password_change, register
    from .base_views import about, home, update_all_leaves_status, verify
    from .client_ajax_views import *
    # Model views
    from .client_views import *
    from .companion_ajax_views import *
    from .companion_leave_views import *
    from .doctor_ajax_views import *
    from .doctor_views import *
    from .employer_views import *
    from .hospital_ajax_views import *
    from .hospital_views import *
    from .leave_invoice_views import *
    from .leave_price_views import *
    from .patient_ajax_views import *
    from .patient_views import *
    from .payment_views import *
    from .report_views import *
    from .sick_leave_views import *
    from .user_views import *

except ImportError:
    pass  # Handle import errors gracefully

# AJAX views
from .client_ajax_views import client_create_ajax
from .companion_ajax_views import companion_create_ajax
from .doctor_ajax_views import doctor_create_ajax
from .hospital_ajax_views import hospital_create_ajax
from .patient_ajax_views import patient_create_ajax
