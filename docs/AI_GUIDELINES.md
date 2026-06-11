# Ping Architecture & AI Guidelines

This document provides in-depth context about the Ping application. AI agents must ingest this document to prevent hallucination, enforce strict design constraints, and understand the technical history of the repository.

## 1. Technical Context & History

Ping was originally built using Expo SDK 56. However, due to incompatibilities with the user's environment, **the project was intentionally downgraded to Expo SDK 54** (React Native 0.81.5).

Furthermore, because Expo Go dropped support for remote push notifications and legacy background fetch in SDK 53/54, the project was migrated to a **Development Build** using `expo-dev-client` and `expo-background-task`.

**Critical Directive:** Do NOT attempt to use Expo Go native features, and DO NOT upgrade dependencies past SDK 54 without explicit permission.

## 2. Core Dependencies

If you need to implement a feature, refer to the tools we already have installed. **Do not install arbitrary new packages.**

- **UI & Styling:** `react-native`, `react-native-safe-area-context`. (No Tailwind, No styled-components).
- **Navigation:** `expo-router` v3+.
- **Storage:** `@react-native-async-storage/async-storage`, `expo-secure-store`.
- **Background Tasks:** `expo-background-task`, `expo-task-manager`.
- **Notifications:** `expo-notifications`.
- **Animations & Gestures:** `react-native-reanimated` v4, `react-native-gesture-handler`, `expo-haptics`.
- **Icons & Graphics:** `@expo/vector-icons`, `react-native-svg`.

## 3. Directory Structure Enforcement

```
ping/
├── app/                  # Expo Router filesystem navigation
│   ├── (tabs)/           # Bottom tab screens (index, reminders, add)
│   ├── reminder/         # Dynamic routes (e.g., [id].tsx)
│   └── _layout.tsx       # Root layout
├── src/
│   ├── components/       # Reusable, stateless or UI-focused components
│   ├── constants/        # theme.ts, strings.ts
│   ├── context/          # React Context (app-context.tsx)
│   ├── hooks/            # Custom hooks (e.g., use-notifications.ts)
│   └── types/            # Global TypeScript types (index.ts)
├── docs/                 # Documentation (this file)
└── assets/               # Local images and fonts
```

## 4. "Obsidian Calm" Design System Guidelines

To ensure visual consistency, the app strictly follows the **Obsidian Calm** theme.

### Color Palette

Always import `Colors` from `src/constants/theme.ts`. Never hardcode colors.

- Background: `#0D0D0F` (`Colors.bg`)
- Surface / Cards: `#1A1A1F` (`Colors.surface`)
- Primary Accent: `#6366F1` (`Colors.accent`)

### Component Construction

- **StyleSheet API**: Build all styles using `StyleSheet.create`.
- **Typography**: Always use `fontFamily: 'Inter_400Regular'`, `Inter_600SemiBold`, or `Inter_700Bold` mapped through the `FontSize` constants.
- **Interactivity**: Wrap interactive elements in `TouchableOpacity` or `Pressable` from `react-native`, and integrate `expo-haptics` for tactile feedback on successful actions.

## 5. Anti-Hallucination Checklist

Before an AI agent executes a change, it must internally verify:

1. Did I check `package.json` to ensure the library I am importing actually exists in this repository?
2. Am I using `expo-background-task` instead of the deprecated `expo-background-fetch`?
3. Have I applied styles strictly using `src/constants/theme.ts`?
4. Is the code free of `any` types?
5. Did I avoid importing anything from `@expo/vector-icons/Ionicons` directly if there are type conflicts? (We use Unicode/SVG fallback for custom icons where appropriate, or standard `@expo/vector-icons` if correctly typed).
