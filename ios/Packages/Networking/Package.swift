// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "Networking",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "Networking", type: .static, targets: ["Networking"])
    ],
    dependencies: [
        .package(path: "../Core")
    ],
    targets: [
        .target(
            name: "Networking",
            dependencies: ["Core"],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "NetworkingTests",
            dependencies: ["Networking"]
        )
    ],
    swiftLanguageModes: [.v6]
)
