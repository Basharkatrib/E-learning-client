# توثيق APIs - نظام التعلم الإلكتروني (Flutter)

## جدول المحتويات
1. [APIs الكويزات](#quiz-apis)
2. [API الذكاء الاصطناعي](#ai-api)
3. [Pusher Real-time Notifications](#pusher-notifications)
4. [التوثيق التقني](#technical-documentation)


## APIs الكويزات

### 1. الحصول على الكويزات (Get Quizzes)

#### Endpoint
```
GET /api/v1/courses/{courseId}/quiz
```

#### الوصف
يحصل على جميع الكويزات المتاحة لدورة معينة.

#### المعاملات (Parameters)
- `courseId` (path parameter): معرف الدورة
- `token` (header): رمز المصادقة

#### الاستجابة (Response)
```json
{
  "data": [
    {
      "id": 1,
      "title": "كويز الوحدة الأولى",
      "description": "كويز شامل للوحدة الأولى",
      "time_limit": 30,
      "passing_score": 70,
      "questions": [
        {
          "id": 1,
          "question_text": "ما هو التعريف الصحيح للبرمجة؟",
          "options": [
            {
              "id": 1,
              "option_text": "كتابة تعليمات للحاسوب"
            },
            {
              "id": 2,
              "option_text": "تصميم الواجهات"
            }
          ]
        }
      ]
    }
  ]
}
```

#### الاستخدام في الكود
```dart
// في Flutter
class QuizService {
  final Dio _dio = Dio();
  
  Future<List<Quiz>> getQuizzes(int courseId, String token) async {
    try {
      final response = await _dio.get(
        '/api/v1/courses/$courseId/quiz',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );
      
      return (response.data['data'] as List)
          .map((json) => Quiz.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('فشل في جلب الكويزات: $e');
    }
  }
}

// استخدام في Widget
class QuizPage extends StatefulWidget {
  @override
  _QuizPageState createState() => _QuizPageState();
}

class _QuizPageState extends State<QuizPage> {
  List<Quiz> quizzes = [];
  bool isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadQuizzes();
  }
  
  Future<void> _loadQuizzes() async {
    try {
      final quizService = QuizService();
      final token = await getToken(); // من SharedPreferences
      final result = await quizService.getQuizzes(widget.courseId, token);
      setState(() {
        quizzes = result;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('خطأ في تحميل الكويزات')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    
    return ListView.builder(
      itemCount: quizzes.length,
      itemBuilder: (context, index) {
        final quiz = quizzes[index];
        return QuizCard(quiz: quiz);
      },
    );
  }
}
```

---

### 2. التحقق من محاولة الكويز (Check Quiz Attempt)

#### Endpoint
```
GET /api/v1/courses/{courseId}/quizzes/{quizId}/attempt-status
```

#### الوصف
يتحقق من حالة محاولة الكويز للمستخدم (هل قام بالمحاولة أم لا).

#### المعاملات
- `courseId` (path parameter): معرف الدورة
- `quizId` (path parameter): معرف الكويز
- `token` (header): رمز المصادقة

#### الاستجابة
```json
{
  "has_attempted": true,
  "latest_attempt": {
    "id": 123,
    "status": "completed",
    "score": 85,
    "passed": true,
    "completed_at": "2024-01-15T10:30:00Z",
    "answers": {
      "1": 2,
      "2": 1
    }
  }
}
```

#### الاستخدام في الكود
```dart
// في Flutter
class QuizAttemptService {
  final Dio _dio = Dio();
  
  Future<AttemptStatus> checkQuizAttempt(int courseId, int quizId, String token) async {
    try {
      final response = await _dio.get(
        '/api/v1/courses/$courseId/quizzes/$quizId/attempt-status',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );
      
      return AttemptStatus.fromJson(response.data);
    } catch (e) {
      throw Exception('فشل في التحقق من محاولة الكويز: $e');
    }
  }
}

// نموذج البيانات
class AttemptStatus {
  final bool hasAttempted;
  final QuizAttempt? latestAttempt;
  
  AttemptStatus({
    required this.hasAttempted,
    this.latestAttempt,
  });
  
  factory AttemptStatus.fromJson(Map<String, dynamic> json) {
    return AttemptStatus(
      hasAttempted: json['has_attempted'] ?? false,
      latestAttempt: json['latest_attempt'] != null 
          ? QuizAttempt.fromJson(json['latest_attempt']) 
          : null,
    );
  }
}

// استخدام في Widget
class QuizAttemptWidget extends StatefulWidget {
  @override
  _QuizAttemptWidgetState createState() => _QuizAttemptWidgetState();
}

class _QuizAttemptWidgetState extends State<QuizAttemptWidget> {
  AttemptStatus? attemptStatus;
  bool isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _checkAttempt();
  }
  
  Future<void> _checkAttempt() async {
    try {
      final service = QuizAttemptService();
      final token = await getToken();
      final result = await service.checkQuizAttempt(
        widget.courseId, 
        widget.quizId, 
        token
      );
      setState(() {
        attemptStatus = result;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    
    if (attemptStatus?.hasAttempted == true) {
      return Card(
        child: ListTile(
          title: Text('تم إكمال الكويز مسبقاً'),
          subtitle: Text('النتيجة: ${attemptStatus!.latestAttempt?.score}%'),
          trailing: Icon(Icons.check_circle, color: Colors.green),
        ),
      );
    }
    
    return Container(); // عرض الكويز
  }
}
```

---

### 3. إرسال الكويز (Submit Quiz)

#### Endpoint
```
POST /api/v1/courses/{courseId}/quiz/{quizId}/submit
```

#### الوصف
يرسل إجابات الكويز ويحسب النتيجة.

#### المعاملات
- `courseId` (path parameter): معرف الدورة
- `quizId` (path parameter): معرف الكويز
- `token` (header): رمز المصادقة
- `answers` (body): الإجابات المختارة

#### Body Example
```json
{
  "answers": {
    "1": 2,
    "2": 1,
    "3": 3
  }
}
```

#### الاستجابة
```json
{
  "status": "success",
  "attemptId": 123,
  "score": 85,
  "passed": true,
  "correct_answers": 17,
  "total_questions": 20,
  "message": "تم إرسال الكويز بنجاح"
}
```

#### الاستخدام في الكود
```dart
// في Flutter
class QuizSubmissionService {
  final Dio _dio = Dio();
  
  Future<QuizResult> submitQuiz(int courseId, int quizId, Map<String, int> answers, String token) async {
    try {
      final response = await _dio.post(
        '/api/v1/courses/$courseId/quiz/$quizId/submit',
        data: {
          'answers': answers,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
        ),
      );
      
      return QuizResult.fromJson(response.data);
    } catch (e) {
      throw Exception('فشل في إرسال الكويز: $e');
    }
  }
}

// نموذج النتيجة
class QuizResult {
  final String status;
  final int? attemptId;
  final double score;
  final bool passed;
  final int correctAnswers;
  final int totalQuestions;
  final String message;
  
  QuizResult({
    required this.status,
    this.attemptId,
    required this.score,
    required this.passed,
    required this.correctAnswers,
    required this.totalQuestions,
    required this.message,
  });
  
  factory QuizResult.fromJson(Map<String, dynamic> json) {
    return QuizResult(
      status: json['status'] ?? '',
      attemptId: json['attemptId'],
      score: (json['score'] ?? 0).toDouble(),
      passed: json['passed'] ?? false,
      correctAnswers: json['correct_answers'] ?? 0,
      totalQuestions: json['total_questions'] ?? 0,
      message: json['message'] ?? '',
    );
  }
}

// استخدام في Widget
class QuizSubmissionWidget extends StatefulWidget {
  @override
  _QuizSubmissionWidgetState createState() => _QuizSubmissionWidgetState();
}

class _QuizSubmissionWidgetState extends State<QuizSubmissionWidget> {
  Map<String, int> selectedAnswers = {};
  bool isSubmitting = false;
  
  Future<void> _submitQuiz() async {
    if (selectedAnswers.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('يرجى الإجابة على جميع الأسئلة')),
      );
      return;
    }
    
    setState(() {
      isSubmitting = true;
    });
    
    try {
      final service = QuizSubmissionService();
      final token = await getToken();
      final result = await service.submitQuiz(
        widget.courseId,
        widget.quizId,
        selectedAnswers,
        token,
      );
      
      // عرض النتيجة
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(result.passed ? 'تهانينا!' : 'حاول مرة أخرى'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('النتيجة: ${result.score.toStringAsFixed(1)}%'),
              Text('الإجابات الصحيحة: ${result.correctAnswers}/${result.totalQuestions}'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('حسناً'),
            ),
          ],
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('خطأ في إرسال الكويز')),
      );
    } finally {
      setState(() {
        isSubmitting = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: isSubmitting ? null : _submitQuiz,
      child: isSubmitting 
          ? CircularProgressIndicator(color: Colors.white)
          : Text('إرسال الكويز'),
    );
  }
}
```

---

### 4. الحصول على نتائج الكويز (Get Quiz Results)

#### Endpoint
```
POST /api/v1/quiz-attempts/{attemptId}/results
```

#### الوصف
يحصل على التحليل التفصيلي لنتائج الكويز.

#### المعاملات
- `attemptId` (path parameter): معرف المحاولة
- `token` (header): رمز المصادقة

#### الاستجابة
```json
{
  "data": {
    "score": 85,
    "passed": true,
    "correct_answers": 17,
    "total_questions": 20,
    "answer_analysis": [
      {
        "question_id": 1,
        "question_text": "ما هو التعريف الصحيح للبرمجة؟",
        "user_answer": {
          "option_id": 2,
          "is_correct": 1
        },
        "correct_answer": {
          "option_id": 2,
          "text": "كتابة تعليمات للحاسوب"
        },
        "all_options": [
          {
            "id": 1,
            "text": "تصميم الواجهات"
          },
          {
            "id": 2,
            "text": "كتابة تعليمات للحاسوب"
          }
        ]
      }
    ]
  }
}
```

#### الاستخدام في الكود
```dart
// في Flutter
class QuizResultsService {
  final Dio _dio = Dio();
  
  Future<DetailedQuizResult> getQuizResults(int attemptId, String token) async {
    try {
      final response = await _dio.post(
        '/api/v1/quiz-attempts/$attemptId/results',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );
      
      return DetailedQuizResult.fromJson(response.data['data']);
    } catch (e) {
      throw Exception('فشل في جلب نتائج الكويز: $e');
    }
  }
}

// نموذج النتائج التفصيلية
class DetailedQuizResult {
  final double score;
  final bool passed;
  final int correctAnswers;
  final int totalQuestions;
  final List<QuestionAnalysis> answerAnalysis;
  
  DetailedQuizResult({
    required this.score,
    required this.passed,
    required this.correctAnswers,
    required this.totalQuestions,
    required this.answerAnalysis,
  });
  
  factory DetailedQuizResult.fromJson(Map<String, dynamic> json) {
    return DetailedQuizResult(
      score: (json['score'] ?? 0).toDouble(),
      passed: json['passed'] ?? false,
      correctAnswers: json['correct_answers'] ?? 0,
      totalQuestions: json['total_questions'] ?? 0,
      answerAnalysis: (json['answer_analysis'] as List)
          .map((item) => QuestionAnalysis.fromJson(item))
          .toList(),
    );
  }
}

class QuestionAnalysis {
  final int questionId;
  final String questionText;
  final UserAnswer userAnswer;
  final CorrectAnswer correctAnswer;
  final List<QuizOption> allOptions;
  
  QuestionAnalysis({
    required this.questionId,
    required this.questionText,
    required this.userAnswer,
    required this.correctAnswer,
    required this.allOptions,
  });
  
  factory QuestionAnalysis.fromJson(Map<String, dynamic> json) {
    return QuestionAnalysis(
      questionId: json['question_id'],
      questionText: json['question_text'],
      userAnswer: UserAnswer.fromJson(json['user_answer']),
      correctAnswer: CorrectAnswer.fromJson(json['correct_answer']),
      allOptions: (json['all_options'] as List)
          .map((item) => QuizOption.fromJson(item))
          .toList(),
    );
  }
}

// استخدام في Widget
class QuizResultsWidget extends StatefulWidget {
  @override
  _QuizResultsWidgetState createState() => _QuizResultsWidgetState();
}

class _QuizResultsWidgetState extends State<QuizResultsWidget> {
  DetailedQuizResult? results;
  bool isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadResults();
  }
  
  Future<void> _loadResults() async {
    try {
      final service = QuizResultsService();
      final token = await getToken();
      final result = await service.getQuizResults(widget.attemptId, token);
      setState(() {
        results = result;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('خطأ في تحميل النتائج')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    
    if (results == null) {
      return Center(child: Text('لا توجد نتائج'));
    }
    
    return Column(
      children: [
        // ملخص النتيجة
        Card(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              children: [
                Text(
                  'النتيجة: ${results!.score.toStringAsFixed(1)}%',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                Text(
                  'الإجابات الصحيحة: ${results!.correctAnswers}/${results!.totalQuestions}',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                Icon(
                  results!.passed ? Icons.check_circle : Icons.cancel,
                  color: results!.passed ? Colors.green : Colors.red,
                  size: 48,
                ),
              ],
            ),
          ),
        ),
        
        // تحليل الأسئلة
        Expanded(
          child: ListView.builder(
            itemCount: results!.answerAnalysis.length,
            itemBuilder: (context, index) {
              final analysis = results!.answerAnalysis[index];
              return QuestionAnalysisCard(analysis: analysis);
            },
          ),
        ),
      ],
    );
  }
}
```

---

### 5. الحصول على الشهادة (Get Certificate)

#### Endpoint
```
POST /api/v1/courses/{courseId}/certificate
```

#### الوصف
يولد شهادة إتمام الدورة بعد اجتياز الكويز.

#### المعاملات
- `courseId` (path parameter): معرف الدورة
- `token` (header): رمز المصادقة
- `quiz_id` (body): معرف الكويز

#### Body Example
```json
{
  "quiz_id": 1
}
```

#### الاستجابة
```json
{
  "status": "success",
  "data": {
    "certificateUrl": "https://example.com/certificates/cert_123.pdf"
  }
}
```

#### الاستخدام في الكود
```dart
// في Flutter
class CertificateService {
  final Dio _dio = Dio();
  
  Future<CertificateResponse> getCertificate(int courseId, int quizId, String token) async {
    try {
      final response = await _dio.post(
        '/api/v1/courses/$courseId/certificate',
        data: {
          'quiz_id': quizId,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'Accept': 'application/pdf',
          },
        ),
      );
      
      return CertificateResponse.fromJson(response.data);
    } catch (e) {
      throw Exception('فشل في توليد الشهادة: $e');
    }
  }
}

// نموذج استجابة الشهادة
class CertificateResponse {
  final String status;
  final CertificateData? data;
  
  CertificateResponse({
    required this.status,
    this.data,
  });
  
  factory CertificateResponse.fromJson(Map<String, dynamic> json) {
    return CertificateResponse(
      status: json['status'] ?? '',
      data: json['data'] != null ? CertificateData.fromJson(json['data']) : null,
    );
  }
}

class CertificateData {
  final String certificateUrl;
  
  CertificateData({
    required this.certificateUrl,
  });
  
  factory CertificateData.fromJson(Map<String, dynamic> json) {
    return CertificateData(
      certificateUrl: json['certificateUrl'] ?? '',
    );
  }
}

// استخدام في Widget
class CertificateWidget extends StatefulWidget {
  @override
  _CertificateWidgetState createState() => _CertificateWidgetState();
}

class _CertificateWidgetState extends State<CertificateWidget> {
  bool isLoading = false;
  String? certificateUrl;
  
  Future<void> _generateCertificate() async {
    setState(() {
      isLoading = true;
    });
    
    try {
      final service = CertificateService();
      final token = await getToken();
      final response = await service.getCertificate(
        widget.courseId,
        widget.quizId,
        token,
      );
      
      if (response.status == 'success' && response.data?.certificateUrl != null) {
        setState(() {
          certificateUrl = response.data!.certificateUrl;
        });
        
        // فتح الشهادة في المتصفح أو تطبيق PDF
        await _openCertificate(response.data!.certificateUrl);
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('تم توليد الشهادة بنجاح!')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('فشل في توليد الشهادة')),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }
  
  Future<void> _openCertificate(String url) async {
    // استخدام url_launcher لفتح الشهادة
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(
              Icons.verified,
              size: 64,
              color: Colors.green,
            ),
            SizedBox(height: 16),
            Text(
              'شهادة إتمام الدورة',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            SizedBox(height: 8),
            Text(
              'احصل على شهادة إتمام الدورة بعد اجتياز الكويز',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: isLoading ? null : _generateCertificate,
              icon: isLoading 
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Icon(Icons.download),
              label: Text(isLoading ? 'جاري التوليد...' : 'توليد الشهادة'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## API الذكاء الاصطناعي

### Endpoint
```
POST https://waraqh.buildship.run/quickApi-ccc1f5022b0d
```

### الوصف
API للذكاء الاصطناعي يوفر مساعد ذكي للإجابة على أسئلة المستخدمين.

### المعاملات
- `string` (body): السؤال أو الرسالة من المستخدم

### Body Example
```json
{
  "string": "ما هي أفضل طريقة لتعلم البرمجة؟"
}
```

### الاستجابة
```
نص الإجابة من الذكاء الاصطناعي (plain text)
```

### الاستخدام في الكود
```dart
// في Flutter
import 'package:http/http.dart' as http;
import 'dart:convert';

class AIService {
  static const String _baseUrl = 'https://waraqh.buildship.run/quickApi-ccc1f5022b0d';
  
  Future<String> sendMessage(String message) async {
    try {
      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'string': message,
        }),
      );
      
      if (response.statusCode == 200) {
        return response.body;
      } else {
        throw Exception('فشل في الاتصال: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('خطأ في الاتصال: $e');
    }
  }
}

// نموذج الرسالة
class ChatMessage {
  final String question;
  final String answer;
  final DateTime timestamp;
  final bool isUser;
  
  ChatMessage({
    required this.question,
    required this.answer,
    required this.timestamp,
    required this.isUser,
  });
}

// Widget للدردشة
class ChatWidget extends StatefulWidget {
  @override
  _ChatWidgetState createState() => _ChatWidgetState();
}

class _ChatWidgetState extends State<ChatWidget> {
  final TextEditingController _messageController = TextEditingController();
  final List<ChatMessage> _messages = [];
  final AIService _aiService = AIService();
  bool _isLoading = false;
  
  Future<void> _sendMessage() async {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;
    
    // إضافة رسالة المستخدم
    final userMessage = ChatMessage(
      question: message,
      answer: '',
      timestamp: DateTime.now(),
      isUser: true,
    );
    
    setState(() {
      _messages.add(userMessage);
      _isLoading = true;
    });
    
    _messageController.clear();
    
    try {
      // إرسال الرسالة إلى AI
      final response = await _aiService.sendMessage(message);
      
      // إضافة رد AI
      final aiMessage = ChatMessage(
        question: message,
        answer: response,
        timestamp: DateTime.now(),
        isUser: false,
      );
      
      setState(() {
        _messages.add(aiMessage);
        _isLoading = false;
      });
    } catch (e) {
      // إضافة رسالة خطأ
      final errorMessage = ChatMessage(
        question: message,
        answer: 'عذراً، حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.',
        timestamp: DateTime.now(),
        isUser: false,
      );
      
      setState(() {
        _messages.add(errorMessage);
        _isLoading = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('خطأ في الاتصال')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // منطقة الرسائل
        Expanded(
          child: ListView.builder(
            reverse: true,
            itemCount: _messages.length,
            itemBuilder: (context, index) {
              final message = _messages[_messages.length - 1 - index];
              return _buildMessageBubble(message);
            },
          ),
        ),
        
        // مؤشر التحميل
        if (_isLoading)
          Padding(
            padding: EdgeInsets.all(8),
            child: Row(
              children: [
                SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                SizedBox(width: 8),
                Text('جاري الكتابة...'),
              ],
            ),
          ),
        
        // منطقة إدخال الرسالة
        Padding(
          padding: EdgeInsets.all(8),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _messageController,
                  decoration: InputDecoration(
                    hintText: 'اكتب رسالتك هنا...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                  ),
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
              SizedBox(width: 8),
              FloatingActionButton(
                onPressed: _isLoading ? null : _sendMessage,
                child: Icon(Icons.send),
                mini: true,
              ),
            ],
          ),
        ),
      ],
    );
  }
  
  Widget _buildMessageBubble(ChatMessage message) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Row(
        mainAxisAlignment: message.isUser 
            ? MainAxisAlignment.end 
            : MainAxisAlignment.start,
        children: [
          if (!message.isUser) ...[
            CircleAvatar(
              backgroundColor: Colors.blue,
              child: Icon(Icons.smart_toy, color: Colors.white),
            ),
            SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: message.isUser 
                    ? Colors.blue 
                    : Colors.grey[200],
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    message.isUser ? message.question : message.answer,
                    style: TextStyle(
                      color: message.isUser ? Colors.white : Colors.black,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    _formatTime(message.timestamp),
                    style: TextStyle(
                      fontSize: 12,
                      color: message.isUser 
                          ? Colors.white70 
                          : Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (message.isUser) ...[
            SizedBox(width: 8),
            CircleAvatar(
              backgroundColor: Colors.green,
              child: Icon(Icons.person, color: Colors.white),
            ),
          ],
        ],
      ),
    );
  }
  
  String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }
  
  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }
}
```

---

## Pusher Real-time Notifications

### الوصف
نظام إشعارات في الوقت الفعلي باستخدام Pusher لإرسال واستقبال الإشعارات الفورية.

### التثبيت والإعداد

#### 1. تثبيت المكتبة
```bash
npm install pusher-js
```

#### 2. متغيرات البيئة
```env
VITE_PUSHER_API_KEY=your_pusher_api_key
VITE_PUSHER_CLUSTER=eu
```

### إعداد Pusher في التطبيق

#### 1. إعداد State Management (Provider/Riverpod)
```dart
// lib/providers/notification_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Notification {
  final String id;
  final String message;
  final String type;
  final bool read;
  final DateTime timestamp;
  final Map<String, dynamic> data;
  
  Notification({
    required this.id,
    required this.message,
    required this.type,
    required this.read,
    required this.timestamp,
    required this.data,
  });
  
  Notification copyWith({
    String? id,
    String? message,
    String? type,
    bool? read,
    DateTime? timestamp,
    Map<String, dynamic>? data,
  }) {
    return Notification(
      id: id ?? this.id,
      message: message ?? this.message,
      type: type ?? this.type,
      read: read ?? this.read,
      timestamp: timestamp ?? this.timestamp,
      data: data ?? this.data,
    );
  }
}

class NotificationNotifier extends StateNotifier<List<Notification>> {
  NotificationNotifier() : super([]);
  
  void addNotification(Notification notification) {
    state = [notification, ...state];
  }
  
  void markAsRead(String id) {
    state = state.map((notification) {
      if (notification.id == id && !notification.read) {
        return notification.copyWith(read: true);
      }
      return notification;
    }).toList();
  }
  
  void markAllAsRead() {
    state = state.map((notification) {
      return notification.copyWith(read: true);
    }).toList();
  }
  
  void clearAll() {
    state = [];
  }
  
  int get unreadCount => state.where((n) => !n.read).length;
}

final notificationProvider = StateNotifierProvider<NotificationNotifier, List<Notification>>(
  (ref) => NotificationNotifier(),
);

final unreadCountProvider = Provider<int>((ref) {
  final notifications = ref.watch(notificationProvider);
  return notifications.where((n) => !n.read).length;
});
```

#### 2. إعداد Pusher في Flutter
```dart
// lib/services/pusher_service.dart
import 'package:pusher_channels_flutter/pusher_channels_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PusherService {
  static PusherChannelsFlutter? _pusher;
  
  static Future<void> initialize() async {
    _pusher = PusherChannelsFlutter.getInstance();
    
    try {
      await _pusher!.init(
        apiKey: 'your_pusher_api_key',
        cluster: 'eu',
      );
      
      await _pusher!.connect();
      print('Connected to Pusher');
    } catch (e) {
      print('Pusher connection error: $e');
    }
  }
  
  static Future<void> subscribeToChannel(String channelName, WidgetRef ref) async {
    if (_pusher == null) return;
    
    try {
      await _pusher!.subscribe(
        channelName: channelName,
        onEvent: (event) {
          _handleEvent(event, ref);
        },
      );
      
      print('Subscribed to channel: $channelName');
    } catch (e) {
      print('Subscription error: $e');
    }
  }
  
  static void _handleEvent(PusherEvent event, WidgetRef ref) {
    print('Received event: ${event.eventName}');
    
    switch (event.eventName) {
      case 'new-notification':
        _handleNewNotification(event, ref);
        break;
      case 'course-update':
        _handleCourseUpdate(event, ref);
        break;
      case 'quiz-result':
        _handleQuizResult(event, ref);
        break;
    }
  }
  
  static void _handleNewNotification(PusherEvent event, WidgetRef ref) {
    try {
      final data = event.data;
      final notification = Notification(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        message: data['message'] ?? 'إشعار جديد!',
        type: data['type'] ?? 'info',
        read: false,
        timestamp: DateTime.now(),
        data: data['data'] ?? {},
      );
      
      ref.read(notificationProvider.notifier).addNotification(notification);
      
      // عرض SnackBar
      _showSnackBar(notification.message);
    } catch (e) {
      print('Error handling new notification: $e');
    }
  }
  
  static void _handleCourseUpdate(PusherEvent event, WidgetRef ref) {
    try {
      final data = event.data;
      final notification = Notification(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        message: 'تم تحديث الدورة: ${data['courseName']}',
        type: 'course-update',
        read: false,
        timestamp: DateTime.now(),
        data: data,
      );
      
      ref.read(notificationProvider.notifier).addNotification(notification);
    } catch (e) {
      print('Error handling course update: $e');
    }
  }
  
  static void _handleQuizResult(PusherEvent event, WidgetRef ref) {
    try {
      final data = event.data;
      final notification = Notification(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        message: 'نتيجة الكويز: ${data['score']}%',
        type: 'quiz-result',
        read: false,
        timestamp: DateTime.now(),
        data: data,
      );
      
      ref.read(notificationProvider.notifier).addNotification(notification);
    } catch (e) {
      print('Error handling quiz result: $e');
    }
  }
  
  static void _showSnackBar(String message) {
    // استخدام GlobalKey للوصول إلى ScaffoldMessenger
    // أو تمرير BuildContext من Widget
  }
  
  static void disconnect() {
    _pusher?.disconnect();
  }
}

// استخدام في main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // تهيئة Pusher
  await PusherService.initialize();
  
  runApp(
    ProviderScope(
      child: MyApp(),
    ),
  );
}

// استخدام في Widget
class MyApp extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // الاشتراك في القناة عند بدء التطبيق
    WidgetsBinding.instance.addPostFrameCallback((_) {
      PusherService.subscribeToChannel('notifications-channel', ref);
    });
    
    return MaterialApp(
      home: HomePage(),
    );
  }
}
```

### أنواع الإشعارات المدعومة

#### 1. إشعارات عامة
```javascript
// إشعار بسيط
{
  message: "مرحباً بك في منصة التعلم!",
  type: "info"
}
```

#### 2. إشعارات الدورة
```javascript
// تحديث الدورة
{
  message: "تم إضافة محتوى جديد للدورة",
  type: "course-update",
  data: {
    courseId: 1,
    courseName: "مقدمة في البرمجة",
    newContent: "فيديو جديد"
  }
}
```

#### 3. إشعارات الكويز
```javascript
// نتيجة الكويز
{
  message: "تم تصحيح الكويز بنجاح",
  type: "quiz-result",
  data: {
    courseId: 1,
    quizId: 1,
    score: 85,
    passed: true
  }
}
```

### إدارة الإشعارات

#### 1. عرض الإشعارات
```dart
// lib/widgets/notifications_widget.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

class NotificationsWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(notificationProvider);
    final unreadCount = ref.watch(unreadCountProvider);
    
    return Column(
      children: [
        // شارة الإشعارات
        if (unreadCount > 0)
          Container(
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.red,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              unreadCount.toString(),
              style: TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        
        // قائمة الإشعارات
        Expanded(
          child: ListView.builder(
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final notification = notifications[index];
              return NotificationCard(notification: notification);
            },
          ),
        ),
      ],
    );
  }
}

class NotificationCard extends ConsumerWidget {
  final Notification notification;
  
  const NotificationCard({Key? key, required this.notification}) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      color: notification.read ? Colors.grey[100] : Colors.blue[50],
      child: ListTile(
        leading: _getNotificationIcon(notification.type),
        title: Text(
          notification.message,
          style: TextStyle(
            fontWeight: notification.read ? FontWeight.normal : FontWeight.bold,
          ),
        ),
        subtitle: Text(
          _formatTimestamp(notification.timestamp),
          style: TextStyle(fontSize: 12),
        ),
        trailing: notification.read 
            ? null 
            : Icon(Icons.circle, color: Colors.blue, size: 12),
        onTap: () {
          ref.read(notificationProvider.notifier).markAsRead(notification.id);
          _handleNotificationTap(context, notification);
        },
      ),
    );
  }
  
  Widget _getNotificationIcon(String type) {
    switch (type) {
      case 'course-update':
        return Icon(Icons.school, color: Colors.blue);
      case 'quiz-result':
        return Icon(Icons.quiz, color: Colors.green);
      case 'info':
      default:
        return Icon(Icons.info, color: Colors.orange);
    }
  }
  
  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);
    
    if (difference.inMinutes < 1) {
      return 'الآن';
    } else if (difference.inHours < 1) {
      return 'منذ ${difference.inMinutes} دقيقة';
    } else if (difference.inDays < 1) {
      return 'منذ ${difference.inHours} ساعة';
    } else {
      return 'منذ ${difference.inDays} يوم';
    }
  }
  
  void _handleNotificationTap(BuildContext context, Notification notification) {
    // معالجة النقر على الإشعار
    switch (notification.type) {
      case 'course-update':
        // الانتقال إلى صفحة الدورة
        Navigator.pushNamed(
          context, 
          '/course/${notification.data['courseId']}'
        );
        break;
      case 'quiz-result':
        // الانتقال إلى صفحة نتائج الكويز
        Navigator.pushNamed(
          context, 
          '/quiz-result/${notification.data['quizId']}'
        );
        break;
    }
  }
}
```

#### 2. تحديث حالة الإشعار
```dart
// lib/widgets/notification_actions.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

class NotificationActions extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadCount = ref.watch(unreadCountProvider);
    
    return Row(
      children: [
        if (unreadCount > 0) ...[
          ElevatedButton.icon(
            onPressed: () {
              ref.read(notificationProvider.notifier).markAllAsRead();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('تم تحديد جميع الإشعارات كمقروءة')),
              );
            },
            icon: Icon(Icons.done_all),
            label: Text('تحديد الكل كمقروء'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
            ),
          ),
          SizedBox(width: 8),
          Text(
            '$unreadCount إشعارات غير مقروءة',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 12,
            ),
          ),
        ],
        Spacer(),
        PopupMenuButton<String>(
          onSelected: (value) {
            switch (value) {
              case 'mark_all_read':
                ref.read(notificationProvider.notifier).markAllAsRead();
                break;
              case 'clear_all':
                _showClearConfirmation(context, ref);
                break;
            }
          },
          itemBuilder: (context) => [
            PopupMenuItem(
              value: 'mark_all_read',
              child: Row(
                children: [
                  Icon(Icons.done_all),
                  SizedBox(width: 8),
                  Text('تحديد الكل كمقروء'),
                ],
              ),
            ),
            PopupMenuItem(
              value: 'clear_all',
              child: Row(
                children: [
                  Icon(Icons.clear_all),
                  SizedBox(width: 8),
                  Text('مسح جميع الإشعارات'),
                ],
              ),
            ),
          ],
          child: Icon(Icons.more_vert),
        ),
      ],
    );
  }
  
  void _showClearConfirmation(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('تأكيد المسح'),
        content: Text('هل أنت متأكد من مسح جميع الإشعارات؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () {
              ref.read(notificationProvider.notifier).clearAll();
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('تم مسح جميع الإشعارات')),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: Text('مسح'),
          ),
        ],
      ),
    );
  }
}

// استخدام في صفحة الإشعارات
class NotificationsPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: Text('الإشعارات'),
        actions: [
          IconButton(
            icon: Icon(Icons.settings),
            onPressed: () {
              // فتح إعدادات الإشعارات
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.all(16),
            child: NotificationActions(),
          ),
          Expanded(
            child: NotificationsWidget(),
          ),
        ],
      ),
    );
  }
}
```

### إعداد الخادم (Backend)

#### 1. تثبيت Pusher في Laravel
```bash
composer require pusher/pusher-php-server
```

#### 2. إعداد البيئة
```env
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=eu
```

#### 3. إرسال إشعار من الخادم
```php
// في Controller أو Event
use Pusher\Pusher;

$pusher = new Pusher(
    env('PUSHER_APP_KEY'),
    env('PUSHER_APP_SECRET'),
    env('PUSHER_APP_ID'),
    [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'useTLS' => true
    ]
);

// إرسال إشعار
$pusher->trigger('notifications-channel', 'new-notification', [
    'message' => 'تم إضافة دورة جديدة!',
    'type' => 'course-added',
    'data' => [
        'courseId' => $course->id,
        'courseName' => $course->title
    ]
]);
```

### أفضل الممارسات

#### 1. إدارة الاتصال
```javascript
// التحقق من حالة الاتصال
pusher.connection.bind('connected', () => {
  console.log('Connected to Pusher');
});

pusher.connection.bind('disconnected', () => {
  console.log('Disconnected from Pusher');
});

pusher.connection.bind('error', (err) => {
  console.error('Pusher connection error:', err);
});
```

#### 2. معالجة الأخطاء
```javascript
channel.bind('pusher:subscription_error', (status) => {
  console.error('Subscription error:', status);
  // إعادة المحاولة أو إظهار رسالة خطأ
});
```

#### 3. تحسين الأداء
```javascript
// إلغاء الاشتراك عند عدم الحاجة
useEffect(() => {
  if (!user || !user.isAuthenticated) {
    return;
  }
  
  // إعداد Pusher فقط للمستخدمين المسجلين
}, [user]);
```

### استكشاف الأخطاء

#### 1. مشاكل شائعة
- **خطأ في الاتصال**: التحقق من API key والـ cluster
- **عدم استقبال الإشعارات**: التحقق من اسم القناة والحدث
- **مشاكل في التصريح**: إعداد قواعد التصريح في Pusher Dashboard

#### 2. أدوات التشخيص
```javascript
// تفعيل تسجيل Pusher
Pusher.logToConsole = true;

// مراقبة الأحداث
channel.bind('pusher:subscription_succeeded', () => {
  console.log('Successfully subscribed to channel');
});
```

---

## التوثيق التقني

### التراتبية (Hierarchy)

#### 1. إدارة الحالة (State Management)
```dart
// Flutter/Riverpod State Structure
class AppState {
  final List<Notification> notifications;
  final User? currentUser;
  final String? authToken;
  final bool isLoading;
  
  AppState({
    required this.notifications,
    this.currentUser,
    this.authToken,
    required this.isLoading,
  });
}

// Providers Structure
final authProvider = StateNotifierProvider<AuthNotifier, User?>((ref) => AuthNotifier());
final notificationProvider = StateNotifierProvider<NotificationNotifier, List<Notification>>((ref) => NotificationNotifier());
final quizProvider = FutureProvider.family<List<Quiz>, int>((ref, courseId) => QuizService().getQuizzes(courseId));
```

#### 2. تدفق البيانات (Data Flow)
```
1. User opens quiz page
2. Check quiz attempt status
3. Load quiz questions
4. User answers questions
5. Submit quiz
6. Get detailed results
7. Generate certificate (if passed)
```

#### 3. إدارة الأخطاء (Error Handling)
```dart
// Error handling pattern in Flutter
try {
  final result = await apiCall();
  // Handle success
} catch (error) {
  print('Error: $error');
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text('حدث خطأ: ${error.toString()}'),
      backgroundColor: Colors.red,
    ),
  );
}

// أو استخدام FutureBuilder
FutureBuilder<Result>(
  future: apiCall(),
  builder: (context, snapshot) {
    if (snapshot.hasError) {
      return Center(
        child: Column(
          children: [
            Icon(Icons.error, color: Colors.red, size: 48),
            Text('حدث خطأ: ${snapshot.error}'),
            ElevatedButton(
              onPressed: () => setState(() {}), // إعادة المحاولة
              child: Text('إعادة المحاولة'),
            ),
          ],
        ),
      );
    }
    
    if (snapshot.hasData) {
      return _buildSuccessWidget(snapshot.data!);
    }
    
    return Center(child: CircularProgressIndicator());
  },
)
```

### الميزات الرئيسية

#### 1. التحقق من المحاولات
- منع إعادة المحاولة
- حفظ الإجابات السابقة
- عرض النتائج السابقة

#### 2. مؤقت الكويز
- عرض الوقت المتبقي
- إرسال تلقائي عند انتهاء الوقت
- تحديث كل ثانية

#### 3. تحليل الإجابات
- عرض الإجابات الصحيحة والخاطئة
- تمييز إجابات المستخدم
- حساب النسبة المئوية

#### 4. نظام الشهادات
- توليد تلقائي بعد النجاح
- رابط مباشر للتحميل
- حالة التوليد

### الأمان والتحقق

#### 1. المصادقة
- Bearer token في كل طلب
- التحقق من صلاحية الرمز
- إعادة توجيه عند انتهاء الصلاحية

#### 2. التحقق من الصلاحيات
- التحقق من تسجيل الدورة
- التحقق من إكمال المتطلبات
- منع الوصول غير المصرح

### الأداء والتحسين

#### 1. التخزين المؤقت (Caching)
```dart
// Flutter/Riverpod caching
final quizProvider = FutureProvider.family<List<Quiz>, int>((ref, courseId) async {
  // التحقق من التخزين المؤقت المحلي أولاً
  final cachedQuizzes = await QuizCache.getQuizzes(courseId);
  if (cachedQuizzes.isNotEmpty) {
    return cachedQuizzes;
  }
  
  // جلب البيانات من الخادم
  final quizzes = await QuizService().getQuizzes(courseId);
  
  // حفظ في التخزين المؤقت
  await QuizCache.saveQuizzes(courseId, quizzes);
  
  return quizzes;
});

// إلغاء التخزين المؤقت عند الحاجة
ref.invalidate(quizProvider(courseId));
```

#### 2. التحميل التدريجي
- عرض مؤشر التحميل
- تحميل البيانات عند الحاجة
- تحسين تجربة المستخدم

### استكشاف الأخطاء

#### 1. أخطاء شائعة
- خطأ في الشبكة
- خطأ في المصادقة
- خطأ في الخادم

#### 2. حلول مقترحة
- إعادة المحاولة التلقائية
- رسائل خطأ واضحة
- تسجيل الأخطاء للتشخيص

---

## ملاحظات مهمة

1. **التوثيق**: جميع APIs موثقة بالكامل مع أمثلة
2. **الأمان**: استخدام HTTPS وBearer tokens
3. **الأداء**: تحسين الاستعلامات والتخزين المؤقت
4. **التوافق**: دعم جميع المتصفحات الحديثة
5. **التجربة**: واجهة مستخدم سلسة ومتجاوبة

---

## النماذج (Models)

### 1. نموذج الكويز
```dart
// lib/models/quiz.dart
class Quiz {
  final int id;
  final String title;
  final String description;
  final int timeLimit;
  final int passingScore;
  final List<Question> questions;
  
  Quiz({
    required this.id,
    required this.title,
    required this.description,
    required this.timeLimit,
    required this.passingScore,
    required this.questions,
  });
  
  factory Quiz.fromJson(Map<String, dynamic> json) {
    return Quiz(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      timeLimit: json['time_limit'],
      passingScore: json['passing_score'],
      questions: (json['questions'] as List)
          .map((q) => Question.fromJson(q))
          .toList(),
    );
  }
}

class Question {
  final int id;
  final String questionText;
  final List<QuizOption> options;
  
  Question({
    required this.id,
    required this.questionText,
    required this.options,
  });
  
  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'],
      questionText: json['question_text'],
      options: (json['options'] as List)
          .map((o) => QuizOption.fromJson(o))
          .toList(),
    );
  }
}

class QuizOption {
  final int id;
  final String optionText;
  
  QuizOption({
    required this.id,
    required this.optionText,
  });
  
  factory QuizOption.fromJson(Map<String, dynamic> json) {
    return QuizOption(
      id: json['id'],
      optionText: json['option_text'],
    );
  }
}
```

### 2. نموذج محاولة الكويز
```dart
// lib/models/quiz_attempt.dart
class QuizAttempt {
  final int id;
  final String status;
  final double score;
  final bool passed;
  final DateTime? completedAt;
  final Map<String, int> answers;
  
  QuizAttempt({
    required this.id,
    required this.status,
    required this.score,
    required this.passed,
    this.completedAt,
    required this.answers,
  });
  
  factory QuizAttempt.fromJson(Map<String, dynamic> json) {
    return QuizAttempt(
      id: json['id'],
      status: json['status'],
      score: (json['score'] ?? 0).toDouble(),
      passed: json['passed'] ?? false,
      completedAt: json['completed_at'] != null 
          ? DateTime.parse(json['completed_at']) 
          : null,
      answers: Map<String, int>.from(json['answers'] ?? {}),
    );
  }
}
```

### 3. نموذج المستخدم
```dart
// lib/models/user.dart
class User {
  final int id;
  final String name;
  final String email;
  final String? profileImage;
  final String? bio;
  final String? country;
  final String? specialization;
  final bool emailVerified;
  
  User({
    required this.id,
    required this.name,
    required this.email,
    this.profileImage,
    this.bio,
    this.country,
    this.specialization,
    required this.emailVerified,
  });
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      profileImage: json['profile_image'],
      bio: json['bio'],
      country: json['country'],
      specialization: json['specialization'],
      emailVerified: json['email_verified_at'] != null,
    );
  }
}
```

### 4. نموذج الدورة
```dart
// lib/models/course.dart
class Course {
  final int id;
  final String title;
  final String description;
  final String? image;
  final double price;
  final String instructor;
  final int duration;
  final int studentsCount;
  final double rating;
  final bool isEnrolled;
  final bool isSaved;
  
  Course({
    required this.id,
    required this.title,
    required this.description,
    this.image,
    required this.price,
    required this.instructor,
    required this.duration,
    required this.studentsCount,
    required this.rating,
    required this.isEnrolled,
    required this.isSaved,
  });
  
  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      image: json['image'],
      price: (json['price'] ?? 0).toDouble(),
      instructor: json['instructor']['name'],
      duration: json['duration'],
      studentsCount: json['students_count'],
      rating: (json['rating'] ?? 0).toDouble(),
      isEnrolled: json['is_enrolled'] ?? false,
      isSaved: json['is_saved'] ?? false,
    );
  }
}
```

---

## ملاحظات مهمة

1. **التوثيق**: جميع APIs موثقة بالكامل مع أمثلة Flutter
2. **الأمان**: استخدام HTTPS وBearer tokens
3. **الأداء**: تحسين الاستعلامات والتخزين المؤقت
4. **التوافق**: دعم جميع منصات Flutter (Android, iOS, Web)
5. **التجربة**: واجهة مستخدم سلسة ومتجاوبة
6. **State Management**: استخدام Riverpod لإدارة الحالة
7. **Error Handling**: معالجة شاملة للأخطاء
8. **Real-time**: دعم الإشعارات الفورية مع Pusher

---

