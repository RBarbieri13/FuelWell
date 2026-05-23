// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "Core",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "Core", type: .static, targets: ["Core"])
    ],
    targets: [
        .target(
            name: "Core",
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "CoreTests",
            dependencies: ["Core"]
        )
    ],
    swiftLanguageModes: [.v6]
)
