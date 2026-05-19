# Align workout foundation plan

This document tracks the rebuild of the workout foundation so the app can move from a rigid tracker to a flexible training companion.

## Product north star

Align should recommend the best workout for today based on the user's goals, the weekly plan, completed work, available time, and chosen optional modules. The user can change the day's focus, but the app should protect the weekly plan and clearly explain what changed.

## Current implementation checkpoint

The app currently has a useful exercise catalog, generated weekly structure, workout history, section grouping, and basic progression prompts. The main gap is that workout recommendation logic is embedded inside `WorkoutTracker.tsx`, making the workout experience hard to customize and hard to improve safely.

## Foundation decisions

1. Keep the current repo and evolve it on a foundation branch.
2. Preserve the current mobile shell and local stored data.
3. Move training logic into dedicated planner modules before doing a visual redesign.
4. Treat HYROX, calisthenics, handstand, L-sit, mobility, and core as optional training modules.
5. Generate a recommended session first, then let the user change focus or add modules.
6. Separate planned prescriptions from logged workout results over time.

## Step 1: Introduce a recommendation engine

Status: in progress.

This patch adds:

- optional training modules on `TrainingProgram`
- richer logging metrics for future distance, calories, holds, and rounds
- a training recommendation engine in `lib/training/recommendedWorkout.ts`
- persistent module toggles in the Alignment Center
- planner controls in the Workout tab for changing today's focus and adding modules

This is intentionally not a complete redesign yet. It is the first foundation layer.

## Step 2: Split the workout UI

Next target:

- `WorkoutHome`
- `RecommendedWorkoutCard`
- `WeekPlanView`
- `FocusChangeSheet`
- `SessionPlanner`
- `ActiveSession`
- `ExerciseCard`
- `SetLogger`
- `WorkoutHistory`

Challenge rule: do not make the UI prettier until the recommendation engine can explain the workout and preserve weekly balance.

## Step 3: Upgrade prescriptions and progression

Next target:

- planned target reps, sets, rest, RIR, and load intent
- per-exercise progression rules
- double progression for hypertrophy
- conservative load progression for strength
- hold/time/distance progression for skills and conditioning
- deload and stall detection based on history

Challenge rule: do not add advanced AI-generated workouts until deterministic rules are reliable.

## Step 4: Better weekly flexibility

Next target:

- reschedule missed or swapped days
- show remaining weekly targets
- change focus without losing weekly structure
- distinguish completed, skipped, missed, and abandoned workouts

Challenge rule: never mark unfinished workouts as completed automatically.

## Step 5: Mobile redesign

Next target:

- one clear recommendation card at the top of the Workout tab
- weekly progress chips
- change-focus sheet
- module toggles
- guided active session cards
- simplified set logging

Challenge rule: if a screen contains planner, add-exercise, history, recommendations, and set logging all at once, split it before adding more features.

