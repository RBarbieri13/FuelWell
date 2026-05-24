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
    targets: [
        .target(
            name: "Nutrition",
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "NutritionTests",
            dependencies: ["Nutrition"],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        )
    ],
    swiftLanguageModes: [.v6]
)
