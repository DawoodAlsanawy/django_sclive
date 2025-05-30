# وظائف العرض (Views)

يحتوي النظام على مجموعة من وظائف العرض التي تتعامل مع طلبات المستخدم وتعرض البيانات المناسبة. فيما يلي شرح تفصيلي لكل وظيفة:

## الوظائف العامة

### home

```python
def home(request):
```

هذه الوظيفة تعرض الصفحة الرئيسية للنظام. إذا كان المستخدم مسجل الدخول، فإنها تعرض لوحة التحكم مع إحصائيات عامة وآخر الإجازات والفواتير والمدفوعات. وإذا كان المستخدم غير مسجل الدخول، فإنها تعرض صفحة الترحيب.

### about

```python
def about(request):
```

هذه الوظيفة تعرض صفحة حول النظام.

### register

```python
def register(request):
```

هذه الوظيفة تتعامل مع تسجيل حساب جديد. إذا كان المستخدم مسجل الدخول بالفعل، فإنها تعيد توجيهه إلى الصفحة الرئيسية. وإذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتنشئ حساب المستخدم وتسجل دخوله.

### verify

```python
def verify(request):
```

هذه الوظيفة تتعامل مع التحقق من صحة الإجازات المرضية وإجازات المرافقين. إذا كان الطلب بطريقة POST، فإنها تبحث عن الإجازة بناءً على رقم الإجازة وتعرض معلوماتها إذا كانت موجودة.

## وظائف إدارة المستخدمين

### user_list

```python
@login_required
def user_list(request):
```

هذه الوظيفة تعرض قائمة المستخدمين. تتطلب تسجيل الدخول.

### user_create

```python
@login_required
def user_create(request):
```

هذه الوظيفة تتعامل مع إنشاء مستخدم جديد. تتطلب تسجيل الدخول ودور مسؤول. إذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتنشئ المستخدم.

### user_edit

```python
@login_required
def user_edit(request, user_id):
```

هذه الوظيفة تتعامل مع تعديل مستخدم موجود. تتطلب تسجيل الدخول ودور مسؤول. إذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتحدث المستخدم.

### user_delete

```python
@login_required
def user_delete(request, user_id):
```

هذه الوظيفة تتعامل مع حذف مستخدم. تتطلب تسجيل الدخول ودور مسؤول. إذا كان الطلب بطريقة POST، فإنها تحذف المستخدم.

## وظائف إدارة المستشفيات

### hospital_list

```python
@login_required
def hospital_list(request):
```

هذه الوظيفة تعرض قائمة المستشفيات. تتطلب تسجيل الدخول.

### hospital_create

```python
@login_required
def hospital_create(request):
```

هذه الوظيفة تتعامل مع إنشاء مستشفى جديد. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتنشئ المستشفى.

### hospital_edit

```python
@login_required
def hospital_edit(request, hospital_id):
```

هذه الوظيفة تتعامل مع تعديل مستشفى موجود. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتحدث المستشفى.

### hospital_delete

```python
@login_required
def hospital_delete(request, hospital_id):
```

هذه الوظيفة تتعامل مع حذف مستشفى. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تحذف المستشفى.

## وظائف إدارة جهات العمل

### employer_list

```python
@login_required
def employer_list(request):
```

هذه الوظيفة تعرض قائمة جهات العمل. تتطلب تسجيل الدخول.

### employer_create

```python
@login_required
def employer_create(request):
```

هذه الوظيفة تتعامل مع إنشاء جهة عمل جديدة. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتنشئ جهة العمل.

### employer_edit

```python
@login_required
def employer_edit(request, employer_id):
```

هذه الوظيفة تتعامل مع تعديل جهة عمل موجودة. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتحدث جهة العمل.

### employer_delete

```python
@login_required
def employer_delete(request, employer_id):
```

هذه الوظيفة تتعامل مع حذف جهة عمل. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تحذف جهة العمل.

## وظائف إدارة الأطباء

### doctor_list

```python
@login_required
def doctor_list(request):
```

هذه الوظيفة تعرض قائمة الأطباء. تتطلب تسجيل الدخول.

### doctor_create

```python
@login_required
def doctor_create(request):
```

هذه الوظيفة تتعامل مع إنشاء طبيب جديد. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتنشئ الطبيب.

### doctor_edit

```python
@login_required
def doctor_edit(request, doctor_id):
```

هذه الوظيفة تتعامل مع تعديل طبيب موجود. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتحدث الطبيب.

### doctor_delete

```python
@login_required
def doctor_delete(request, doctor_id):
```

هذه الوظيفة تتعامل مع حذف طبيب. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تحذف الطبيب.

### doctor_search_api

```python
@login_required
def doctor_search_api(request):
```

هذه الوظيفة توفر واجهة برمجة تطبيقات للبحث عن الأطباء. تتطلب تسجيل الدخول. تبحث عن الأطباء بناءً على الاسم أو رقم الهوية وتعيد النتائج بتنسيق JSON.

## وظائف إدارة المرضى

### patient_list

```python
@login_required
def patient_list(request):
```

هذه الوظيفة تعرض قائمة المرضى مع إمكانية التصفية حسب الاسم ورقم الهوية وجهة العمل. تتطلب تسجيل الدخول.

### patient_detail

```python
@login_required
def patient_detail(request, patient_id):
```

هذه الوظيفة تعرض تفاصيل المريض مع الإجازات المرضية وإجازات المرافقين الخاصة به. تتطلب تسجيل الدخول.

### patient_create

```python
@login_required
def patient_create(request):
```

هذه الوظيفة تتعامل مع إنشاء مريض جديد. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتنشئ المريض.

### patient_edit

```python
@login_required
def patient_edit(request, patient_id):
```

هذه الوظيفة تتعامل مع تعديل مريض موجود. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتحدث المريض.

### patient_delete

```python
@login_required
def patient_delete(request, patient_id):
```

هذه الوظيفة تتعامل مع حذف مريض. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تحذف المريض.

### patient_search_api

```python
@login_required
def patient_search_api(request):
```

هذه الوظيفة توفر واجهة برمجة تطبيقات للبحث عن المرضى. تتطلب تسجيل الدخول. تبحث عن المرضى بناءً على الاسم أو رقم الهوية وتعيد النتائج بتنسيق JSON.

## وظائف إدارة العملاء

### client_list

```python
@login_required
def client_list(request):
```

هذه الوظيفة تعرض قائمة العملاء. تتطلب تسجيل الدخول.

### client_detail

```python
@login_required
def client_detail(request, client_id):
```

هذه الوظيفة تعرض تفاصيل العميل مع الفواتير والمدفوعات الخاصة به. تتطلب تسجيل الدخول.

### client_create

```python
@login_required
def client_create(request):
```

هذه الوظيفة تتعامل مع إنشاء عميل جديد. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتنشئ العميل.

### client_edit

```python
@login_required
def client_edit(request, client_id):
```

هذه الوظيفة تتعامل مع تعديل عميل موجود. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تتحقق من صحة البيانات وتحدث العميل.

### client_delete

```python
@login_required
def client_delete(request, client_id):
```

هذه الوظيفة تتعامل مع حذف عميل. تتطلب تسجيل الدخول. إذا كان الطلب بطريقة POST، فإنها تحذف العميل.

### client_search_api

```python
@login_required
def client_search_api(request):
```

هذه الوظيفة توفر واجهة برمجة تطبيقات للبحث عن العملاء. تتطلب تسجيل الدخول. تبحث عن العملاء بناءً على الاسم أو رقم الهاتف وتعيد النتائج بتنسيق JSON.
