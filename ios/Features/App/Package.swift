// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "App",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "App", type: .static, targets: ["App"])
    ],
    dependencies: [
        .package(path: "../../Packages/Core"),
        .package(path: "../../Packages/DesignSystem"),
        .package(path: "../../Packages/AnthropicClient"),
        .package(path: "../../Packages/SupabaseClient"),
        .package(path: "../../Packages/HealthKitClient"),
        .package(path: "../../Packages/Analytics"),
        .package(path: "../../Packages/CrashReporting"),
        .package(path: "../../Packages/NutritionDomain"),
        .package(path: "../../Packages/SubscriptionClient"),
        .package(path: "../Activity"),
        .package(path: "../Coach"),
        .package(path: "../Nutrition"),
        .package(path: "../Onboarding"),
        .package(path: "../Progress"),
        .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.17.0"),
        .package(url: "https://github.com/johnpatrickmorgan/TCACoordinators", from: "0.9.0")
    ],
    targets: [
        .target(
            name: "App",
            dependencies: [
                "Analytics",
                "AnthropicClient",
                "Activity",
                "Coach",
                "Core",
                "CrashReporting",
                "DesignSystem",
                "HealthKitClient",
                "Nutrition",
                "NutritionDomain",
                "Onboarding",
                "Progress",
                "SupabaseClient",
                "SubscriptionClient",
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "AppTests",
            dependencies: [
                "App",
                "Analytics",
                "AnthropicClient",
                "CrashReporting",
                "HealthKitClient",
                "Onboarding",
                "SupabaseClient",
                "SubscriptionClient",
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
            ],
            path: "Tests/AppTests"
        )
    ],
    swiftLanguageModes: [.v6]
)
