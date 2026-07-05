// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "Analytics",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "Analytics", type: .static, targets: ["Analytics"])
    ],
    dependencies: [
        .package(url: "https://github.com/pointfreeco/swift-dependencies", from: "1.9.0")
    ],
    targets: [
        .target(
            name: "Analytics",
            dependencies: [
                .product(name: "Dependencies", package: "swift-dependencies")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "AnalyticsTests",
            dependencies: ["Analytics"],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        )
    ],
    swiftLanguageModes: [.v6]
)
