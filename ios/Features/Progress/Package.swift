// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "Progress",
    platforms: [
        .iOS(.v17),
        .macOS(.v13)
    ],
    products: [
        .library(name: "Progress", type: .static, targets: ["Progress"])
    ],
    dependencies: [
        .package(path: "../../Packages/NutritionDomain"),
        .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.17.0")
    ],
    targets: [
        .target(
            name: "Progress",
            dependencies: [
                "NutritionDomain",
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "ProgressTests",
            dependencies: [
                "Progress",
                "NutritionDomain",
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
            ],
            path: "Tests/ProgressTests",
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        )
    ],
    swiftLanguageModes: [.v6]
)
