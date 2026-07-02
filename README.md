# Student Learning App — React Native CLI

A full-featured mobile learning platform converted from HTML prototypes into production-ready React Native CLI code.

## Screens

| Screen | Route | Description |
|---|---|---|
| Dashboard | Tab: Home | Streak hero, stats grid, productivity chart, course cards |
| Calendar | Tab: Calendar | Productivity summary, upcoming classes with time/date |
| Battle Arena | Tab: Battle (FAB) | Matchmaking lobby, arena modes, performance stats |
| Doubts | Tab: Doubts | AI chat assistant, course listing |
| Profile | Tab: Profile | User identity, exam goals, badges, preferences |
| My Courses | Stack: MyCourses | Weekly study chart, category filter, enrolled courses |
| Courses | Stack: Courses | Course discovery / browse |
| Study Plan | Stack: StudyPlan | Daily goals, focus timer, priority tasks, timeline |
| Leaderboard | Stack: Leaderboard | Ranked table, sticky "my rank" bar |
| Progress | Stack: Progress | Charts, streak, productivity, enrolled courses |

## Project Structure

```
src/
├── constants/
│   └── theme.ts          # Design tokens: colors, spacing, typography, shadows
├── types/
│   └── index.ts          # TypeScript types & navigation param lists
├── navigation/
│   └── AppNavigator.tsx  # Root Stack + custom Bottom Tab bar
├── components/
│   ├── AppHeader.tsx         # Sticky header (avatar/back button)
│   ├── StreakCard.tsx         # Gradient streak card with SVG circle progress
│   ├── StatCard.tsx          # 2-column stat card
│   ├── CourseCard.tsx        # Colored course card with avatars & rating
│   ├── EmptyState.tsx        # Empty placeholder with CTA
│   ├── CircularProgress.tsx  # SVG-based circular progress ring
│   └── ProductivityCard.tsx  # Purple card with circular progress
└── screens/
    ├── DashboardScreen.tsx
    ├── CalendarScreen.tsx
    ├── MyCoursesScreen.tsx
    ├── CoursesScreen.tsx
    ├── StudyPlanScreen.tsx
    ├── DoubtsScreen.tsx
    ├── LeaderboardScreen.tsx
    ├── BattleArenaScreen.tsx
    ├── ProgressScreen.tsx
    └── ProfileScreen.tsx
```

## Design System

Extracted from the HTML's Tailwind config:

| Token | Value |
|---|---|
| Primary | `#3B82F6` (blue) |
| Secondary | `#8B5CF6` (violet) |
| Surface | `#F8FAFC` |
| Text Main | `#0F172A` |
| Text Muted | `#64748B` |
| Accent Green | `#9AD3BC` |
| Accent Pink | `#FF9999` |
| Accent Yellow | `#FFD700` |
| Accent Purple | `#CBC3E3` |
| Accent Blue | `#ABC4FF` |

## Dependencies

```bash
npm install
```

### Core
- `react-native` 0.74
- `@react-navigation/native` + `@react-navigation/bottom-tabs` + `@react-navigation/native-stack`
- `react-native-screens` + `react-native-safe-area-context`

### UI
- `react-native-linear-gradient` — gradient cards & buttons
- `react-native-vector-icons` — FontAwesome5 icons
- `react-native-svg` — SVG circular progress & charts

## Setup

```bash
# Install dependencies
npm install

# iOS (macOS only)
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

### Android: Link vector icons

In `android/app/build.gradle`:
```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### iOS: Link vector icons

In `ios/Podfile`:
```ruby
pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'
```

## Key Features

- **Custom Bottom Tab Bar** with a center floating action button (Battle Arena)
- **Animated components** — floating VS badge, pulse ring on opponent avatar
- **SVG charts** — weekly study hours line chart in My Courses
- **SVG circular progress** — streak card, productivity card, study plan goal
- **Gradient backgrounds** — streak hero, focus timer, VS badge
- **Responsive layout** — uses `Dimensions`, safe area insets, and flexible sizing
- **TypeScript throughout** — fully typed screens, components, and navigation
