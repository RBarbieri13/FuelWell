import Dependencies
import Foundation
#if canImport(HealthKit) && !os(macOS)
import HealthKit
#endif

public struct HealthSnapshot: Equatable, Sendable {
    public var steps: Double
    public var activeEnergyKilocalories: Double
    public var workoutCount: Int
    public var workoutDurationMinutes: Double
    public var bodyMassKilograms: Double?
    public var sleepOnset: Date?
    public var fetchedAt: Date

    public init(
        steps: Double,
        activeEnergyKilocalories: Double,
        workoutCount: Int = 0,
        workoutDurationMinutes: Double = 0,
        bodyMassKilograms: Double? = nil,
        sleepOnset: Date? = nil,
        fetchedAt: Date
    ) {
        self.steps = steps
        self.activeEnergyKilocalories = activeEnergyKilocalories
        self.workoutCount = workoutCount
        self.workoutDurationMinutes = workoutDurationMinutes
        self.bodyMassKilograms = bodyMassKilograms
        self.sleepOnset = sleepOnset
        self.fetchedAt = fetchedAt
    }
}

public enum HealthKitClientError: Error, Equatable, Sendable {
    case notAvailable
    case authorizationDenied
    case queryFailed(String)
    case unimplemented
}

public struct HealthKitClient: Sendable {
    public var requestReadAuthorization: @Sendable () async throws -> Bool
    public var todaySnapshot: @Sendable () async throws -> HealthSnapshot
    public var sevenDaySleepOnsetMedian: @Sendable () async throws -> Date?

    public init(
        requestReadAuthorization: @escaping @Sendable () async throws -> Bool,
        todaySnapshot: @escaping @Sendable () async throws -> HealthSnapshot,
        sevenDaySleepOnsetMedian: @escaping @Sendable () async throws -> Date?
    ) {
        self.requestReadAuthorization = requestReadAuthorization
        self.todaySnapshot = todaySnapshot
        self.sevenDaySleepOnsetMedian = sevenDaySleepOnsetMedian
    }
}

extension HealthKitClient: DependencyKey {
    public static let liveValue = HealthKitClient.live()

    public static let testValue = HealthKitClient(
        requestReadAuthorization: { throw HealthKitClientError.unimplemented },
        todaySnapshot: { throw HealthKitClientError.unimplemented },
        sevenDaySleepOnsetMedian: { throw HealthKitClientError.unimplemented }
    )

    public static let previewValue = HealthKitClient.stub(
        snapshot: HealthSnapshot(
            steps: 8_420,
            activeEnergyKilocalories: 540,
            workoutCount: 1,
            workoutDurationMinutes: 42,
            bodyMassKilograms: 82.4,
            sleepOnset: Date(timeIntervalSince1970: 1_773_446_400),
            fetchedAt: Date(timeIntervalSince1970: 1_773_500_000)
        )
    )

    public static func stub(snapshot: HealthSnapshot, authorized: Bool = true) -> HealthKitClient {
        HealthKitClient(
            requestReadAuthorization: { authorized },
            todaySnapshot: { snapshot },
            sevenDaySleepOnsetMedian: { snapshot.sleepOnset }
        )
    }

    public static func live() -> HealthKitClient {
        #if canImport(HealthKit) && !os(macOS)
        let client = LiveHealthKitClient()
        return HealthKitClient(
            requestReadAuthorization: { try await client.requestReadAuthorization() },
            todaySnapshot: { try await client.todaySnapshot() },
            sevenDaySleepOnsetMedian: { try await client.sevenDaySleepOnsetMedian() }
        )
        #else
        return HealthKitClient(
            requestReadAuthorization: { throw HealthKitClientError.notAvailable },
            todaySnapshot: { throw HealthKitClientError.notAvailable },
            sevenDaySleepOnsetMedian: { throw HealthKitClientError.notAvailable }
        )
        #endif
    }
}

extension DependencyValues {
    public var healthKit: HealthKitClient {
        get { self[HealthKitClient.self] }
        set { self[HealthKitClient.self] = newValue }
    }
}

#if canImport(HealthKit) && !os(macOS)
private actor LiveHealthKitClient {
    private let store = HKHealthStore()

    func requestReadAuthorization() async throws -> Bool {
        guard HKHealthStore.isHealthDataAvailable() else {
            throw HealthKitClientError.notAvailable
        }

        let types = Set([
            HKQuantityType(.stepCount),
            HKQuantityType(.activeEnergyBurned),
            HKQuantityType(.bodyMass),
            HKObjectType.workoutType(),
            HKCategoryType(.sleepAnalysis)
        ])

        try await self.store.requestAuthorization(toShare: [], read: types)
        return true
    }

    func todaySnapshot() async throws -> HealthSnapshot {
        let calendar = Calendar(identifier: .gregorian)
        let start = calendar.startOfDay(for: Date())
        async let steps = self.quantitySum(.stepCount, unit: .count(), start: start, end: Date())
        async let energy = self.quantitySum(.activeEnergyBurned, unit: .kilocalorie(), start: start, end: Date())
        async let weight = self.latestQuantity(.bodyMass, unit: .gramUnit(with: .kilo))
        async let workouts = self.workouts(start: start, end: Date())

        return try await HealthSnapshot(
            steps: steps,
            activeEnergyKilocalories: energy,
            workoutCount: workouts.count,
            workoutDurationMinutes: workouts.durationMinutes,
            bodyMassKilograms: weight,
            sleepOnset: self.sevenDaySleepOnsetMedian(),
            fetchedAt: Date()
        )
    }

    func sevenDaySleepOnsetMedian() async throws -> Date? {
        nil
    }

    private func quantitySum(
        _ identifier: HKQuantityTypeIdentifier,
        unit: HKUnit,
        start: Date,
        end: Date
    ) async throws -> Double {
        let type = HKQuantityType(identifier)
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end)

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: type,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, statistics, error in
                if let error {
                    continuation.resume(throwing: HealthKitClientError.queryFailed(error.localizedDescription))
                    return
                }

                continuation.resume(returning: statistics?.sumQuantity()?.doubleValue(for: unit) ?? 0)
            }

            self.store.execute(query)
        }
    }

    private func latestQuantity(
        _ identifier: HKQuantityTypeIdentifier,
        unit: HKUnit
    ) async throws -> Double? {
        let type = HKQuantityType(identifier)
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: type,
                predicate: nil,
                limit: 1,
                sortDescriptors: [sort]
            ) { _, samples, error in
                if let error {
                    continuation.resume(throwing: HealthKitClientError.queryFailed(error.localizedDescription))
                    return
                }

                let sample = samples?.first as? HKQuantitySample
                continuation.resume(returning: sample?.quantity.doubleValue(for: unit))
            }

            self.store.execute(query)
        }
    }

    private func workouts(start: Date, end: Date) async throws -> (count: Int, durationMinutes: Double) {
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end)

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: HKObjectType.workoutType(),
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                sortDescriptors: nil
            ) { _, samples, error in
                if let error {
                    continuation.resume(throwing: HealthKitClientError.queryFailed(error.localizedDescription))
                    return
                }

                let workouts = samples?.compactMap { $0 as? HKWorkout } ?? []
                let duration = workouts.reduce(0.0) { $0 + $1.duration } / 60
                continuation.resume(returning: (workouts.count, duration))
            }

            self.store.execute(query)
        }
    }
}
#endif
