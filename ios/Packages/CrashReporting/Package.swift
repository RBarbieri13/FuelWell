// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "CrashReporting",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(name: "CrashReporting", type: .static, targets: ["CrashReporting"])
    ],
    dependencies: [
        .package(url: "https://github.com/pointfreeco/swift-dependencies", from: "1.9.0")
    ],
    targets: [
        .target(
            name: "CrashReporting",
            dependencies: [
                .product(name: "Dependencies", package: "swift-dependencies")
            ],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        ),
        .testTarget(
            name: "CrashReportingTests",
            dependencies: ["CrashReporting"],
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("ExistentialAny")
            ]
        )
    ],
    swiftLanguageModes: [.v6]
)
