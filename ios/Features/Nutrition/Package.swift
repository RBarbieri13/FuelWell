// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "Nutrition",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "Nutrition", type: .static, targets: ["Nutrition"])
    ],
    dependencies: [
        .package(path: "../../Packages/Core"),
        .package(path: "../../Packages/DesignSystem"),
        .package(path: "../../Packages/NutritionDomain"),
        .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.17.0")
    ],
    targets: [
        .target(
            name: "Nutrition",
            dependencies: [
                "Core",
                "DesignSystem",
                "NutritionDomain",
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "NutritionTests",
            dependencies: [
                "Nutrition",
                "Core",
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
            ],
            path: "Tests/NutritionTests",
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        )
    ],
    swiftLanguageModes: [.v6]
)
