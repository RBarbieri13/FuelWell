import XCTest

@MainActor
final class FuelWellCriticalPathUITests: XCTestCase {
    func testLaunchPerformanceBudget() {
        self.continueAfterFailure = false

        measure(metrics: [XCTApplicationLaunchMetric(waitUntilResponsive: true)]) {
            let app = XCUIApplication()
            app.launchArguments = ["--ui-testing"]
            app.launch()
            XCTAssertTrue(app.navigationBars["Dashboard"].waitForExistence(timeout: 5))
            app.terminate()
        }
    }

    func testPrimaryTabNavigationPerformanceBudget() {
        let app = self.launchApp()
        defer { app.terminate() }

        measure(metrics: [XCTClockMetric()]) {
            app.tabBars.buttons["Meals"].tap()
            XCTAssertTrue(app.navigationBars["Meals & Nutrition"].waitForExistence(timeout: 2))

            app.tabBars.buttons["Coach"].tap()
            XCTAssertTrue(app.navigationBars["Coach Chat"].waitForExistence(timeout: 2))

            app.tabBars.buttons["Exercise"].tap()
            XCTAssertTrue(app.navigationBars["Exercise & Activity"].waitForExistence(timeout: 2))

            app.tabBars.buttons["Progress"].tap()
            XCTAssertTrue(app.navigationBars["Progress"].waitForExistence(timeout: 2))
        }
    }

    func testColdLaunchShowsDashboardQualitySurfaces() {
        let app = self.launchApp()
        defer { app.terminate() }

        XCTAssertTrue(app.staticTexts["Dashboard"].exists)
        XCTAssertTrue(app.descendants(matching: .any)["dashboard.health-score"].exists)
        XCTAssertTrue(app.descendants(matching: .any)["dashboard.inflows-outflows"].exists)
        XCTAssertTrue(app.descendants(matching: .any)["dashboard.verdict"].exists)
    }

    func testMenuAndHelpSheetsOpenFromDashboard() {
        let app = self.launchApp()
        defer { app.terminate() }

        app.buttons["nav.menu"].tap()
        XCTAssertTrue(app.staticTexts["Menu"].waitForExistence(timeout: 2))
        app.buttons["Close"].tap()

        app.buttons["nav.help"].tap()
        XCTAssertTrue(app.staticTexts["Help"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.staticTexts["Search articles, settings, or ask a question"].exists)
    }

    func testFeedbackCanBeSubmittedFromHelp() {
        let app = self.launchApp()
        defer { app.terminate() }

        app.buttons["nav.help"].tap()
        XCTAssertTrue(app.staticTexts["Help"].waitForExistence(timeout: 2))

        app.buttons["feedback.submit"].tap()
        XCTAssertTrue(app.navigationBars["Send Feedback"].waitForExistence(timeout: 2))

        app.textViews["feedback.message"].tap()
        app.textViews["feedback.message"].typeText("Pilot feedback from UI test")

        let submitButton = app.buttons["feedback.submit"]
        self.waitUntilEnabled(submitButton)
        submitButton.tap()

        XCTAssertTrue(app.staticTexts["feedback.success"].waitForExistence(timeout: 2))
    }

    func testAddMealCriticalPath() {
        let app = self.launchApp()
        defer { app.terminate() }

        app.tabBars.buttons["Meals"].tap()
        XCTAssertTrue(app.navigationBars["Meals & Nutrition"].waitForExistence(timeout: 2))

        app.buttons["nutrition.add-meal"].tap()
        XCTAssertTrue(app.staticTexts["Add Meal"].waitForExistence(timeout: 2))

        app.textFields["Meal name"].tap()
        app.textFields["Meal name"].typeText("Quality test bowl")
        app.textFields["Calories"].tap()
        app.textFields["Calories"].typeText("500")
        app.textFields["Protein"].tap()
        app.textFields["Protein"].typeText("40")

        let saveButton = app.buttons["nutrition.add-meal.save"]
        XCTAssertTrue(saveButton.waitForExistence(timeout: 2))
        self.waitUntilEnabled(saveButton)
        saveButton.tap()

        XCTAssertTrue(app.staticTexts["Quality test bowl"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.staticTexts["40g protein - 500 calories"].exists)
    }

    func testPrimaryTabsRemainReachable() {
        let app = self.launchApp()
        defer { app.terminate() }

        app.tabBars.buttons["Coach"].tap()
        XCTAssertTrue(app.navigationBars["Coach Chat"].waitForExistence(timeout: 2))

        app.tabBars.buttons["Exercise"].tap()
        XCTAssertTrue(app.navigationBars["Exercise & Activity"].waitForExistence(timeout: 2))

        app.tabBars.buttons["Progress"].tap()
        XCTAssertTrue(app.navigationBars["Progress"].waitForExistence(timeout: 2))
    }

    private func launchApp() -> XCUIApplication {
        self.continueAfterFailure = false

        let app = XCUIApplication()
        app.launchArguments = ["--ui-testing"]
        app.launch()
        XCTAssertTrue(app.navigationBars["Dashboard"].waitForExistence(timeout: 5))
        return app
    }

    private func waitUntilEnabled(_ element: XCUIElement, timeout: TimeInterval = 6) {
        let predicate = NSPredicate(format: "isEnabled == true")
        self.expectation(for: predicate, evaluatedWith: element)
        self.waitForExpectations(timeout: timeout)
    }
}
