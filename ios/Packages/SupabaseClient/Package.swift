// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "SupabaseClient",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "SupabaseClient", type: .static, targets: ["SupabaseClient"])
    ],
    dependencies: [
        .package(path: "../Core"),
        .package(url: "https://github.com/pointfreeco/swift-dependencies", from: "1.9.0")
    ],
    targets: [
        .target(
            name: "SupabaseClient",
            dependencies: [
                "Core",
                .product(name: "Dependencies", package: "swift-dependencies")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "SupabaseClientTests",
            dependencies: ["SupabaseClient"],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        )
    ],
    swiftLanguageModes: [.v6]
)
