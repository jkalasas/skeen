# Skeen

A Skincare product analysis app, designed to help users identify product suitability with their skin.

## Features

- 🔐 **Google Authentication**: Secure sign-in with your Google account
- 🤖 **AI-Powered Analysis**: Get intelligent product assessments using Firebase AI (Gemini Flash)
- 🧴 **Routine Companion**: Check if your skincare products work well together
- 📸 **Image Upload**: Analyze products by uploading images
- 📝 **Product Management**: Save and manage your product collection
- 📊 **Product Comparison**: Compare multiple products side-by-side
- 💡 **Smart Recommendations**: Get personalized product compatibility insights
- 📈 **Assessment History**: Track your product analysis over time
- 👤 **Personal Profile**: Customize recommendations based on your skin type and concerns

## Technology Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-svelte
- **AI**: Firebase AI (Gemini Flash)
- **Cross-Platform**: Tauri 2.0 (Desktop: Windows, macOS, Linux; Mobile: Android, iOS)
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **Bundler**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Firebase project (see [Firebase Setup Guide](./FIREBASE_SETUP.md))
- For desktop development: Rust toolchain (rustup)
- For Android development: Android SDK, Java JDK
- For iOS development: Xcode (macOS only)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/jkalasas/skeen.git
   cd skeen
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   bun install
   ```

3. Set up Firebase:
   - Follow the [Firebase Setup Guide](./FIREBASE_SETUP.md)
   - Copy `.env.example` to `.env` and fill in your Firebase credentials

4. Run the development server:

   ```bash
   npm run dev
   # or
   bun run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Running with Tauri

```bash
# Desktop development
npm run tauri:dev
# or
bun run tauri:dev

# Build for desktop
npm run tauri:build
# or
bun run tauri:build
```

## Building for Production (Web)

```bash
npm run build
# or
bun run build
```

This will create a static build in the `build` directory.

## Project Structure

```
src/
├── lib/
│   ├── ai/              # AI integration (Firebase AI)
│   ├── components/      # Reusable components
│   │   ├── custom/      # Custom app components
│   │   └── ui/          # shadcn-svelte components
│   ├── db/              # Database modules (Firestore)
│   ├── platform.ts      # Platform detection utilities (Tauri/Web)
│   ├── stores/          # Svelte stores
│   └── types/           # TypeScript type definitions
├── routes/              # SvelteKit routes/pages
└── app.css              # Global styles
src-tauri/               # Tauri 2.0 configuration and Rust code
```

## Environment Variables

Create a `.env` file with the following variables:

```env
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
PUBLIC_GOOGLE_CLIENT_ID=
PUBLIC_MAX_MULTI_COUNT=5

# Android Signing (for release APK builds)
# Run: source .env && bun run tauri android build --apk --release
ANDROID_KEYSTORE_PASSWORD=
ANDROID_KEY_PASSWORD=
# Optional (defaults shown):
# ANDROID_KEYSTORE_PATH=src-tauri/skeen-release.keystore
# ANDROID_KEY_ALIAS=skeen
```

See [Firebase Setup Guide](./FIREBASE_SETUP.md) for detailed instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
