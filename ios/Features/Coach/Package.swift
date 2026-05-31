// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "Coach",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "Coach", type: .static, targets: ["Coach"])
    ],
    dependencies: [
        .package(path: "../../Packages/AnthropicClient"),
        .package(path: "../../Packages/Core"),
        .package(path: "../../Packages/DesignSystem"),
        .package(path: "../../Packages/HealthKitClient"),
        .package(path: "../../Packages/NutritionDomain"),
        .package(path: "../../Packages/SupabaseClient"),
        .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.17.0")
    ],
    targets: [
        .target(
            name: "Coach",
            dependencies: [
                "AnthropicClient",
                "Core",
                "DesignSystem",
                "HealthKitClient",
                "NutritionDomain",
                "SupabaseClient",
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "CoachTests",
            dependencies: [
                "Coach",
                "AnthropicClient",
                "Core",
                "HealthKitClient",
                "SupabaseClient",
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
            ],
            path: "Tests/CoachTests",
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        )
    ],
    swiftLanguageModes: [.v6]
)
