# Miru

Miru is a production-ready React Native application built with Expo for managing daily recurring task reminders. Designed with a premium "Obsidian Calm" aesthetic, Miru allows users to define tasks with highly customizable schedules and receive reliable local push notifications.

## ✨ Features

- **Custom Scheduling Options:**
  - 🔁 **Interval-based:** e.g., "Every 30 minutes between 9:00 AM and 5:00 PM"
  - 📌 **Fixed Times:** Add specific times throughout the day
  - 📅 **Daily:** Once a day at a set time
- **Reliable Local Notifications:** Fully offline-capable local push notifications using `expo-notifications`, intelligently scheduled to respect iOS/Android limits.
- **Premium UI/UX:** "Obsidian Calm" design language featuring deep dark backgrounds (`#0D0D0F`), vibrant electric indigo accents (`#6366F1`), and smooth micro-interactions powered by Reanimated.
- **Custom Time Picker:** A bespoke, scroll-wheel style time picker built from scratch using `FlatList` and Reanimated.
- **Privacy First:** All data is stored locally using `AsyncStorage` and `expo-secure-store`. No external databases or third-party push services are used.

## 🛠 Tech Stack

- **Framework:** React Native + [Expo](https://expo.dev/) (SDK 54)
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **State Management:** React Context + `useReducer`
- **Animations:** React Native Reanimated + React Native Gesture Handler
- **Storage:** `@react-native-async-storage/async-storage` & `expo-secure-store`
- **Notifications:** `expo-notifications` & `expo-background-task`
- **Typography & Icons:** `@expo-google-fonts/inter` & `@expo/vector-icons`

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm, yarn, or pnpm
- Expo Go app on your physical device, or an iOS Simulator / Android Emulator

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd miru
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npx expo start
   ```

4. **Run on a device or emulator:**
   - Press `a` to open in Android Emulator
   - Press `i` to open in iOS Simulator
   - Scan the QR code with the Expo Go app on your physical device

## 📁 Project Structure

```
miru/
├── app/                  # Expo Router file-based navigation (screens)
│   ├── (tabs)/           # Bottom tab navigation screens
│   └── _layout.tsx       # Root layout
├── assets/               # Static assets (images, icons, splash screen)
├── src/                  # Source code
│   ├── components/       # Reusable UI components
│   ├── constants/        # Theme, colors, strings, and configuration
│   ├── hooks/            # Custom React hooks (e.g., use-notifications)
│   ├── store/            # State management (Context & Reducers)
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions (time formatting, etc.)
├── app.json              # Expo configuration
├── package.json          # Project dependencies and scripts
└── prompt.md             # Original prompt and design constraints
```

## 🎨 Design Principles (Obsidian Calm)

Miru adheres strictly to the **Obsidian Calm** design direction:

- **Colors:** Deep obsidian backgrounds (`#0D0D0F`), subtle card surfaces (`#1A1A1F`), and an electric indigo accent (`#6366F1`).
- **Typography:** Inter font family (Regular, SemiBold, Bold) for a clean, modern look.
- **Interactions:** Subtle haptic feedback and Reanimated spring animations on interactions (button presses, tab transitions, swipe-to-delete).
- **Icons & Illustrations:** Inline SVGs for beautiful, scalable empty states and iconography.

## 📄 License

This project is licensed under the MIT License.
