# Amex Expense Tracker

A beautiful, privacy-first expense tracking dashboard built with React that pulls your Amex transaction emails directly from your Gmail inbox using the client-side Google API—no backend server required.

Designed to be hosted anywhere as a web application or compiled into a native iOS/Android app using CapacitorJS.

![Amex Expense Tracker Screenshot](https://via.placeholder.com/800x400.png?text=Amex+Expense+Tracker+Dashboard)

## Features
- **Zero-Backend Architecture:** Reads your emails, parses the Amex charge notification heuristics, and stores all configuration in your browser's local storage.
- **Premium UI:** Glassmorphism styling, a vibrant dark-mode color palette, and engaging micro-animations.
- **Spend Notifications:** Set a monthly budget threshold directly on the dashboard. Receive visual alerts and native OS push notifications if your cumulative spend exceeds that amount.
- **Multi-Platform:** Built as a Progressive Web App (PWA) with Vite, and pre-configured with Capacitor for native app store distribution.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- A [Google Cloud Console](https://console.cloud.google.com/) Project with the **Gmail API** enabled

### 1. Set up your Google OAuth Client ID
1. In the Google Cloud Console, navigate to **APIs & Services > Credentials**.
2. Create an **OAuth Client ID** (Application type: Web application).
3. Add your local URL (e.g., `http://localhost:5173`) to the **Authorized JavaScript origins**.
4. In your project, open `src/main.jsx` and replace the `WEB_CLIENT_ID` constant with your new Google Client ID.

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/yourusername/amex-tracker.git
cd amex-tracker
npm install
```

### 3. Running the App
Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. Click "Connect Gmail" to authorize the app.

---

## 📱 Publishing to iOS and Android

Because this project uses [Capacitor](https://capacitorjs.com/), you have full access to native iOS and Android APIs and can compile this web app directly into native `.ipa` and `.aab` bundles.

### Phase 1: Native OAuth Configuration
The Google Authentication strategy differs slightly on native mobile devices versus the web:
1. Return to the Google Cloud Console.
2. Create two *new* OAuth Client IDs:
   - One for **iOS** (Requires your Apple Bundle ID, e.g., `com.amex.tracker`)
   - One for **Android** (Requires your Android Package Name and SHA-1 certificate fingerprint)
3. Open `capacitor.config.json` and update the `GoogleAuth` plugin array (if necessary depending on your environment).
4. For native devices, you will also need to configure the `Info.plist` (iOS) and `strings.xml` (Android) as detailed in the [@codetrix-studio/capacitor-google-auth documentation](https://github.com/CodetrixStudio/CapacitorGoogleAuth).

### Phase 2: Building the Apps
1. Build your production web bundle:
```bash
npm run build
```
2. Sync the web assets into the native Capacitor projects:
```bash
npx cap sync
```

### Phase 3: Compiling for App Stores

#### 🍎 App Store (iOS)
Requirements: A Mac with Xcode installed and an Apple Developer account.
```bash
npx cap open ios
```
1. In Xcode, select your team under **Signing & Capabilities**.
2. Select an iOS device or simulator.
3. To publish: Go to **Product > Archive**, validate your build, and push to App Store Connect.

#### 🤖 Google Play Store (Android)
Requirements: Android Studio and a Google Play Developer account.
```bash
npx cap open android
```
1. Wait for Gradle to sync the project.
2. Generate your signed app bundle for release.
3. In Android Studio: Go to **Build > Generate Signed Bundle / APK**. Follow the wizard to generate your `.aab` file and upload it to the Google Play Console.

## Built With
- **React 18**
- **Vite**
- **Vanilla CSS**
- **@react-oauth/google**
- **CapacitorJS**

## Security Notice
This application requests read-only access to your Gmail. All parsing is done locally on the client's machine. No email metadata or transaction information is ever transmitted to a third-party server.
