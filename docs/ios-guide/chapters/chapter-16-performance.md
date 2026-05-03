# Chapter 16: Performance

*"Premature optimization is forbidden. Measurement is mandatory. The two together are how performance work pays off."*

## Learning Objectives

By the end of this chapter you will be able to:

  

1.  Set concrete performance budgets for launch time, scroll rate, memory, and disk I/O.
2.  Use Instruments' SwiftUI instrument and Time Profiler to find the few places that actually matter.
3.  Apply targeted fixes — stable identifiers, .equatable(), lazy stacks, prefetching — only where measurement justifies them.
4.  Use OSSignposter to instrument key code paths so future regressions show up in Instruments.
5.  Recognize the "frame budget" mental model and how SwiftUI's body interacts with it.
6.  Decide when to chase a performance issue versus log it and move on.

## Prerequisites

  - Chapters 1–15 complete.
  - A real iOS device for performance testing (the simulator is fine for correctness but lies about performance).
  - Comfortable opening Instruments via Xcode → Open Developer Tool → Instruments.

  

## 16.1 The Budget

You can't talk about performance without numbers. Set them before you measure, not after — otherwise every result is "good enough" because you have no benchmark.

  

For FuelWell v1, the budgets:

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Metric\*\* | \*\*Budget\*\* | \*\*Why this number\*\* |
| \*\*Cold launch (P95)\*\* | \\\< 400ms to first interactive frame | Apple's WWDC guideline; users perceive sluggishness above 500ms |
| \*\*Warm launch (P95)\*\* | \\\< 200ms | A returning user expects near-instant resume |
| \*\*Scroll\*\* | 60fps sustained, 120fps where supported | Frame drops are immediately visible; one drop is forgivable, repeated drops aren't |
| \*\*Memory ceiling\*\* | \\\< 150MB resident at idle | Below the iOS background-eviction threshold for normal apps |
| \*\*Disk I/O on hot paths\*\* | Zero blocking I/O on body evaluation | Any blocking read on the main thread risks frame drops |
| \*\*Network round-trip\*\* | Best effort; not a hard budget | Users tolerate "loading" with feedback; budget the \*feedback\*, not the network |

  

Cold launch and scroll are the two most important. If those are good, the rest usually is.

  

**⚠️ Common Pitfall — Budgets without measurement**

  

A budget you don't measure against is a wish. The exercise wires a launch-time test into Instruments so you can verify the number on every release candidate.

  

## 16.2 The Frame Budget

iOS at 60fps gives each frame **16.67ms** to do everything: handle events, run state changes, evaluate body, layout, render. At 120fps on a ProMotion display, you get **8.33ms**. Miss the budget and the frame is dropped — the screen shows the previous frame for an extra cycle.

  

flowchart LR

  

    Event\[Touch event\] --\> Reduce\[Reducer mutates state\]

  

    Reduce --\> Body\[body re-evaluates\]

  

    Body --\> Layout\[Layout pass\]

  

    Layout --\> Render\[GPU renders\]

  

    Render --\> Frame\[Frame on screen\]

  

    Event -.16.67ms total.-\> Frame

  

The work in body is where most performance issues live. SwiftUI calls body aggressively — on every state change, every animation frame, every parent re-evaluation. If body does anything expensive — date formatting, large array filtering, image decoding — you'll feel it.

  

The fixes are almost always: **move expensive work out of** **body** (into the reducer or a cached value), and **let SwiftUI skip work it doesn't need to do** (stable identity, .equatable(), lazy containers).

  

## 16.3 The SwiftUI Instrument

Instruments has a SwiftUI-specific template (added in Xcode 14, much improved in 26) that visualizes:

  

  - Every body invocation, with the duration.
  - Why a body re-evaluated (which observed property changed).
  - Cause of unintended re-evaluations (a parent rebuilding, an unstable id in a ForEach).

  

To use it:

  

1.  **Build for profiling.** Product → Profile (Cmd+I). Choose the **SwiftUI** template.
2.  **Reproduce the scenario.** Cold-launch the app, scroll through the meal list, swipe to delete. Whatever you suspect is slow.
3.  **Stop recording.** Switch to the **View Body** track. Look for:
      
      - **Tall bars** (long body executions). Investigate what body is doing.
      - **Frequent bars** (many re-evaluations). Why is this view rebuilding so often?
      - **Cascades** (a parent rebuild triggering all children). Identity probably broke somewhere.

  

For the FuelWell Dashboard, the first profile likely shows clean frames at idle but a brief stall on first navigation to the Nutrition tab while the meal list mounts. Note it; we'll come back.

### Example: a re-evaluation spike

Here's a concrete bug the SwiftUI Instrument catches. Suppose your Dashboard accidentally observes the entire store:

  

// ❌ Body sees every property change on the store.

  

public struct DashboardView: View {

  

    @Bindable var store: StoreOf\<DashboardFeature\>

  

    public var body: some View {

  

        VStack {

  

            DailyGreeting(name: store.userName)

  

            // ... tiles using store.steps, store.calories, ...

  

        }

  

    }

  

}

  

When store.recentWorkouts updates (a HealthKit fetch returning), the entire DashboardView body re-evaluates because it touches store. With many subviews, that's many cascading rebuilds.

  

The SwiftUI Instrument shows this as a wide block of body executions on the workouts-loaded action. The fix is the Chapter 7 technique: pass exactly what each subview needs.

  

// ✅ Each subview observes only what it cares about.

  

public var body: some View {

  

    VStack {

  

        DailyGreeting(name: store.userName)

  

        MetricsGrid(steps: store.steps,

  

                    activeCalories: store.activeCalories,

  

                    protein: store.protein, carbs: store.carbs)

  

        WorkoutsSection(workouts: store.recentWorkouts)

  

    }

  

}

  

Now when recentWorkouts updates, only WorkoutsSection rebuilds. MetricsGrid and DailyGreeting skip their body entirely because their inputs didn't change.

  

## 16.4 Time Profiler — Beyond SwiftUI

When the SwiftUI Instrument shows clean bodies but the app still feels slow, it's not SwiftUI's fault — it's something else on the main thread. Time Profiler is your microscope.

  

Run **Product → Profile → Time Profiler**. Reproduce the slow scenario. After stopping, find the main thread track and expand it. The flame graph shows where CPU time went.

  

Common findings:

  

  - **Date.formatted(...)** **calls in body** — date formatters are surprisingly expensive. Cache the formatted string in state, not in the view.
  - **Codable** **decoding on the main thread** — happens if your repository decodes on the actor it was called from but that actor turns out to be @MainActor. Move decoding off the main thread.
  - **Image decoding for large assets** — when a LazyVStack first scrolls a 4096×4096 photo into view. Use AsyncImage or pre-resize.
  - **A surprise blocking** **try? await ... .get()** — somewhere a sync access to an async result blocks the thread waiting.

  

For FuelWell v0, the most likely culprit when something feels slow is a date formatter in MealRow (Chapter 6). Test your hypothesis: profile the meal list scroll. If you see a noticeable amount of time in DateFormatter, fix it by moving the formatted string into MealEntry.formatted as a stored value or by using a static formatter.

  

## 16.5 Stable Identity in Lists

ForEach re-uses subview instances when their identity is stable. Stable identity means the same id value across rebuilds. Unstable identity means SwiftUI tears down and rebuilds the whole row, every time.

  

// ❌ Unstable: arrays are indexed by position, not value.

  

ForEach(store.entries.indices, id: \\.self) { index in

  

    MealRow(entry: store.entries\[index\])

  

}

  

// ✅ Stable: identity comes from the entry's UUID.

  

ForEach(store.entries) { entry in   // entries are Identifiable

  

    MealRow(entry: entry)

  

}

  

The first version reuses rows by index. If the user deletes the first meal, every other row gets a new "identity" (its index changed), and SwiftUI rebuilds them all. The second version pins identity to the entry's UUID, so deleting one row only rebuilds the remaining rows that genuinely moved.

  

Our MealEntry is Identifiable (Chapter 4), so the safe version is the natural one. Don't outsmart yourself with id: \\.self patterns.

  

## 16.6 .equatable() for Diff Skipping

When SwiftUI is about to call body on a view, it checks if any inputs changed. If a subview takes a complex value type and the same value comes in twice, SwiftUI doesn't always know it can skip — by default it just rebuilds.

  

You can opt in to equality checking:

  

ForEach(store.entries) { entry in

  

    MealRow(entry: entry)

  

        .equatable()    // ← here

  

}

  

Now MealRow.body is only called when the entry passed in actually differs from the entry passed last time. For cells in a long scrollable list where most rows don't change between rebuilds, this is a major win.

  

The catch: .equatable() calls == on the inputs every render check. If == is itself expensive (deep comparison of large arrays), .equatable() can be slower than just rebuilding. Reach for it on small value types (a single struct of primitives) and skip it for big nested structures.

  

MealEntry is small and trivially Equatable — .equatable() is the right call here.

  

## 16.7 Lazy Containers

VStack lays out all children eagerly. LazyVStack lays out children only as they scroll into view. For long lists, the difference is staggering — 1000-row VStack evaluates 1000 bodies on appear; 1000-row LazyVStack evaluates 10 (only what's visible).

  

The same applies to HStack/LazyHStack, VGrid/LazyVGrid. We've been using LazyVGrid on the Dashboard already.

  

For the Daily Log — currently a List — SwiftUI's List uses lazy rendering internally, so it's already correct. If we switched to ScrollView { VStack { ForEach... } } for custom styling, we'd need LazyVStack. The rule:

  

  - **Need scrolling and lots of items** → List or LazyVStack/LazyHStack/LazyVGrid.
  - **Fixed small number of items, no scrolling** → VStack/HStack.

  

Avoid the trap of "I should always use Lazy for safety." Lazy containers can't size themselves to content (they expand to fill), don't animate item insertion as gracefully, and slightly disrupt accessibility traversal. Use them when you need them.

  

## 16.8 Image Loading

AsyncImage is SwiftUI's built-in remote image loader. It's fine for small lists and prototype code. For a production app with many images:

  

AsyncImage(url: foodImageURL) { image in

  

    image.resizable().aspectRatio(contentMode: .fill)

  

} placeholder: {

  

    Color.gray.opacity(0.1)

  

}

  

.frame(width: 64, height: 64)

  

.clipped()

  

Three improvements production code wants:

  

**1. Caching.** AsyncImage doesn't cache. URLCache.shared does some, but not for arbitrary image bytes. For a meal photos feature that ships in a future chapter, integrate Nuke or Kingfisher (both lightweight, both well-maintained).

  

**2. Pre-resizing on the server.** If the source image is 2048×2048 and you display it at 64×64, you're decoding 17MB of pixel data to display 16KB. Have your backend resize, or have a Supabase Edge Function do it.

  

**3. Background decoding.** AsyncImage decodes on the main thread by default in older iOS versions. iOS 17+ improved this, but for performance-sensitive lists, a third-party library is more predictable.

  

For FuelWell v0 we don't ship images. When we add meal photos in a future chapter, that's the time to evaluate Nuke vs the platform's improvements.

  

## 16.9 Memory

Memory issues show up two ways:

  

  - **Steady growth** ("memory leak"): some object captures something that never deallocates. Often a long-running Task that holds a reference to a view model that holds a reference to a store.
  - **Spikes** ("memory pressure"): you allocate a 100MB image buffer for a brief operation. Even brief spikes trigger iOS to evict your app from background.

  

Use Instruments' **Allocations** template. Mark generations (Cmd+B) at known idle states; if growth between generations is non-zero after the user "settles," you have a leak. The flame graph points to the type whose count grew.

  

For FuelWell, the most common leaks at this scale come from:

  

  - **Tasks not being cancelled** when a view disappears. Task { while \!Task.isCancelled { ... } } lives forever if no one cancels it. Use .task(id:) or TCA's .cancellable(id:cancelInFlight:).
  - **Closures capturing self** in long-lived contexts. \[weak self\] is rarely needed in Swift Concurrency, but for callback-based APIs (HealthKit), it still applies.

  

Memory work is the area where measurement is most non-negotiable. "It feels fine" is uncorrelated with whether you're leaking. Run Allocations periodically.

  

## 16.10 OSSignposter — Instrument Your Own Code

For paths you'll want to profile repeatedly, instrument them with OSSignposter. The signposts appear as labeled regions in Instruments' Points of Interest track:

  

import OSLog

  

// Define once, in a shared place.

  

let signposter = OSSignposter(subsystem: "com.example.fuelwell", category: "perf")

  

// In your code:

  

public func entries(for date: Date) async throws -\> \[MealEntry\] {

  

    let signpostID = signposter.makeSignpostID()

  

    let interval = signposter.beginInterval("DB.entries", id: signpostID)

  

    defer { signposter.endInterval("DB.entries", interval) }

  

    // ... actual work

  

    return rows.map { $0.toDomain() }

  

}

  

Now when you run Time Profiler or any other Instruments template that supports Points of Interest, you'll see "DB.entries" segments alongside the CPU flame graph. You can correlate "this main-thread stall" with "the database read that was running at the same time."

  

For FuelWell v0, instrument three things:

  

  - The fetchDashboard task group (Chapter 12).
  - Database reads in LiveNutritionRepository.
  - HealthKit queries in LiveHealthKitClient.

  

Three signposts is enough to understand most performance issues without drowning in noise.

  

## 16.11 The "Track Down or Track" Decision

When you find something slow, you have two options:

  

1.  **Track it down.** Profile, identify root cause, fix.
2.  **Track it.** Add a Sentry custom-metric or analytics event for the slow path. Move on.

  

For FuelWell v0, "track it down" applies to:

  

  - Anything causing visible jank during normal use.
  - Cold launch above 400ms on a current device.
  - Memory leaks that grow over the course of a session.

  

"Track it" applies to:

  

  - Edge cases that affect \<1% of sessions.
  - Hot paths that are already within budget but you want to monitor for regression.
  - Anything that would require more than a day to optimize.

  

The discipline: you only have so many hours. Spend them where users will feel the difference. Chapter 18's analytics layer gives you the data to know which is which.

  

## 16.12 The Pre-Release Performance Checklist

Before any v1.x release goes to production:

  

\[ \] Run Instruments → SwiftUI on cold launch. No body taking \>5ms.

  

\[ \] Run Instruments → Time Profiler scrolling the meal list for 30s. No frame drops.

  

\[ \] Run Instruments → Allocations idle for 60s after navigating. No growth.

  

\[ \] Cold launch on a baseline device (whatever you target as P95) under 400ms.

  

\[ \] Worst-case Dynamic Type renders without main-thread stall.

  

\[ \] First fetch on the Dashboard completes in under 1s (or shows feedback within 100ms).

  

Six checks. They take an hour to run. They prevent the class of regressions where "everything looks fine" but the app gets slower with every release until users complain.

  

Run them before tagging a release candidate. Skip them and you'll regret it.

  

## Common Pitfalls Summary

|  |  |
| :-: | :-: |
| \*\*Pitfall\*\* | \*\*Fix\*\* |
| Optimizing without measuring | Measure first, then optimize what's actually slow |
| id: \\\\.self in ForEach over mutable arrays | Use Identifiable types with stable IDs (UUIDs) |
| Date formatting in body | Cache the formatted string in state |
| Eager VStack for long scrolling lists | List or LazyVStack |
| Unbounded Task { ... } in views | .task(id:) or .cancellable(id:) |
| AsyncImage without caching for production | Use Nuke/Kingfisher when you ship many images |
| Skipping the SwiftUI Instrument | It's free; run it on every major UI change |
| No baseline device for "P95" | Pick a specific device (e.g., iPhone 15) and measure on it |
| Letting "feels fine" substitute for measurement | The pre-release checklist takes an hour; the alternative is shipping regressions |

  

## Hands-On Exercise

**Goal:** measure FuelWell's current performance, identify the single biggest issue, fix it, and verify the fix.

  

1.  **Establish baselines.** On a real device:

  

  - Measure cold launch time three times (Cmd+R, force-quit, repeat). Note P50 and P95.
  - Profile scroll on the Daily Log with 50+ entries. Note any frame drops.
  - Note memory at idle on the Dashboard.

  

Record the numbers in a new file docs/perf-baseline.md.

  

1.  **Run the SwiftUI Instrument** on a cold launch. Identify the longest single body execution. Note what it is and why.

  

1.  **Run Time Profiler** on a meal list scroll with 50+ entries. Find the single biggest CPU consumer on the main thread. If it's expected (UIKit text rendering) or out of your control, note it. If it's *your code* (a date formatter, a sort), that's your fix target.

  

1.  **Apply one targeted fix.** Whichever one your profiling identified. For most v0 codebases, this is one of:

  

  - Add .equatable() to MealRow.
  - Cache a formatted string in MealEntry instead of formatting in body.
  - Pass exact data to subviews instead of the whole store.

  

1.  **Re-measure.** Run the same scroll profile after the fix. The biggest CPU consumer should have shrunk. Note the new number.

  

1.  **Add three OSSignposters** per §16.10:

  

  - LiveNutritionRepository.entries(for:)
  - LiveHealthKitClient.todaySteps()
  - Dashboard.fetchDashboard task group

  

1.  **Run the pre-release checklist** from §16.12. Note which boxes pass and which need attention.

  

1.  **Update** **docs/perf-baseline.md** with the after-fix measurements and the date.

  

1.  **Commit:**

  

git add .

  

git commit -m "Chapter 16: perf baseline, one targeted fix, signposters wired"

  

git push

  

**Time budget:** 3 hours. The first Instruments session takes longer than later ones — the UI is dense and the templates take a few runs to make sense. Don't try to fix everything; one well-measured fix is worth more than five hand-wavy ones.

  

## What's Next

Chapter 17 — **CI/CD with GitHub Actions + Fastlane** — wires everything you've built (tests, snapshots, lint, performance signposts) into a pipeline that runs on every push, blocks merges on failures, and ships TestFlight builds on demand. By the end of the chapter, a pushed git tag triggers a TestFlight upload and you don't have to touch Xcode for routine releases. This is the chapter where shipping starts being a habit instead of an event.

  