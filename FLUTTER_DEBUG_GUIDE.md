# Flutter Google Sign-In Debug Guide

## Common Issues & Solutions

### 1. Backend Configuration Issues

**Check Google Client ID Configuration:**
```bash
# In your Laravel .env file, ensure you have:
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

**Verify the client ID matches between Flutter and Backend:**
- The `GOOGLE_CLIENT_ID` in your Laravel `.env` must match the one used in Flutter
- For Android: Use the Web client ID (not Android client ID)
- For iOS: Use the iOS client ID

### 2. Flutter Configuration Issues

**Android Setup:**
1. Add SHA-1 fingerprint to Google Console:
```bash
# Get SHA-1 fingerprint
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

2. Download updated `google-services.json` and place in `android/app/`

3. In `android/app/build.gradle`:
```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

**iOS Setup:**
1. Add your iOS bundle ID to Google Console
2. Download `GoogleService-Info.plist` and add to Xcode project
3. Add URL scheme in `ios/Runner/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>REVERSED_CLIENT_ID</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>YOUR_REVERSED_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

### 3. Flutter Code Issues

**Correct Flutter Implementation:**
```dart
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class GoogleSignInService {
  static final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'openid', 'profile'],
    // For Android, you can omit clientId
    // For iOS, you might need to specify clientId
    // clientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  );

  static Future<Map<String, dynamic>?> signIn() async {
    try {
      // Sign in
      final GoogleSignInAccount? account = await _googleSignIn.signIn();
      if (account == null) {
        print('User cancelled sign in');
        return null;
      }

      // Get authentication details
      final GoogleSignInAuthentication auth = await account.authentication;
      
      if (auth.idToken == null) {
        print('No ID token received');
        return null;
      }

      print('ID Token: ${auth.idToken}'); // Debug log

      // Send to your backend
      final response = await http.post(
        Uri.parse('https://YOUR_DOMAIN/api/auth/google/mobile'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'id_token': auth.idToken,
        }),
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print('Backend error: ${response.body}');
        return null;
      }
    } catch (e) {
      print('Google Sign-In error: $e');
      return null;
    }
  }

  static Future<void> signOut() async {
    await _googleSignIn.signOut();
  }
}
```

### 4. Backend Debugging

**Add more detailed logging to your backend:**
```php
public function googleMobileSignIn(Request $request)
{
    $request->validate([
        'id_token' => 'required|string',
    ]);

    try {
        \Log::info('Received Google mobile sign-in request', [
            'has_id_token' => $request->has('id_token'),
            'id_token_length' => strlen($request->input('id_token')),
        ]);

        $client = new \Google_Client();
        $clientId = config('services.google.client_id');
        \Log::info('Using Google client ID: ' . $clientId);
        
        $client->setClientId($clientId);

        $payload = $client->verifyIdToken($request->input('id_token'));
        if (!$payload) {
            \Log::error('Invalid Google ID token');
            return response()->json(['message' => 'Invalid Google ID token'], 401);
        }

        \Log::info('Google token verified successfully', [
            'sub' => $payload['sub'] ?? 'missing',
            'email' => $payload['email'] ?? 'missing',
            'name' => $payload['name'] ?? 'missing',
        ]);

        // ... rest of your code
    } catch (\Throwable $e) {
        \Log::error('Google mobile sign-in failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        return response()->json(['message' => 'Failed to authenticate with Google'], 500);
    }
}
```

### 5. Testing Steps

**Step 1: Test with cURL**
```bash
# First, get a valid ID token from your Flutter app (add debug print)
# Then test with cURL:
curl -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"id_token":"YOUR_ACTUAL_ID_TOKEN"}' \
  https://YOUR_DOMAIN/api/auth/google/mobile
```

**Step 2: Check Laravel Logs**
```bash
tail -f storage/logs/laravel.log
```

**Step 3: Verify Google Console Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Verify your OAuth 2.0 client IDs are configured correctly
5. Check that your app's package name/bundle ID matches

### 6. Common Error Messages & Solutions

**"Invalid Google ID token"**
- Check if client ID matches between Flutter and backend
- Verify the token is not expired
- Ensure the token is properly formatted

**"Google token missing required claims"**
- The token doesn't contain required fields (sub, email)
- Check Google Console configuration

**"Failed to authenticate with Google"**
- Check Laravel logs for detailed error
- Verify Google Client library is installed: `composer require google/apiclient`

**Flutter: "PlatformException"**
- Check SHA-1 fingerprint for Android
- Verify bundle ID for iOS
- Ensure google-services.json/GoogleService-Info.plist are properly added

### 7. Debug Checklist

- [ ] Google Client ID matches between Flutter and Laravel
- [ ] SHA-1 fingerprint added to Google Console (Android)
- [ ] Bundle ID added to Google Console (iOS)
- [ ] google-services.json/GoogleService-Info.plist files are in place
- [ ] Laravel logs show the request is received
- [ ] ID token is not null/empty in Flutter
- [ ] Backend can verify the token with Google
- [ ] User creation/lookup works correctly

### 8. Alternative Testing Method

If the issue persists, try this simplified test:

```dart
// Add this to your Flutter app for debugging
Future<void> testGoogleSignIn() async {
  try {
    final GoogleSignInAccount? account = await GoogleSignIn().signIn();
    if (account != null) {
      final GoogleSignInAuthentication auth = await account.authentication;
      print('ID Token: ${auth.idToken}');
      print('Access Token: ${auth.accessToken}');
      print('Email: ${account.email}');
      print('Name: ${account.displayName}');
    }
  } catch (e) {
    print('Error: $e');
  }
}
```

Run this test first to ensure Google Sign-In is working at the Flutter level before testing the backend integration.
