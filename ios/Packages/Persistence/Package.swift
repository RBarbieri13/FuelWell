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
    dependencies: [
        .package(path: "../Core")
    ],
    targets: [
        .target(
            name: "Persistence",
            dependencies: ["Core"],
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
