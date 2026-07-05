// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "SubscriptionClient",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "SubscriptionClient", type: .static, targets: ["SubscriptionClient"])
    ],
    dependencies: [
        .package(url: "https://github.com/pointfreeco/swift-dependencies", from: "1.9.0")
    ],
    targets: [
        .target(
            name: "SubscriptionClient",
            dependencies: [
                .product(name: "Dependencies", package: "swift-dependencies")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "SubscriptionClientTests",
            dependencies: ["SubscriptionClient"],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        )
    ],
    swiftLanguageModes: [.v6]
)
