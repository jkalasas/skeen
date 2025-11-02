# Firebase Setup Guide

This guide will help you set up Firebase for the Skeen application.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "skeen")
4. Follow the prompts to create your project

## Step 2: Register Your Web App

1. In your Firebase project, click the web icon (</>) to add a web app
2. Register your app with a nickname (e.g., "skeen-web")
3. Copy the Firebase configuration object

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in the Firebase configuration values from Step 2:

```bash
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
PUBLIC_FIREBASE_APP_ID=your-app-id
PUBLIC_MAX_MULTI_COUNT=5
```

## Step 4: Enable Authentication

1. In the Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable the "Google" sign-in provider
4. Configure the OAuth consent screen if needed

## Step 5: Set Up Firestore Database

1. In the Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode" (for development)
4. Select a Cloud Firestore location
5. Click "Enable"

## Step 6: Configure Firestore Security Rules

In the Firestore Database console, go to the "Rules" tab and update the rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /assessmentHistory/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    match /products/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 7: Test Your Setup

1. Run the development server:

   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Click "Sign In with Google"
4. Try saving a product or creating an assessment

## Troubleshooting

### "Missing required Firebase configuration"

- Make sure all environment variables in `.env` are set correctly
- Restart your development server after changing `.env`

### Authentication not working

- Check that Google sign-in is enabled in Firebase Console
- Verify your domain is authorized in Firebase Console under Authentication > Settings > Authorized domains

### Firestore permission errors

- Check that your Firestore security rules are set up correctly
- Make sure you're signed in before trying to save data

## Data Structure

### Collections

The app uses three main Firestore collections:

1. **assessmentHistory**: Stores product assessment history
   - `userId` (string): User ID who created the assessment
   - `product` (object): Product information
   - `assessment` (object): AI assessment results
   - `timestamp` (number): Creation timestamp
   - `imageData` (string, optional): Base64 encoded image

2. **products**: Stores saved products
   - `userId` (string): User ID who saved the product
   - `name` (string): Product name
   - `description` (string, optional): Product description
   - `ingredients` (array, optional): List of ingredients
   - `timestamp` (number): Creation timestamp
   - `lastUsed` (number, optional): Last used timestamp

3. **profiles**: Stores user profiles (one per user)
   - Document ID is the user's UID
   - Contains user preferences and skin information

## Migration from IndexedDB

If you were previously using the app with IndexedDB, your data is stored locally in your browser. The new Firebase implementation stores data in the cloud, so you'll need to re-enter your profile and products after signing in with Google.

There is no automatic migration from IndexedDB to Firestore. If you have important data in IndexedDB, you can manually export it before clearing your browser data.
