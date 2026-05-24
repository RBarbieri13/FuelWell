// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "NutritionDomain",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "NutritionDomain", type: .static, targets: ["NutritionDomain"])
    ],
    targets: [
        .target(
            name: "NutritionDomain",
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "NutritionDomainTests",
            dependencies: ["NutritionDomain"],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        )
    ],
    swiftLanguageModes: [.v6]
)
