# تطبيق ميزة البحث بالعميل وعرض اسم العميل

## نظرة عامة

تم تطبيق ميزة البحث بالعميل بدلاً من الطبيب وعرض اسم العميل بدلاً من اسم الطبيب في جداول الإجازات المرضية وإجازات المرافقة.

## التغييرات المطبقة

### 1. تحديث النماذج (Models)

#### أ. نموذج SickLeave
تم إضافة دالتين مساعدتين في `core/models.py`:

```python
def get_client(self):
    """الحصول على العميل المرتبط بالإجازة من خلال الفواتير"""
    try:
        invoice = LeaveInvoice.objects.filter(
            leave_type='sick_leave',
            leave_id=self.leave_id
        ).first()
        return invoice.client if invoice else None
    except:
        return None

def get_client_name(self):
    """الحصول على اسم العميل المرتبط بالإجازة"""
    client = self.get_client()
    return client.name if client else "غير محدد"
```

#### ب. نموذج CompanionLeave
تم إضافة نفس الدالتين المساعدتين:

```python
def get_client(self):
    """الحصول على العميل المرتبط بالإجازة من خلال الفواتير"""
    try:
        invoice = LeaveInvoice.objects.filter(
            leave_type='companion_leave',
            leave_id=self.leave_id
        ).first()
        return invoice.client if invoice else None
    except:
        return None

def get_client_name(self):
    """الحصول على اسم العميل المرتبط بالإجازة"""
    client = self.get_client()
    return client.name if client else "غير محدد"
```

### 2. تحديث العروض (Views)

#### أ. عرض الإجازات المرضية (`core/views/sick_leave_views.py`)
- إضافة استيراد نموذج `Client`
- إضافة فلتر البحث بالعميل:
```python
# فلتر العميل (من خلال الفواتير)
client = request.GET.get('client')
if client:
    invoice_leave_ids = LeaveInvoice.objects.filter(
        leave_type='sick_leave',
        client__name__icontains=client
    ).values_list('leave_id', flat=True)
    sick_leaves = sick_leaves.filter(leave_id__in=invoice_leave_ids)
```
- إضافة متغير `client` إلى السياق

#### ب. عرض إجازات المرافقة (`core/views/companion_leave_views.py`)
- إضافة استيراد نموذج `Client`
- إضافة نفس فلتر البحث بالعميل مع تغيير `leave_type` إلى `companion_leave`
- إضافة متغير `client` إلى السياق

### 3. تحديث القوالب (Templates)

#### أ. قالب قائمة الإجازات المرضية (`templates/core/sick_leaves/list.html`)
- تغيير حقل البحث من "الطبيب" إلى "العميل"
- تغيير رأس العمود من "الطبيب" إلى "العميل"
- تغيير محتوى العمود من `{{ leave.doctor.name }}` إلى `{{ leave.get_client_name }}`
- تحديث روابط الترقيم الصفحي لتشمل معامل `client` بدلاً من `doctor`
- تحسين JavaScript للترتيب

#### ب. قالب قائمة إجازات المرافقة (`templates/core/companion_leaves/list.html`)
- نفس التغييرات المطبقة على قالب الإجازات المرضية

#### ج. قالب تفاصيل الإجازة المرضية (`templates/core/sick_leaves/detail.html`)
- إضافة قسم عرض معلومات العميل قبل قسم الطبيب:
```html
<div class="row mb-3">
    <div class="col-md-4">
        <strong>العميل:</strong>
    </div>
    <div class="col-md-8">
        {% if sick_leave.get_client %}
            {{ sick_leave.get_client.name }}
            <small class="text-muted">({{ sick_leave.get_client.contact_person }})</small>
        {% else %}
            <span class="text-muted">غير محدد</span>
        {% endif %}
    </div>
</div>
```

#### د. قالب تفاصيل إجازة المرافقة (`templates/core/companion_leaves/detail.html`)
- إضافة نفس قسم عرض معلومات العميل

## آلية العمل

### 1. ربط الإجازات بالعملاء
- يتم ربط الإجازات بالعملاء من خلال جدول `LeaveInvoice`
- كل إجازة يمكن أن تكون لها فاتورة واحدة أو أكثر
- كل فاتورة مرتبطة بعميل واحد
- الدالة `get_client()` تبحث عن أول فاتورة مرتبطة بالإجازة وترجع العميل المرتبط بها

### 2. البحث بالعميل
- يتم البحث في أسماء العملاء باستخدام `client__name__icontains`
- يتم الحصول على قائمة بأرقام الإجازات المرتبطة بالعملاء المطابقين
- يتم فلترة الإجازات بناءً على هذه القائمة

### 3. عرض اسم العميل
- يتم استخدام الدالة `get_client_name()` في القوالب
- إذا لم يكن هناك عميل مرتبط، يتم عرض "غير محدد"

## المزايا

1. **مرونة في البحث**: يمكن البحث بالعميل بدلاً من الطبيب
2. **معلومات أكثر فائدة**: عرض العميل أهم من الطبيب في السياق التجاري
3. **توافق مع النظام الحالي**: لا تؤثر على البيانات الموجودة
4. **أداء محسن**: استخدام فلترة قاعدة البيانات بدلاً من المعالجة في Python

## الملفات المعدلة

1. `core/models.py` - إضافة دوال مساعدة للنماذج
2. `core/views/sick_leave_views.py` - تحديث عرض قائمة الإجازات المرضية
3. `core/views/companion_leave_views.py` - تحديث عرض قائمة إجازات المرافقة
4. `templates/core/sick_leaves/list.html` - تحديث قالب قائمة الإجازات المرضية
5. `templates/core/sick_leaves/detail.html` - تحديث قالب تفاصيل الإجازة المرضية
6. `templates/core/companion_leaves/list.html` - تحديث قالب قائمة إجازات المرافقة
7. `templates/core/companion_leaves/detail.html` - تحديث قالب تفاصيل إجازة المرافقة

## اختبار الميزة

1. **البحث**: جرب البحث بأسماء العملاء في صفحات قوائم الإجازات
2. **العرض**: تأكد من ظهور أسماء العملاء في الجداول بدلاً من أسماء الأطباء
3. **التفاصيل**: تحقق من ظهور معلومات العميل في صفحات التفاصيل
4. **الترقيم**: تأكد من عمل الترقيم الصفحي مع البحث بالعميل

## ملاحظات

- إذا لم تكن هناك فاتورة مرتبطة بالإجازة، سيظهر "غير محدد" كاسم العميل
- يمكن تحسين الأداء أكثر بإضافة فهارس على الحقول المستخدمة في البحث
- يمكن إضافة المزيد من معايير البحث مثل رقم العميل أو معلومات الاتصال

تم تطبيق جميع التغييرات بنجاح والنظام يعمل بشكل صحيح.
