// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "AnthropicClient",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "AnthropicClient", type: .static, targets: ["AnthropicClient"])
    ],
    dependencies: [
        .package(path: "../SupabaseClient"),
        .package(url: "https://github.com/pointfreeco/swift-dependencies", from: "1.9.0")
    ],
    targets: [
        .target(
            name: "AnthropicClient",
            dependencies: [
                "SupabaseClient",
                .product(name: "Dependencies", package: "swift-dependencies")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "AnthropicClientTests",
            dependencies: ["AnthropicClient"],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        )
    ],
    swiftLanguageModes: [.v6]
)
