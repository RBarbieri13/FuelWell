import XCTest

@MainActor
final class FuelWellCriticalPathUITests: XCTestCase {
    private let launchTimeout: TimeInterval = 45
    private let routeTimeout: TimeInterval = 20
    private let liveInferenceTimeout: TimeInterval = 90

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
    }

    func testAppStoreCustomerScreenshots() {
        XCUIDevice.shared.orientation = .portrait

        let app = launchBoundRelease()
        defer { app.terminate() }

        let screenshots = [
            AppStoreScreenshot(name: "01-today", navLabel: "Home", destinationLabel: "Today"),
            AppStoreScreenshot(name: "02-log-meal", navLabel: "Log", destinationLabel: "Log a meal"),
            AppStoreScreenshot(name: "03-coach", navLabel: "Coach", destinationLabel: "Message Coach"),
            AppStoreScreenshot(name: "04-workouts", navLabel: "Move", destinationLabel: "Workouts"),
            AppStoreScreenshot(name: "05-grocery-list", navLabel: "Groceries", destinationLabel: "Grocery list"),
            AppStoreScreenshot(name: "06-daily-review", navLabel: "Review", destinationLabel: "Daily detail"),
        ]

        for screenshot in screenshots {
            let destination = element(in: app, label: screenshot.destinationLabel)
            if !destination.exists {
                tap(label: screenshot.navLabel, in: app)
            }
            XCTAssertTrue(
                destination.waitForExistence(timeout: routeTimeout),
                "\(screenshot.navLabel) did not reach \(screenshot.destinationLabel)."
            )
            captureAppStoreSnapshot(screenshot.name, in: app)
        }
    }

    func testBoundWebReleaseLaunchesDashboard() {
        let app = launchBoundRelease()
        defer { app.terminate() }

        XCTAssertTrue(app.webViews.firstMatch.exists, "FuelWell must launch its release-bound WKWebView.")
        XCTAssertTrue(element(in: app, label: "Home").exists, "The bound web release did not reach the dashboard.")
        assertNoLoadFailure(in: app)
        attachTestEvidence("bound-dashboard", in: app)
    }

    func testPrimaryRoutesNavigateWithoutDeadLinks() {
        let app = launchBoundRelease()
        defer { app.terminate() }

        let routes = [
            Route(navLabel: "Log", destinationLabel: "Log a meal"),
            Route(navLabel: "Coach", destinationLabel: "Message Coach"),
            Route(navLabel: "Move", destinationLabel: "Workouts"),
            Route(navLabel: "Groceries", destinationLabel: "Grocery list"),
            Route(navLabel: "Review", destinationLabel: "Daily detail"),
            Route(navLabel: "Home", destinationLabel: "Today"),
        ]

        for route in routes {
            tap(label: route.navLabel, in: app)
            XCTAssertTrue(
                element(in: app, label: route.destinationLabel).waitForExistence(timeout: routeTimeout),
                "\(route.navLabel) did not reach \(route.destinationLabel)."
            )
            assertNoLoadFailure(in: app)
            attachTestEvidence("route-\(route.navLabel.lowercased())", in: app)
        }
    }

    func testCoachAnswersThroughTheBoundWKWebView() {
        let app = launchBoundRelease()
        defer { app.terminate() }

        tap(label: "Coach", in: app)

        let composer = element(in: app, label: "Message Coach")
        XCTAssertTrue(composer.waitForExistence(timeout: routeTimeout))
        XCTAssertTrue(element(in: app, label: "Send").exists)
        XCTAssertTrue(element(in: app, label: "Attach screenshot, menu, photo, or file").exists)

        composer.tap()
        composer.typeText("What is Neptune? Answer in one short sentence.")
        tap(label: "Send", in: app)

        let factualAnswer = NSPredicate(
            format: "label CONTAINS[c] 'Neptune' AND "
                + "(label CONTAINS[c] 'planet' OR label CONTAINS[c] 'ice giant' "
                + "OR label CONTAINS[c] 'solar system')"
        )
        XCTAssertTrue(
            app.staticTexts.matching(factualAnswer).firstMatch.waitForExistence(timeout: liveInferenceTimeout),
            "Coach did not return a factual live answer inside the bound WKWebView."
        )
        let rejectedTexts = [
            "credit balance",
            "local fallback",
            "temporarily unavailable",
            "Something broke mid-thought"
        ]
        for rejectedText in rejectedTexts {
            let rejected = NSPredicate(format: "label CONTAINS[c] %@", rejectedText)
            XCTAssertFalse(
                app.staticTexts.matching(rejected).firstMatch.exists,
                "Coach displayed rejected fallback text: \(rejectedText)"
            )
        }
        assertNoLoadFailure(in: app)
        attachTestEvidence("coach-live-answer", in: app)
    }

    func testAccessibilityTextSizeKeepsPrimaryNavigationUsable() {
        let app = launchBoundRelease(
            additionalLaunchArguments: [
                "-UIPreferredContentSizeCategoryName",
                "UICTContentSizeCategoryAccessibilityExtraExtraExtraLarge",
            ]
        )
        defer { app.terminate() }

        for label in ["Home", "Log", "Coach", "Move", "Groceries", "Review"] {
            let control = element(in: app, label: label)
            XCTAssertTrue(control.exists, "Missing \(label) at an accessibility text size.")
            XCTAssertTrue(control.isHittable, "\(label) is not usable at an accessibility text size.")
        }

        assertNoLoadFailure(in: app)
        attachTestEvidence("accessibility-text-primary-navigation", in: app)
    }

    func testNativeBackControlReturnsThroughWebHistory() {
        let app = launchShellFixture()
        defer { app.terminate() }

        tap(label: "Open internal test page", in: app)
        XCTAssertTrue(element(in: app, label: "Second screen").waitForExistence(timeout: routeTimeout))

        let back = element(in: app, label: "FuelWell Back")
        XCTAssertTrue(back.waitForExistence(timeout: routeTimeout), "Web history must expose a native Back control.")
        XCTAssertTrue(back.isHittable, "The native Back control must be accessible and tappable.")
        back.tap()

        XCTAssertTrue(element(in: app, label: "Shell test home").waitForExistence(timeout: routeTimeout))
        XCTAssertFalse(back.exists, "Back must disappear when no web history remains.")
        attachTestEvidence("shell-native-back", in: app)
    }

    func testExternalLinksAreRoutedOutsideTheFuelWellWebView() {
        let app = launchShellFixture()
        defer { app.terminate() }

        tap(label: "Open external test link", in: app)
        XCTAssertTrue(
            shellStatus(in: app, containing: "External link opened outside FuelWell")
                .waitForExistence(timeout: routeTimeout),
            "External HTTPS links must be intercepted instead of loading in FuelWell."
        )
        XCTAssertTrue(element(in: app, label: "Shell test home").exists)
        attachTestEvidence("shell-external-link", in: app)
    }

    func testDeepLinkCallbackReturnsIntoTheBoundWebSession() {
        let app = launchShellFixture()
        defer { app.terminate() }

        tap(label: "Open FuelWell deep link", in: app)
        XCTAssertTrue(
            element(in: app, label: "Deep link received").waitForExistence(timeout: routeTimeout),
            "FuelWell deep links must return to a trusted route in the existing WKWebView."
        )
        attachTestEvidence("shell-deep-link-handoff", in: app)
    }

    func testNativeOAuthRequestLeavesTheEmbeddedWebView() {
        let app = launchShellFixture()
        defer { app.terminate() }

        tap(label: "Start native Google sign in", in: app)
        XCTAssertTrue(
            shellStatus(in: app, containing: "Native OAuth requested for Google")
                .waitForExistence(timeout: routeTimeout),
            "OAuth must hand off to the native authentication session bridge."
        )
        XCTAssertTrue(element(in: app, label: "Shell test home").exists)
        attachTestEvidence("shell-native-oauth-handoff", in: app)
    }

    func testFileUploadControlOpensTheSystemPicker() {
        let app = launchShellFixture()
        defer { app.terminate() }

        tap(label: "Choose a file", in: app)
        XCTAssertTrue(
            app.buttons["Choose File"].waitForExistence(timeout: routeTimeout),
            "The WKWebView file input must expose the iOS file picker option."
        )
        XCTAssertTrue(app.buttons["Photo Library"].exists, "The upload control must retain photo-library access.")
        XCTAssertTrue(app.buttons["Take Photo or Video"].exists, "The upload control must retain camera access.")
        attachTestEvidence("shell-file-upload-picker", in: app)
    }

    func testDownloadUsesTheNativeDownloadPath() {
        let app = launchShellFixture()
        defer { app.terminate() }

        tap(label: "Download account export", in: app)
        XCTAssertTrue(
            shellStatus(in: app, containing: "Download")
                .waitForExistence(timeout: routeTimeout),
            "Download responses must enter WKDownload instead of rendering as a web page."
        )
        attachTestEvidence("shell-native-download", in: app)
    }

    func testCameraAndLocationPermissionPurposesAreConfigured() {
        let app = launchShellFixture()
        defer { app.terminate() }

        tap(label: "Inspect permission configuration", in: app)
        XCTAssertTrue(
            shellStatus(in: app, containing: "Camera and location permissions configured")
                .waitForExistence(timeout: routeTimeout),
            "The shipping app must declare camera and location purpose strings."
        )
        attachTestEvidence("shell-permission-purposes", in: app)
    }

    private func launchBoundRelease(additionalLaunchArguments: [String] = []) -> XCUIApplication {
        let app = XCUIApplication()
        setupSnapshot(app)
        app.launchArguments += ["--fuelwell-candidate-ui-test"]
        app.launchArguments += additionalLaunchArguments
        app.launch()

        XCTAssertTrue(
            app.webViews.firstMatch.waitForExistence(timeout: launchTimeout),
            launchFailureMessage(in: app)
        )
        authenticateIfNeeded(in: app)
        dismissKeyboardIntroductionIfNeeded(in: app)
        XCTAssertTrue(
            element(in: app, label: "Home").waitForExistence(timeout: launchTimeout),
            launchFailureMessage(in: app)
        )
        assertNoLoadFailure(in: app)
        return app
    }

    private func launchShellFixture() -> XCUIApplication {
        let app = XCUIApplication()
        setupSnapshot(app)
        app.launchArguments += ["--fuelwell-shell-ui-test"]
        app.launch()

        XCTAssertTrue(
            app.webViews.firstMatch.waitForExistence(timeout: launchTimeout),
            "The deterministic WKWebView shell fixture did not launch."
        )
        XCTAssertTrue(
            element(in: app, label: "Shell test home").waitForExistence(timeout: launchTimeout),
            "The deterministic WKWebView shell fixture did not become ready."
        )
        return app
    }

    private func shellStatus(in app: XCUIApplication, containing text: String) -> XCUIElement {
        let predicate = NSPredicate(format: "label CONTAINS[c] %@ OR value CONTAINS[c] %@", text, text)
        return app.descendants(matching: .any).matching(predicate).firstMatch
    }

    private func authenticateIfNeeded(in app: XCUIApplication) {
        guard app.staticTexts["Welcome back"].waitForExistence(timeout: 5) else { return }

        let environment = ProcessInfo.processInfo.environment
        guard
            let email = environment["FUELWELL_UI_TEST_EMAIL"], !email.isEmpty,
            let password = environment["FUELWELL_UI_TEST_PASSWORD"], !password.isEmpty
        else {
            XCTFail("Candidate requires sign-in. Set FUELWELL_UI_TEST_EMAIL and FUELWELL_UI_TEST_PASSWORD.")
            return
        }

        let emailField = app.textFields["Email"]
        let passwordField = app.secureTextFields["Password"]
        XCTAssertTrue(emailField.waitForExistence(timeout: routeTimeout))
        XCTAssertTrue(passwordField.exists)
        emailField.tap()
        emailField.typeText(email)
        passwordField.tap()
        passwordField.typeText(password)
        tap(label: "Sign in", in: app)
    }

    private func tap(label: String, in app: XCUIApplication) {
        let target = element(in: app, label: label)
        XCTAssertTrue(target.waitForExistence(timeout: routeTimeout), "Missing navigation control: \(label)")

        let bottomNavigationLabels = ["Home", "Log", "Coach", "Move", "Groceries", "Review"]
        if bottomNavigationLabels.contains(label) {
            dismissKeyboardIntroductionIfNeeded(in: app)
            // Concurrent WebKit screenshot runs can expose a visible link with a
            // transiently invalid accessibility activation point. Tap the center
            // of the semantic control's visible frame instead.
            let targetFrame = target.frame
            let appFrame = app.frame
            XCTAssertFalse(targetFrame.isEmpty, "Navigation control has no visible frame: \(label)")
            let x = (targetFrame.midX - appFrame.minX) / appFrame.width
            let y = (targetFrame.midY - appFrame.minY) / appFrame.height
            app.coordinate(withNormalizedOffset: CGVector(dx: x, dy: y)).tap()
            return
        }

        XCTAssertTrue(target.isHittable, "Navigation control is not tappable: \(label)")
        target.tap()
    }

    private func dismissKeyboardIntroductionIfNeeded(in app: XCUIApplication) {
        let continueButton = app.buttons["Continue"]
        guard continueButton.waitForExistence(timeout: 2) else { return }

        XCTAssertTrue(continueButton.isHittable, "The iOS keyboard introduction must be dismissible.")
        continueButton.tap()
        XCTAssertFalse(
            continueButton.waitForExistence(timeout: 3),
            "The iOS keyboard introduction obscured the candidate after dismissal."
        )
    }

    private func element(in app: XCUIApplication, label: String) -> XCUIElement {
        let predicate = NSPredicate(format: "label == %@ OR identifier == %@", label, label)
        return app.descendants(matching: .any).matching(predicate).firstMatch
    }

    private func assertNoLoadFailure(in app: XCUIApplication) {
        XCTAssertFalse(app.staticTexts["FuelWell could not load"].exists)
        XCTAssertFalse(app.staticTexts["Internal Server Error"].exists)
        XCTAssertFalse(app.staticTexts["This site can't be reached"].exists)
    }

    private func launchFailureMessage(in app: XCUIApplication) -> String {
        if app.staticTexts["FuelWell could not load"].exists {
            return "The native release-binding gate rejected or could not reach the candidate."
        }
        return "The release-bound WKWebView did not become ready."
    }

    private func captureAppStoreSnapshot(_ name: String, in app: XCUIApplication) {
        let excludedLabels = [
            "Welcome back",
            "Sign in",
            "Create your account",
            "Shell test home",
            "FuelWell could not load",
            "Internal Server Error",
            "This site can't be reached",
            "Choose File",
            "Photo Library",
            "Take Photo or Video",
        ]

        for label in excludedLabels {
            XCTAssertFalse(
                element(in: app, label: label).exists,
                "App Store screenshot \(name) contains excluded UI: \(label)."
            )
        }
        assertNoLoadFailure(in: app)
        snapshot(name, timeWaitingForIdle: 0)
        attachTestEvidence(name, in: app)
    }

    private func attachTestEvidence(_ name: String, in app: XCUIApplication) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}

private struct Route {
    let navLabel: String
    let destinationLabel: String
}

private struct AppStoreScreenshot {
    let name: String
    let navLabel: String
    let destinationLabel: String
}
