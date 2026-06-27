struct FitnessWorkoutTemplate: Equatable, Identifiable {
    let id: String
    let title: String
    let subtitle: String
    let bodyPart: String
    let type: String
    let durationMinutes: Int
    let intensity: String
    let equipment: String
    let goal: String
    let calories: Int
    let sorenessCost: String
    let icon: String
    let targetMuscles: [String]
    let steps: [String]
    let modifications: [String]
    let relatedIDs: [String]

    var logDetail: String { "\(self.durationMinutes) min · \(self.intensity.lowercased()) · \(self.calories) kcal" }
    var relatedTemplates: [Self] { Self.all.filter { self.relatedIDs.contains($0.id) } }
    var previousTemplate: Self { Self.adjacent(to: self, offset: -1) }
    var nextTemplate: Self { Self.adjacent(to: self, offset: 1) }
    static var featured: Self { Self.all[0] }

    static func adjacent(to template: Self, offset: Int) -> Self {
        guard let index = Self.all.firstIndex(where: { $0.id == template.id }) else {
            return Self.featured
        }
        return Self.all[(index + offset + Self.all.count) % Self.all.count]
    }

    static let all: [Self] = [
        .init(
            id: "low-impact-strength",
            title: "Low-impact strength",
            subtitle: "Technique-first full-body work that keeps soreness low.",
            bodyPart: "Full body",
            type: "Strength",
            durationMinutes: 34,
            intensity: "Moderate",
            equipment: "Dumbbells, bench",
            goal: "Technique and low soreness cost",
            calories: 240,
            sorenessCost: "Low",
            icon: "dumbbell.fill",
            targetMuscles: ["Quads", "Glutes", "Back", "Shoulders", "Core"],
            steps: [
                "Five-minute movement prep",
                "Goblet squat, supported row, incline press",
                "Hip hinge and suitcase carry",
                "Two-minute cooldown check-in"
            ],
            modifications: [
                "Use bodyweight squats if knees feel sensitive",
                "Keep two reps in reserve on every set",
                "Swap carries for dead bugs if grip is fatigued"
            ],
            relatedIDs: ["mobility-reset", "upper-back-reset", "zone-2-ride"]
        ),
        .init(
            id: "zone-2-ride",
            title: "Zone 2 ride",
            subtitle: "Easy aerobic output without adding soreness.",
            bodyPart: "Lower",
            type: "Cardio",
            durationMinutes: 42,
            intensity: "Easy",
            equipment: "Bike",
            goal: "Aerobic base",
            calories: 310,
            sorenessCost: "Low",
            icon: "bicycle",
            targetMuscles: ["Glutes", "Quads", "Calves"],
            steps: [
                "Five-minute easy spin",
                "Thirty-two minutes conversational pace",
                "Five-minute cooldown",
                "Log effort and appetite after the ride"
            ],
            modifications: [
                "Walk instead if no bike is available",
                "Cap effort if legs feel heavy",
                "Add five minutes only if breathing stays easy"
            ],
            relatedIDs: ["low-impact-strength", "run-walk-intervals", "rowing-base"]
        ),
        .init(
            id: "mobility-reset",
            title: "Mobility reset",
            subtitle: "A calm reset for hips and upper back.",
            bodyPart: "Full body",
            type: "Mobility",
            durationMinutes: 18,
            intensity: "Light",
            equipment: "Mat",
            goal: "Restore range of motion",
            calories: 55,
            sorenessCost: "Very low",
            icon: "waveform.path.ecg",
            targetMuscles: ["Hips", "T-spine", "Hamstrings", "Shoulders"],
            steps: [
                "Breathing reset",
                "Hip flexor and hamstring flow",
                "Open books and wall slides",
                "Easy squat hold"
            ],
            modifications: [
                "Keep every stretch below a 6 out of 10",
                "Use pillows under knees",
                "Skip squat holds if hips pinch"
            ],
            relatedIDs: ["hips-ankles-reset", "upper-back-reset", "low-impact-strength"]
        ),
        .init(
            id: "hips-ankles-reset",
            title: "Hips and ankles reset",
            subtitle: "Lower-body mobility for walking, riding, and squatting.",
            bodyPart: "Lower",
            type: "Mobility",
            durationMinutes: 16,
            intensity: "Light",
            equipment: "Mat",
            goal: "Hips, ankles, calves",
            calories: 45,
            sorenessCost: "Very low",
            icon: "figure.flexibility",
            targetMuscles: ["Hips", "Ankles", "Calves"],
            steps: [
                "Ankle rocks",
                "Half-kneeling hip flexor stretch",
                "Calf raises",
                "Bodyweight hinge pattern"
            ],
            modifications: [
                "Hold a wall for balance",
                "Reduce range if ankles pinch",
                "Move slower after hard rides"
            ],
            relatedIDs: ["mobility-reset", "zone-2-ride", "walking-base"]
        ),
        .init(
            id: "upper-back-reset",
            title: "Upper back reset",
            subtitle: "Desk-posture reset for shoulders and thoracic spine.",
            bodyPart: "Upper",
            type: "Mobility",
            durationMinutes: 15,
            intensity: "Light",
            equipment: "Wall, band",
            goal: "Thoracic spine and shoulders",
            calories: 40,
            sorenessCost: "Very low",
            icon: "figure.cooldown",
            targetMuscles: ["Upper back", "Rear delts", "Neck", "Shoulders"],
            steps: [
                "Wall slides",
                "Band pull-aparts",
                "Open books",
                "Breathing reset"
            ],
            modifications: [
                "Skip band work if shoulders pinch",
                "Keep neck relaxed",
                "Do the sequence seated if needed"
            ],
            relatedIDs: ["mobility-reset", "low-impact-strength", "push-pull-basics"]
        ),
        .init(
            id: "walking-base",
            title: "Walking base",
            subtitle: "Simple low-friction movement when the day is crowded.",
            bodyPart: "Full body",
            type: "Cardio",
            durationMinutes: 30,
            intensity: "Easy",
            equipment: "None",
            goal: "Steps and recovery",
            calories: 135,
            sorenessCost: "Low",
            icon: "figure.walk",
            targetMuscles: ["Calves", "Glutes", "Feet"],
            steps: [
                "Five minutes relaxed",
                "Twenty minutes brisk but talkable",
                "Five minutes easy",
                "Log hunger and energy"
            ],
            modifications: [
                "Split into two shorter walks",
                "Use indoor laps if weather is bad",
                "Keep pace easy after strength days"
            ],
            relatedIDs: ["zone-2-ride", "hike-steady", "mobility-reset"]
        ),
        .init(
            id: "run-walk-intervals",
            title: "Run-walk intervals",
            subtitle: "Controlled intervals without turning the day into a race.",
            bodyPart: "Lower",
            type: "Intervals",
            durationMinutes: 28,
            intensity: "Moderate",
            equipment: "Shoes",
            goal: "Conditioning",
            calories: 260,
            sorenessCost: "Medium",
            icon: "figure.run",
            targetMuscles: ["Quads", "Hamstrings", "Calves"],
            steps: [
                "Five-minute walk warm-up",
                "Eight rounds of one-minute jog, ninety-second walk",
                "Five-minute cooldown walk",
                "Note knees and breathing"
            ],
            modifications: [
                "Keep all jogs conversational",
                "Turn jogs into hill walks if joints complain",
                "Stop early if form gets noisy"
            ],
            relatedIDs: ["walking-base", "zone-2-ride", "hips-ankles-reset"]
        ),
        .init(
            id: "rowing-base",
            title: "Rowing base",
            subtitle: "Aerobic pull session with a steady rhythm.",
            bodyPart: "Full body",
            type: "Cardio",
            durationMinutes: 25,
            intensity: "Moderate",
            equipment: "Rower",
            goal: "Low-impact conditioning",
            calories: 220,
            sorenessCost: "Medium",
            icon: "figure.rower",
            targetMuscles: ["Back", "Glutes", "Hamstrings", "Core"],
            steps: [
                "Five-minute technique warm-up",
                "Fifteen minutes steady split",
                "Three short cadence pickups",
                "Cooldown and log effort"
            ],
            modifications: [
                "Reduce drag if low back tightens",
                "Keep strokes smooth",
                "Swap for bike if technique feels off"
            ],
            relatedIDs: ["zone-2-ride", "low-impact-strength", "upper-back-reset"]
        ),
        .init(
            id: "push-pull-basics",
            title: "Push-pull basics",
            subtitle: "Upper-body strength with simple equipment.",
            bodyPart: "Upper",
            type: "Strength",
            durationMinutes: 32,
            intensity: "Moderate",
            equipment: "Dumbbells, band",
            goal: "Upper-body capacity",
            calories: 205,
            sorenessCost: "Medium",
            icon: "figure.strengthtraining.traditional",
            targetMuscles: ["Chest", "Back", "Shoulders", "Arms"],
            steps: [
                "Scapular warm-up",
                "Dumbbell press and row",
                "Band pull-apart and curl",
                "Light carry finisher"
            ],
            modifications: [
                "Use incline push-ups instead of presses",
                "Keep shoulders away from ears",
                "Cut one set if sleep was poor"
            ],
            relatedIDs: ["upper-back-reset", "low-impact-strength", "mobility-reset"]
        ),
        .init(
            id: "hike-steady",
            title: "Steady hike",
            subtitle: "Outdoor cardio that still leaves room for dinner.",
            bodyPart: "Lower",
            type: "Cardio",
            durationMinutes: 50,
            intensity: "Moderate",
            equipment: "Shoes, water",
            goal: "Endurance and steps",
            calories: 360,
            sorenessCost: "Medium",
            icon: "figure.hiking",
            targetMuscles: ["Glutes", "Calves", "Quads"],
            steps: [
                "Start flat for ten minutes",
                "Keep climbs at talkable effort",
                "Use descents as recovery",
                "Hydrate and log distance"
            ],
            modifications: [
                "Shorten the route if knees feel tender",
                "Use poles on steep descents",
                "Swap for walking base after heavy legs"
            ],
            relatedIDs: ["walking-base", "hips-ankles-reset", "zone-2-ride"]
        )
    ]
}
