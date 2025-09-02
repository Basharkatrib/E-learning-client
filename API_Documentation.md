## Mobile Google Sign-In API (Flutter)

### Overview
Authenticate users from a Flutter app using a Google ID token. The backend verifies the token server‑side and returns a Sanctum token plus user data. No redirects involved.

### Endpoint
- Method: POST
- URL: /auth/google/mobile
- Body (JSON):
  - id_token: string (Google ID token from the device)

### Response
Success 200:
```json
{
  "token": "<sanctum_token>",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": null,
    "email": "john@example.com",
    "profile_image": "https://...",
    "email_verified_at": "2025-09-02T09:50:00.000000Z",
    "role": "student"
  }
}
```

Error examples:
- 401 Invalid token
- 400 Missing claims
- 500 Server error

### Flutter Setup
Add dependencies in `pubspec.yaml`:
```yaml
dependencies:
  google_sign_in: ^6.2.1
  http: ^1.2.1
```

Android: configure SHA‑1/256 in Firebase Console and download the updated `google-services.json` if you use Firebase Auth to assist Google Sign-In. iOS: add reversed client id in URL Types if needed.

### Obtain Google ID Token (Flutter)
```dart
import 'package:google_sign_in/google_sign_in.dart';

final _googleSignIn = GoogleSignIn(
  scopes: [
    'email',
    'openid',
    'profile',
  ],
  // clientId optional on Android, required on iOS/macOS/Web if not inferred
  // clientId: 'YOUR_IOS_OR_WEB_CLIENT_ID.apps.googleusercontent.com',
);

Future<String?> getGoogleIdToken() async {
  final acct = await _googleSignIn.signIn();
  if (acct == null) return null; // user cancelled
  final auth = await acct.authentication;
  return auth.idToken; // <-- send this to backend
}
```

### Call Backend API
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

const baseUrl = 'https://YOUR_DOMAIN_OR_IP';

Future<Map<String, dynamic>> signInWithGoogleMobile(String idToken) async {
  final res = await http.post(
    Uri.parse('$baseUrl/auth/google/mobile'),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: jsonEncode({'id_token': idToken}),
  );

  if (res.statusCode == 200) {
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  throw Exception('Login failed: ${res.statusCode} ${res.body}');
}
```

### Persist Token and Use in Subsequent Calls
Use any secure storage (e.g., `flutter_secure_storage`).
```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

Future<void> saveToken(String token) async {
  await storage.write(key: 'auth_token', value: token);
}

Future<http.Response> getProtectedResource(String path) async {
  final token = await storage.read(key: 'auth_token');
  final res = await http.get(
    Uri.parse('$baseUrl$path'),
    headers: {
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    },
  );
  return res;
}
```

### Full Example Flow
```dart
Future<void> mobileGoogleLoginFlow() async {
  final idToken = await getGoogleIdToken();
  if (idToken == null) return; // cancelled

  final result = await signInWithGoogleMobile(idToken);
  final token = result['token'] as String;
  final user = result['user'] as Map<String, dynamic>;

  await saveToken(token);
  // Use `user` as needed in app state
}
```

### cURL (for quick testing)
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"id_token":"YOUR_GOOGLE_ID_TOKEN"}' \
  https://YOUR_DOMAIN_OR_IP/auth/google/mobile
```

### Notes
- Ensure `services.google.client_id` in backend matches the client used by the Flutter app.
- Use the returned Sanctum token in the `Authorization: Bearer <token>` header for protected endpoints (`/api/v1/...`).

