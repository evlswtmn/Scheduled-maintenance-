# Wispr Flow Phrase Library
## Scheduled Maintenance Tracker — AI Prompt Injections

These are copy-paste-ready blocks for your Wispr phrase triggers.
Set the **trigger** (the word/phrase you say) and paste the corresponding **injection** as the replacement text.
Your actual spoken prompt follows automatically after the injection fires.

---

## HOW TO USE IN WISPR

1. Open Wispr Flow → Phrases (or Snippets)
2. Create a new phrase
3. Set the **trigger word** (what you say to activate it)
4. Paste the **injection block** as the replacement text
5. Speak your trigger, then continue with your actual question/request

---

## CATEGORY 1 — PROJECT CONTEXT

### Trigger: `"maint app context"`

> Use this before any general question about the app so the AI knows the full picture.

**Injection:**
```
[PROJECT CONTEXT — Scheduled Maintenance Tracker]
Stack: React Native (Expo SDK 54, RN 0.81.5), React 19, React Navigation v7 (native-stack + bottom-tabs), AsyncStorage for persistence.
State: Single global context via React.useReducer in src/context/VehicleContext.js. Actions: LOAD_DATA, ADD_VEHICLE, UPDATE_VEHICLE, REMOVE_VEHICLE, SELECT_VEHICLE, LOG_SERVICE, REMOVE_LOG_ENTRY, UPDATE_MILEAGE.
Screens: WelcomeScreen, VehicleSetupScreen, GarageScreen, DashboardScreen, MaintenanceDetailScreen, ServiceHistoryScreen.
Key logic: src/utils/maintenanceCalculator.js — calculateUpcomingMaintenance() computes status (overdue / due_soon / upcoming) based on interval math. Manufacturer schedules live in src/data/manufacturers/ (american, european, japanese, korean).
Components: Header, VehicleCard, MaintenanceItem, DropdownPicker.
Theme: src/theme/ (colors.js, typography.js). No external UI library — all custom StyleSheet.

My question/request:
```

---

### Trigger: `"maint file map"`

> Use this when asking the AI to find or touch a specific part of the codebase.

**Injection:**
```
[FILE MAP — Scheduled Maintenance Tracker]
src/
  components/   → DropdownPicker, Header, MaintenanceItem, VehicleCard
  context/      → VehicleContext.js (global state + dispatch)
  data/         → index.js, maintenanceTypes.js, manufacturers/(american|european|japanese|korean).js
  screens/      → Dashboard, Garage, MaintenanceDetail, ServiceHistory, VehicleSetup, Welcome
  theme/        → colors.js, typography.js, index.js
  utils/        → maintenanceCalculator.js (core logic), storage.js (AsyncStorage wrappers)
Root: App.js, index.js, babel.config.js, package.json

Relevant file(s) for my request:
```

---

## CATEGORY 2 — TASK-SPECIFIC PHRASES

### Trigger: `"new screen"`

> Fires when you want to add a new screen to the app.

**Injection:**
```
[TASK: Add a new screen — Scheduled Maintenance Tracker]
Navigation setup: React Navigation v7 native-stack + bottom-tabs. Navigation is configured in App.js.
Screens live in src/screens/. Each screen uses SafeAreaView, ScrollView, Colors and Typography from src/theme, and useVehicles() from src/context/VehicleContext.js for data.
Pattern: functional component, default export, StyleSheet.create() at bottom, no inline styles.
To add a screen: create the file in src/screens/, add it to the navigator in App.js, and optionally add a tab or stack entry.

The new screen I want to add:
```

---

### Trigger: `"new component"`

> Fires when you want to add a reusable component.

**Injection:**
```
[TASK: Add a new component — Scheduled Maintenance Tracker]
Components live in src/components/. They receive props and are purely presentational where possible.
Styling: StyleSheet.create() only, using Colors from src/theme/colors.js and Typography from src/theme/typography.js. No inline styles.
State in context: access via useVehicles() from src/context/VehicleContext.js if the component needs vehicle/maintenance data.

The component I want to build:
```

---

### Trigger: `"add action"`

> Fires when you want to add a new action to VehicleContext.

**Injection:**
```
[TASK: Add a new reducer action — Scheduled Maintenance Tracker]
State is managed in src/context/VehicleContext.js using React.useReducer.
vehicleReducer handles: LOAD_DATA, ADD_VEHICLE, UPDATE_VEHICLE, REMOVE_VEHICLE, SELECT_VEHICLE, LOG_SERVICE, REMOVE_LOG_ENTRY, UPDATE_MILEAGE.
Pattern: add the case to vehicleReducer, create a dispatch-wrapping function in VehicleProvider, expose it in the value object, and export via useVehicles().
Persistence: vehicles saved via saveVehicles(), maintenanceLog via saveMaintenanceLog() — both in src/utils/storage.js. If the new action mutates those, make sure the relevant useEffect picks it up.

The new action I want to add:
```

---

### Trigger: `"fix dashboard"`

> Fires when debugging the main dashboard screen.

**Injection:**
```
[DEBUG CONTEXT: DashboardScreen — Scheduled Maintenance Tracker]
File: src/screens/DashboardScreen.js
Data flow: useVehicles() → selectedVehicle → manufacturer lookup in src/data/ → model.scheduleGroup → calculateUpcomingMaintenance() in src/utils/maintenanceCalculator.js → split into overdueItems / dueSoonItems / upcomingItems.
Status logic: 'overdue' = milesUntilDue <= 0, 'due_soon' = within max(interval*0.2, 1000) miles, 'upcoming' = everything else.
Mileage update: handleUpdateMileage() → dispatches UPDATE_MILEAGE.
Pull to refresh: onRefresh() is a 300ms timer re-render, not a real data fetch.

The issue I'm seeing:
```

---

### Trigger: `"fix calculator"`

> Fires when debugging maintenance calculation logic.

**Injection:**
```
[DEBUG CONTEXT: maintenanceCalculator.js — Scheduled Maintenance Tracker]
File: src/utils/maintenanceCalculator.js
calculateUpcomingMaintenance(vehicle, schedule, completedServices):
  - Filters schedule items by vehicle.drivetrain (item.drivetrainSpecific)
  - Finds last completed service per type via getLastCompletedService()
  - If no prior service: nextDueMiles = getNextIntervalFromZero(mileage, intervalMiles) → ceiling to next interval
  - If prior service: nextDueMiles = lastService.mileage + item.intervalMiles
  - milesUntilDue = nextDueMiles - vehicle.mileage
  - Status thresholds: overdue ≤ 0, due_soon ≤ max(interval*0.2, 1000), upcoming = rest

The calculation problem I'm seeing:
```

---

### Trigger: `"add manufacturer"`

> Fires when adding a new vehicle make/manufacturer.

**Injection:**
```
[TASK: Add a new manufacturer — Scheduled Maintenance Tracker]
Manufacturer data files: src/data/manufacturers/ (american.js, european.js, japanese.js, korean.js)
Pattern: each file exports an array of manufacturer objects with shape:
  { name, models: [{ name, years: { start, end }, scheduleGroup }], schedules: { [scheduleGroup]: [scheduleItem] } }
Schedule item shape: { type, intervalMiles, drivetrainSpecific? }
Type keys must match keys in src/data/maintenanceTypes.js.
After adding, re-export from src/data/index.js via getAllManufacturers().

The manufacturer I want to add:
```

---

## CATEGORY 3 — AI ROUTING PHRASES

> These tell you (and can remind your AI) which model to use for what task.

### Trigger: `"route this task"`

**Injection:**
```
[AI ROUTING GUIDE — My Dev Setup]
Use Claude Opus/Sonnet for: architecture decisions, complex multi-file refactors, debugging tricky logic, writing new features from scratch, code review.
Use Claude Haiku or GPT-4o-mini for: quick lookups, simple edits, rename operations, formatting, boilerplate generation.
Use Perplexity/web-search AI for: docs lookup, library version questions, "what's the best way to do X in 2025" questions.
Use local model (if available) for: sensitive/private data, offline work, high-volume repetitive generation.

Task I'm about to describe (route accordingly):
```

---

### Trigger: `"code review this"`

**Injection:**
```
[CODE REVIEW REQUEST — Scheduled Maintenance Tracker]
Stack context: React Native (Expo), React 19, functional components, useReducer global state, AsyncStorage persistence, React Navigation v7.
Review focus areas: correctness of logic, performance (useMemo/useCallback usage), edge cases (empty state, null vehicles, missing schedule data), style consistency (StyleSheet vs inline, Colors/Typography from theme).
Do NOT suggest: adding TypeScript (not in this project), adding testing frameworks (not set up), or external UI libraries (intentionally avoided).

Code to review:
```

---

### Trigger: `"explain this code"`

**Injection:**
```
[EXPLAIN REQUEST — Scheduled Maintenance Tracker context]
I'm working in a React Native app (Expo) that tracks vehicle maintenance schedules. State is managed via useReducer in VehicleContext. Core calculation logic is in maintenanceCalculator.js.
Explain the following code as if I understand React and JS but may not know the specific pattern or algorithm being used. Be concrete, not abstract.

Code to explain:
```

---

## CATEGORY 4 — GENERAL DEV SPELLS

### Trigger: `"refactor this"`

**Injection:**
```
[REFACTOR REQUEST]
Constraints: keep the same external behavior, don't change the public API or prop interface, don't add new dependencies, don't convert to TypeScript.
Goal: improve readability / reduce duplication / simplify logic only.
Show the before and after clearly.

Code to refactor:
```

---

### Trigger: `"write tests for"`

**Injection:**
```
[TEST WRITING REQUEST — Scheduled Maintenance Tracker]
Test setup: Jest (via Expo). No testing library currently configured beyond what Expo provides by default.
For utility functions (maintenanceCalculator.js, storage.js): pure unit tests, no mocking needed except AsyncStorage.
For components/screens: describe what the test should verify in plain English if a full test harness isn't set up yet.

Function or component to test:
```

---

### Trigger: `"document this"`

**Injection:**
```
[DOCUMENTATION REQUEST]
Write JSDoc-style comments. Be concise — describe what it does, params (name + type + description), and return value. Don't over-explain things that are obvious from the code. Flag any gotchas or non-obvious behavior explicitly.

Code to document:
```

---

## QUICK REFERENCE — TRIGGER WORD CHEATSHEET

| Say this...          | Injects context for...                        |
|----------------------|-----------------------------------------------|
| `maint app context`  | Full project overview                         |
| `maint file map`     | File/folder structure                         |
| `new screen`         | Adding a screen                               |
| `new component`      | Adding a component                            |
| `add action`         | Adding a VehicleContext reducer action        |
| `fix dashboard`      | Debugging DashboardScreen                     |
| `fix calculator`     | Debugging maintenanceCalculator.js            |
| `add manufacturer`   | Adding a new vehicle make to data files       |
| `route this task`    | Deciding which AI to use                      |
| `code review this`   | Requesting a code review                      |
| `explain this code`  | Getting code explained with project context   |
| `refactor this`      | Requesting a safe refactor                    |
| `write tests for`    | Requesting tests                              |
| `document this`      | Requesting JSDoc comments                     |

---

## TIPS FOR EXPANDING THIS LIBRARY

- **Stack a general + specific trigger**: Say `maint app context` then `fix dashboard` back to back — Wispr fires both injections, giving the AI full context + specific debug info before your question.
- **Version your phrases**: When the app grows (new screens, new features), update the relevant injection blocks to keep context fresh.
- **Add a "scratchpad" phrase**: Create a trigger that dumps a blank template structure so you can quickly format a bug report or feature spec for AI input.
- **AI routing evolves**: As models improve and pricing changes, update the `route this task` phrase to reflect your current preferred stack.
