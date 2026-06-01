// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "HealthKitClient",
    platforms: [
        .iOS(.v17),
        .macOS(.v12)
    ],
    products: [
        .library(name: "HealthKitClient", type: .static, targets: ["HealthKitClient"])
    ],
    dependencies: [
        .package(url: "https://github.com/pointfreeco/swift-dependencies", from: "1.9.0")
    ],
    targets: [
        .target(
            name: "HealthKitClient",
            dependencies: [
                .product(name: "Dependencies", package: "swift-dependencies")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "HealthKitClientTests",
            dependencies: ["HealthKitClient"],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        )
    ],
    swiftLanguageModes: [.v6]
)
