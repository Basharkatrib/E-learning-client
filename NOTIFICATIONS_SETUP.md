# نظام الإشعارات - Notifications System

## نظرة عامة

تم إعداد نظام إشعارات فوري يعمل عند إنشاء كورس جديد. النظام يستخدم Pusher للبث المباشر و Redux للتحكم في حالة الإشعارات.

## المكونات المضافة

### الخادم (Backend)

1. **CourseCreated Event** (`E-Learning-Server/app/Events/CourseCreated.php`)
   - Event يتم تشغيله عند إنشاء كورس جديد
   - يرسل بيانات الكورس عبر Pusher

2. **CreateCourse Page** (`E-Learning-Server/app/Filament/Resources/CourseResource/Pages/CreateCourse.php`)
   - تم تعديله لإرسال الإشعار عند إنشاء كورس جديد

3. **Broadcasting Config** (`E-Learning-Server/config/broadcasting.php`)
   - إعدادات Pusher للبث المباشر

4. **AppServiceProvider** (`E-Learning-Server/app/Providers/AppServiceProvider.php`)
   - تم إضافة Broadcast::routes() لتفعيل البث

### الواجهة الأمامية (Frontend)

1. **App.jsx** - تم تفعيل Pusher listener
2. **Navbar.jsx** - يحتوي على نظام إشعارات كامل
3. **notificationsSlice.js** - إدارة حالة الإشعارات

## كيفية الإعداد

### 1. إعداد Pusher

1. إنشاء حساب في [Pusher](https://pusher.com/)
2. إنشاء تطبيق جديد
3. إضافة المتغيرات التالية إلى ملف `.env`:

```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

### 2. تشغيل الخادم

```bash
cd E-Learning-Server
php artisan serve
```

### 3. تشغيل الواجهة الأمامية

```bash
cd learning-client
npm run dev
```

## كيفية العمل

1. عند إنشاء كورس جديد من لوحة التحكم (Filament)
2. يتم تشغيل `CourseCreated` event
3. يتم إرسال البيانات عبر Pusher إلى جميع المستخدمين المتصلين
4. الواجهة الأمامية تستقبل الإشعار وتضيفه إلى Redux store
5. يظهر الإشعار في Navbar مع عداد الإشعارات غير المقروءة

## الميزات

- ✅ إشعارات فورية
- ✅ عداد الإشعارات غير المقروءة
- ✅ إمكانية تحديد الإشعار كمقروء
- ✅ إمكانية حذف الإشعار
- ✅ إمكانية تحديد الكل كمقروء
- ✅ إمكانية مسح جميع الإشعارات
- ✅ تصميم متجاوب (Mobile & Desktop)
- ✅ دعم الوضع المظلم
- ✅ دعم اللغة العربية والإنجليزية

## اختبار النظام

1. افتح التطبيق في متصفحين مختلفين
2. سجل دخول كمدير في أحد المتصفحين
3. أنشئ كورس جديد من لوحة التحكم
4. ستظهر الإشعارات في المتصفح الآخر فوراً 