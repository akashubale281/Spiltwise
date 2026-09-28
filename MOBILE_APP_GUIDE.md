# SplitVerse Mobile App Guide (Native Android with Capacitor)

Your SplitVerse project has been converted into a native mobile application using **Capacitor**!

---

## 🚀 Two Easy Ways to Get Your APK

### Method 1: Automatic Download from GitHub Actions (No Android Studio Needed!)
The cloud APK builder script is provided at `scripts/build-apk.yml`.
To enable automatic cloud APK builds directly on GitHub:
1. Go to your repository on GitHub ([theboys](https://github.com/akashubale281/theboys) or [Spiltwise](https://github.com/akashubale281/Spiltwise)).
2. Click **Add file** > **Create new file**.
3. Name it `.github/workflows/build-apk.yml`.
4. Paste the contents of `scripts/build-apk.yml` and commit.
5. GitHub Actions will automatically compile your project and provide a downloadable **`SplitVerse-Android-APK`** under the **Actions** tab!

---

### Method 2: Open in Android Studio on your PC
If you want to run the app in an emulator, test on a USB-connected phone, or generate signed release bundles for the Google Play Store:

```bash
# 1. Build and sync the latest frontend code
npm run build:android

# 2. Open the project in Android Studio
npm run open:android
```

Then in Android Studio:
- Click the green **Run (▶)** button to launch on an emulator or plugged-in phone.
- Or click **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate `app-debug.apk`.

---

## 📱 Pre-Configured Mobile Features
- **Live Render Backend Sync**: The mobile app automatically points to `https://spiltwise1-backend.onrender.com/api` so all groups, expenses, and settlements stay synchronized with the web.
- **Physical Camera & Receipt Scanner**: Camera and photo library permissions are configured in `AndroidManifest.xml` for AI bill scanning.
- **1-Tap UPI Intent Support**: Android queries are added for Indian UPI apps (`GPay`, `PhonePe`, `Paytm`, `BHIM`, `CRED`) to launch payment apps directly.
- **Offline / Local Persistence**: Maid attendance, custom bills, and recurring schedules remain preserved in local storage.
