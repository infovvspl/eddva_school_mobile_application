# Push notifications (FCM) setup

## Android — done in repo

- `android/app/google-services.json` is present
- Package name must be `com.studentlearningapp` (matches Firebase + `applicationId`)
- Gradle applies Google Services when that file exists
- Default notification channel: `eddva_default`

After login, the app registers the FCM token with the API (tries several routes).

## iOS — still required for iPhone push

1. Add an iOS app in the same Firebase project (`eddva-56b09`).
2. Download `GoogleService-Info.plist` into `ios/StudentLearningApp/`.
3. Run `cd ios && pod install`.
4. In Xcode: enable **Push Notifications** + **Background Modes → Remote notifications**.
5. Upload APNs key in Firebase → Project settings → Cloud Messaging.

## Verify on device

1. Login screen shows build label **7.69 · push & location** (or newer).
2. Allow **Notifications** and **Location** when prompted.
3. Log in — token is sent to the backend (check Metro log in dev: no “Push token not saved” warning).
4. Firebase Console → Messaging → send test to your FCM token.

## In-app vs push

| Feature | Works without FCM? |
|--------|---------------------|
| Notifications screen (pull from API) | Yes |
| Unread badge on home | Yes |
| Lock-screen / banner push | Needs FCM + backend send |

## Location

- Register → address step → **Use current location**
- Profile → **Update address from location**
- Coordinates sync via `/students/location` or profile patch
