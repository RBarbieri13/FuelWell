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
    dependencies: [
        .package(path: "../Persistence"),
        .package(url: "https://github.com/pointfreeco/swift-dependencies", from: "1.9.0")
    ],
    targets: [
        .target(
            name: "Core",
            dependencies: [
                "Persistence",
                .product(name: "Dependencies", package: "swift-dependencies")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "CoreTests",
            dependencies: ["Core"],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        )
    ],
    swiftLanguageModes: [.v6]
)
