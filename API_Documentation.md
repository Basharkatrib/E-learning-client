## توثيق الدفع وواجهات API

### الهدف
شرح تدفق الدفع في المنصّة، ما هي واجهات الـ API المستخدمة، كيف تم استخدامها في الواجهة الأمامية، ولماذا تم اتخاذ هذه القرارات.

---

### نظرة عامة على تدفق الدفع
- **الدورات المجانية**
  - عند فتح صفحة الدورة، نتحقق تلقائياً من حالة تسجيل المستخدم في الدورة.
  - إذا كان مسجلاً نعرض فوراً أزرار «مشاهدة الفيديوهات / إلغاء التسجيل».
  - عند الضغط على «سجّل مجاناً» يتم تسجيله مباشرة بدون أي خطوات دفع.

- **الدورات المدفوعة**
  - من صفحة الدورة نُحوِّل المستخدم إلى صفحة Checkout.
  - عند الضغط على «إتمام الدفع» يتم إنشاء «طلب دفع» يعرض QR للمدرّس حسب الوسيلة المختارة (Syriatel أو MTN).
  - حالة الدفع تكون Pending حتى يقبل المدرّس الطلب يدويّاً من لوحة التحكم، ثم تتحول إلى Paid/Accepted ويصبح بإمكان المستخدم مشاهدة الفيديوهات.

لماذا هذا التدفق؟
- لأن قبول الدفع يتم يدوياً بعد استلام الحوالة، فتم فصل «إنشاء الطلب» عن «التفعيل»، مع نقطة تحقق لاحقة لحالة الدفع.

---

### واجهات API الأساسية (Backend)



2) التسجيل/إنشاء طلب دفع
- Method: POST
- Path: `/api/v1/courses/{course}/enroll`
- Auth: Bearer token
- السلوك:
  - إن كانت الدورة مجانية: تفعيل فوري وإرجاع نجاح.
  - إن كانت مدفوعة: يتم إنشاء «طلب دفع»، وقد تعود الاستجابة بحالة 200 أو 402 مع تفاصيل QR.

مثال استجابة لحالة «Payment Required»:
```json
{
  "status": "payment_required",
  "payment_details": {
    "teacherQRCodes": {
      "syriatel": "https://.../qr-syr.png",
      "mtn": "https://.../qr-mtn.png"
    },
    "amount": 25000,
    "currency": "SYP"
  }
}
```

3) حالة الدفع (مدفوع فقط)
- Method: GET
- Path: `/api/v1/courses/{course}/payment-status`
- Auth: Bearer token
- يحدد الحالة الحالية:
```json
{
  "paymentStatus": "pending",    // pending | paid | rejected
  "enrollmentStatus": "waiting"   // waiting | accepted | rejected
}
```

4) فحص الاشتراك (مخصّص للمجاني)
- Method: POST
- Path: `/api/v1/enrollment/check`
- Auth: Bearer token
- Body:
```json
{ "userId": 5, "courseId": 12 }
```



// Pusher code

اطلبي من Chat gpt يعملك تحويل هاد الكود الى كود فلاتر واسأليه شو المكتبة يلي لازم تنزليا عندك بالفرونت

ال Api key

VITE_PUSHER_API_KEY=3bf9a9c0257b12e21397

useEffect(() => {
    if (!currentUser?.id) return;
    Pusher.logToConsole = true;

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_API_KEY, {
      cluster: 'eu',
    });
    const channel = pusher.subscribe('user-notifications-' + currentUser.id);
    channel.bind('enrollment-accepted', function (data) {
      // Add notification to Redux store
      dispatch(addNotification({
        id: Date.now(), // Use timestamp as unique ID
        message: data.data.message || 'New notification received!',
        read: false,
        timestamp: new Date().toISOString()
      }));

      // Show toast notification
      toast(data.data.message || 'New notification received!', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: theme === 'dark' ? '#1F2937' : '#fff',
          color: theme === 'dark' ? '#fff' : '#000',
          border: '1px solid #6D28D9',
        },
        icon: '🔔',
      });
    });

    // Listen for role update events on the same channel
    channel.bind('role-updated', (payload) => {
      const message =
        payload?.data?.message ??
        payload?.message ??
        payload?.data?.data?.message ??
        'تم تحديث صلاحيات حسابك.';

      dispatch(addNotification({
        id: Date.now(),
        message,
        read: false,
        timestamp: new Date().toISOString(),
      }));

      toast(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: theme === 'dark' ? '#1F2937' : '#fff',
          color: theme === 'dark' ? '#fff' : '#000',
          border: '1px solid #6D28D9',
        },
        icon: '🔄',
      });
    });

    return () => {
      channel.unbind('enrollment-accepted');
      channel.unbind('role-updated');
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [currentUser?.id, theme, dispatch]);


