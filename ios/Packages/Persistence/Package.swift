// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "Persistence",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "Persistence", type: .static, targets: ["Persistence"])
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Persistence",
            dependencies: [],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "PersistenceTests",
            dependencies: ["Persistence"]
        )
    ],
    swiftLanguageModes: [.v6]
)
