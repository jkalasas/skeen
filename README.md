# Skeen

A Skincare product analysis app, designed to help users identify product suitability with their skin.

## Features

- 🔐 **Google Authentication**: Secure sign-in with your Google account
- 🤖 **AI-Powered Analysis**: Get intelligent product assessments using Google Gemini
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
- **AI**: Google Gemini
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **Bundler**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Firebase project (see [Firebase Setup Guide](./FIREBASE_SETUP.md))

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

## Building for Production

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
│   ├── ai/              # AI integration (Gemini)
│   ├── components/      # Reusable components
│   │   ├── custom/      # Custom app components
│   │   └── ui/          # shadcn-svelte components
│   ├── db/              # Database modules (Firestore)
│   ├── stores/          # Svelte stores
│   └── types/           # TypeScript type definitions
├── routes/              # SvelteKit routes/pages
└── app.css              # Global styles
```

## Environment Variables

Create a `.env` file with the following variables:

```env
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
PUBLIC_FIREBASE_APP_ID=your-app-id
PUBLIC_MAX_MULTI_COUNT=5
```

See [Firebase Setup Guide](./FIREBASE_SETUP.md) for detailed instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
