# توثيق واجهات برمجة التطبيق (API Documentation)

## 1. واجهات برمجة تقدم الدورة (Course Progress APIs)

### 1.1 الحصول على تقدم الدورة
```
GET /api/v1/courses/{courseId}/progress
```
**الرأس (Headers):**
- Authorization: Bearer {token}

**الاستجابة (Response):**
```json
{
    "courseId": "رقم_الدورة",
    "progress": "نسبة_التقدم",
    "videosCompleted": "عدد_الفيديوهات_المكتملة",
    "completedAt": "تاريخ_الإكمال",
    "canTakeQuiz": "إمكانية_أخذ_الاختبار"
}
```

### 1.2 تحديث تقدم الدورة
```
POST /api/v1/courses/{courseId}/progress
```
**الرأس (Headers):**
- Authorization: Bearer {token}
- Content-Type: application/json

**المعطيات (Body):**
```json
{
    "progress": "نسبة_التقدم",
    "videos_completed": "عدد_الفيديوهات_المكتملة"
}
```

### 1.3 تحديد الفيديو كمشاهد
```
POST /api/v1/videos/{videoId}/watch
```
**الرأس (Headers):**
- Authorization: Bearer {token}

### 1.4 الحصول على الفيديوهات المشاهدة
```
GET /api/v1/user/watched-videos
```
**الرأس (Headers):**
- Authorization: Bearer {token}

## 2. واجهات برمجة الدورات المحفوظة (Saved Courses APIs)

### 2.1 الحصول على الدورات المحفوظة
```
GET /api/v1/saved-courses
```
**الرأس (Headers):**
- Authorization: Bearer {token}

### 2.2 حفظ دورة
```
POST /api/v1/saved-courses/{courseId}
```
**الرأس (Headers):**
- Authorization: Bearer {token}

### 2.3 إلغاء حفظ دورة
```
DELETE /api/v1/saved-courses/{courseId}
```
**الرأس (Headers):**
- Authorization: Bearer {token}

### 2.4 التحقق من حالة حفظ الدورة
```
GET /api/v1/saved-courses/{courseId}/check
```
**الرأس (Headers):**
- Authorization: Bearer {token}

## 3. واجهات برمجة الملاحظات (Notes APIs)

### 3.1 الحصول على الملاحظات
```
GET /api/v1/notes?course_id={courseId}
```
**الرأس (Headers):**
- Authorization: Bearer {token}

### 3.2 إنشاء ملاحظة جديدة
```
POST /api/v1/notes
```
**الرأس (Headers):**
- Authorization: Bearer {token}

**المعطيات (Body):**
```json
{
    "course_id": "رقم_الدورة",
    "content": "محتوى_الملاحظة",
    "video_id": "رقم_الفيديو" // اختياري
}
```

### 3.3 تحديث ملاحظة
```
PUT /api/v1/notes/{noteId}
```
**الرأس (Headers):**
- Authorization: Bearer {token}

**المعطيات (Body):**
```json
{
    "content": "محتوى_الملاحظة_الجديد"
}
```

### 3.4 حذف ملاحظة
```
DELETE /api/v1/notes/{noteId}
```
**الرأس (Headers):**
- Authorization: Bearer {token}

## ملاحظات مهمة:
1. جميع الطلبات تتطلب توكن المصادقة (Authentication token).
2. يجب إرسال التوكن في رأس الطلب (header) بالصيغة: `Authorization: Bearer {token}`.
3. جميع الاستجابات تكون بصيغة JSON.
4. في حالة حدوث خطأ، سيتم إرجاع رسالة خطأ مع رمز الحالة المناسب.
5. يتم تحديث التقدم تلقائياً عند مشاهدة الفيديوهات.
6. يمكن الوصول إلى الملاحظات الخاصة بدورة معينة عن طريق تمرير معرف الدورة كمعامل في الاستعلام.

## أمثلة على الاستخدام:

### مثال على تحديث تقدم الدورة:
```javascript
const updateProgress = async (courseId, token) => {
  const response = await fetch(`https://api.example.com/v1/courses/${courseId}/progress`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      progress: 75,
      videos_completed: 15
    })
  });
  return await response.json();
};
```

### مثال على إنشاء ملاحظة جديدة:
```javascript
const createNote = async (courseId, content, token) => {
  const response = await fetch('https://api.example.com/v1/notes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      course_id: courseId,
      content: content
    })
  });
  return await response.json();
};
```

### مثال على حفظ دورة:
```javascript
const saveCourse = async (courseId, token) => {
  const response = await fetch(`https://api.example.com/v1/saved-courses/${courseId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
``` 