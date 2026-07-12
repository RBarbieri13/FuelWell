import XCTest

@MainActor
final class FuelWellCriticalPathUITests: XCTestCase {
    private let launchTimeout: TimeInterval = 45
    private let routeTimeout: TimeInterval = 20

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
    }

    func testBoundWebReleaseLaunchesDashboard() {
        let app = launchBoundRelease()
        defer { app.terminate() }

        XCTAssertTrue(app.webViews.firstMatch.exists, "FuelWell must launch its release-bound WKWebView.")
        XCTAssertTrue(element(in: app, label: "Home").exists, "The bound web release did not reach the dashboard.")
        assertNoLoadFailure(in: app)
        capture("bound-dashboard", in: app)
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
            capture("route-\(route.navLabel.lowercased())", in: app)
        }
    }

    func testCoachSurfaceIsPresentWithoutInvokingPaidInference() {
        let app = launchBoundRelease()
        defer { app.terminate() }

        tap(label: "Coach", in: app)

        XCTAssertTrue(element(in: app, label: "Message Coach").waitForExistence(timeout: routeTimeout))
        XCTAssertTrue(element(in: app, label: "Send").exists)
        XCTAssertTrue(element(in: app, label: "Attach screenshot, menu, photo, or file").exists)
        let billingError = NSPredicate(format: "label CONTAINS[c] 'credit balance'")
        XCTAssertFalse(app.staticTexts.matching(billingError).firstMatch.exists)
        assertNoLoadFailure(in: app)
        capture("coach-ready", in: app)
    }

    private func launchBoundRelease() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["--fuelwell-candidate-ui-test"]
        app.launch()

        XCTAssertTrue(
            app.webViews.firstMatch.waitForExistence(timeout: launchTimeout),
            launchFailureMessage(in: app)
        )
        authenticateIfNeeded(in: app)
        XCTAssertTrue(
            element(in: app, label: "Home").waitForExistence(timeout: launchTimeout),
            launchFailureMessage(in: app)
        )
        assertNoLoadFailure(in: app)
        return app
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
        XCTAssertTrue(target.isHittable, "Navigation control is not tappable: \(label)")
        target.tap()
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

    private func capture(_ name: String, in app: XCUIApplication) {
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
