// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "App",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "App", type: .static, targets: ["App"])
    ],
    dependencies: [
        .package(path: "../../Packages/Core"),
        .package(path: "../../Packages/DesignSystem"),
        .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.17.0"),
        .package(url: "https://github.com/johnpatrickmorgan/TCACoordinators", from: "0.9.0")
    ],
    targets: [
        .target(
            name: "App",
            dependencies: [
                "Core",
                "DesignSystem",
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "AppTests",
            dependencies: [
                "App",
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture")
            ],
            path: "Tests/AppTests"
        )
    ],
    swiftLanguageModes: [.v6]
)
