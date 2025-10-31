# Project Overview

This is a SvelteKit project for a web application called "skeen". Based on the dependencies and code structure, it appears to be a tool for assessing skincare products. The application uses the Google Gemini AI to analyze product information and images, providing pros, cons, and an overall score.

## Technologies

- **Framework:** SvelteKit
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn-svelte
- **AI:** Google Gemini (@google/genai)
- **Bundler:** Vite

## Architecture

The application is structured as a standard static SvelteKit project.

- `src/routes`: Contains the application's pages and layouts.
- `src/lib`: Contains reusable libraries and components.
- `src/lib/ai`: Contains the logic for interacting with the Google Gemini AI.
  - `base.ts`: Defines the interface for the AI client.
  - `gemini.ts`: Implements the AI client using the Gemini API.
- `src/lib/components`: Contains reusable components
  - `ui`: Contains the UI components from `shadcn-svelte`.
  - `custom`: Contains the custom UI components made for this app.

## UI Components

The project uses `shadcn-svelte` for its UI components. These components are located in `src/lib/components/ui` and are styled with Tailwind CSS.
When you need documentation for `shadcn-svelte`, check the local reference at `.vscode/llm-docs/shadcn-svelte.md`.

## Building and Running

## Development

To run the application in development mode, use the following command:

```bash
bun run dev
```

## Building

To build the application for production, use the following command:

```bash
bun run build
```

This will create a static version of the application in the `build` directory.

## Preview

To preview the production build locally, use the following command:

```bash
bun run preview
```

# Development Conventions

## Linting and Formatting

The project uses ESLint for linting and Prettier for code formatting.

- **Lint:** `bun run lint`
- **Format:** `bun run format`

## Type Checking

The project uses TypeScript for static type checking.

- **Check:** `bun run check`
- **Check (watch mode):** `bun run check:watch`
