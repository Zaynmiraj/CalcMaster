# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NoteCalc Pro** (package: `com.zaynmiraj.calmaster`) is a React Native calculator app combining a smart notepad with live math evaluation. Built with Expo SDK 53, React 19, RN 0.79 with New Architecture enabled.

## Common Commands

```bash
npm run dev          # Start Expo dev server (telemetry disabled)
npm run android      # Build and run on Android device/emulator
npm run ios          # Build and run on iOS device/simulator
npm run web          # Start web version
npm run lint         # Run Expo lint
```

> There is no test suite configured — no Jest or testing scripts exist.

After any `npm install`, `patch-package` runs automatically via `postinstall`.

## Architecture

### Navigation (Expo Router — file-based)

```
app/_layout.tsx          # Root: ThemeProvider → LanguageProvider → AuthProvider → Stack
app/(tabs)/_layout.tsx   # Bottom tab bar (3 tabs, absolute positioned, 64px height)
app/(tabs)/index.tsx     # CalcNote workspace (default route) — dual mode: Notepad ↔ Keypad
app/(tabs)/history.tsx   # Perpetual Ledger — searchable, filterable history
app/(tabs)/settings.tsx  # Preferences — theme, language, AI, export settings
```

### State Management

Six React Context providers (no Redux/Zustand). All state persists to `AsyncStorage`.

| Context | Key Responsibility |
|---|---|
| `ThemeContext` | Dark/light mode, 5 color themes (Cyan, Titanium, Emerald, Amethyst, Solar) |
| `LanguageContext` | i18n for EN/AR/BN, `isRTL` flag, `t()` translation function |
| `CalculatorContext` | Expression state, memory (M+/M-/MR/MC), scientific mode, angle unit, haptics |
| `HistoryContext` | History array, search query, filter, retention period (default 30 days) |
| `CalcNoteContext` | Multi-document management, line-by-line evaluation results |
| `AuthContext` | Firebase anonymous auth, user UID |

### Core Logic (`utils/`)

- **`calcNoteEngine.ts`** — Document parser; evaluates each line of the notepad, supports cross-line references (e.g. "Line 3"), implicit addition, currency labels
- **`calculator.ts`** — Wraps `mathjs` for standard calculator expressions
- **`aiEngine.ts`** — OpenRouter API client; free models (Nemotron, Liquid, Gemma, DeepSeek) and paid GPT-4o Mini
- **`documentExport.ts`** — Exports to PNG (`react-native-view-shot`), PDF (`expo-print`), Markdown, Text, JSON
- **`currency.ts`** — Real-time exchange rates; supports USD, EUR, GBP, BDT, AED, SAR
- **`adMobService.ts`** — AdMob banner/interstitial/rewarded; uses test IDs in `__DEV__`, production IDs otherwise

### Firebase Integration

- **Anonymous auth only** — no email/password accounts
- `utils/firebase.ts` — init guard (disabled on web)
- `utils/authService.ts` — anonymous sign-in, auth state subscription
- `utils/analyticsService.ts` — event logging (`calculate_expression`, `export_note`, `use_ai_feature`, etc.)
- `utils/notificationService.ts` — FCM push notifications
- Google Services files: `android/app/google-services.json` (Android), CocoaPods for iOS

### Key External Dependencies

- `mathjs@^12.3.0` — mathematical expression evaluation
- `expo-router@~5.0.2` + `@react-navigation/bottom-tabs@^7.3.10` — navigation
- `react-native-reanimated@~3.17.4` + `react-native-gesture-handler@~2.24.0` — animations/gestures
- `@react-native-firebase/*@^26.4.0` — Auth, Analytics, Messaging
- `react-native-google-mobile-ads@^16.5.0` — AdMob
- `lucide-react-native@^0.475.0` — icons

## TypeScript & Code Style

- Path alias `@/*` maps to the project root (configured in `tsconfig.json`)
- Prettier: 2-space indent, single quotes, bracket spacing (`.prettierrc`)
- Strict TypeScript enabled

## Platform Notes

- **New Architecture** (`newArchEnabled: true`) — use new arch-compatible libraries
- **Web support** is present but Firebase features are disabled on web
- **Portrait orientation only**
- iOS minimum deployment target: 12.0; supports iPad
- Android `versionCode` is in `android/app/build.gradle` and `app.json`
- The `patches/` directory contains `patch-package` patches — do not delete
