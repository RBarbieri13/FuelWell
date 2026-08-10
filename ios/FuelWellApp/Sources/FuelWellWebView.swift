import AuthenticationServices
import SwiftUI
import UIKit
import WebKit

// The native shell and its tightly coupled delegates stay together so routing,
// OAuth, downloads, and shell-test behavior remain auditable in one bridge.
// swiftlint:disable file_length type_body_length
struct FuelWellWebView: UIViewRepresentable {
    static let oauthMessageName = "fuelwellOAuth"
    static let shellTestMessageName = "fuelwellShellTest"

    let url: URL
    let supabaseURL: URL?
    let reloadToken: UUID
    let incomingURL: FuelWellIncomingURL?
    let backRequest: Int
    let shellTestMode: Bool
    @Binding var isLoading: Bool
    @Binding var errorMessage: String?
    @Binding var canGoBack: Bool
    @Binding var shellStatus: String?

    func makeCoordinator() -> Coordinator {
        Coordinator(
            policy: FuelWellURLPolicy(
                appURL: url,
                supabaseURL: supabaseURL,
                permitsTestScheme: shellTestMode
            ),
            shellTestMode: shellTestMode,
            isLoading: $isLoading,
            errorMessage: $errorMessage,
            canGoBack: $canGoBack,
            shellStatus: $shellStatus
        )
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.allowsInlineMediaPlayback = true
        configuration.applicationNameForUserAgent = "FuelWell-iOS-App"
        configuration.userContentController.add(context.coordinator, name: Self.oauthMessageName)

        if shellTestMode {
            configuration.userContentController.add(context.coordinator, name: Self.shellTestMessageName)
            configuration.setURLSchemeHandler(FuelWellTestSchemeHandler(), forURLScheme: "fuelwell-test")
        }

        let webView = WKWebView(frame: .zero, configuration: configuration)
        context.coordinator.webView = webView
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.keyboardDismissMode = .interactive
        webView.scrollView.alwaysBounceHorizontal = false
        webView.scrollView.isDirectionalLockEnabled = true
        webView.scrollView.automaticallyAdjustsScrollIndicatorInsets = true
        webView.load(URLRequest(url: url, cachePolicy: .reloadRevalidatingCacheData, timeoutInterval: 30))
        context.coordinator.lastReloadToken = reloadToken
        context.coordinator.lastBackRequest = backRequest
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        if context.coordinator.lastReloadToken != reloadToken {
            context.coordinator.lastReloadToken = reloadToken
            webView.load(URLRequest(url: url, cachePolicy: .reloadRevalidatingCacheData, timeoutInterval: 30))
        }

        if context.coordinator.lastBackRequest != backRequest {
            context.coordinator.lastBackRequest = backRequest
            if webView.canGoBack {
                webView.goBack()
            }
        }

        if let incomingURL, context.coordinator.lastIncomingURLID != incomingURL.id {
            context.coordinator.lastIncomingURLID = incomingURL.id
            context.coordinator.routeIncomingURL(incomingURL.url)
        }
    }

    static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
        coordinator.cancelAuthentication()
        webView.configuration.userContentController.removeScriptMessageHandler(forName: oauthMessageName)
        webView.configuration.userContentController.removeScriptMessageHandler(forName: shellTestMessageName)
        webView.navigationDelegate = nil
        webView.uiDelegate = nil
    }

    @MainActor
    final class Coordinator: NSObject,
        WKNavigationDelegate,
        WKUIDelegate,
        WKDownloadDelegate,
        WKScriptMessageHandler,
        ASWebAuthenticationPresentationContextProviding {
        let policy: FuelWellURLPolicy
        let shellTestMode: Bool
        @Binding var isLoading: Bool
        @Binding var errorMessage: String?
        @Binding var canGoBack: Bool
        @Binding var shellStatus: String?
        weak var webView: WKWebView?
        var lastReloadToken: UUID?
        var lastIncomingURLID: UUID?
        var lastBackRequest = 0
        private var pendingDownloadURL: URL?
        private var authenticationSession: ASWebAuthenticationSession?

        init(
            policy: FuelWellURLPolicy,
            shellTestMode: Bool,
            isLoading: Binding<Bool>,
            errorMessage: Binding<String?>,
            canGoBack: Binding<Bool>,
            shellStatus: Binding<String?>
        ) {
            self.policy = policy
            self.shellTestMode = shellTestMode
            _isLoading = isLoading
            _errorMessage = errorMessage
            _canGoBack = canGoBack
            _shellStatus = shellStatus
        }

        func routeIncomingURL(_ url: URL) {
            guard let destination = policy.webDestination(for: url), let webView else {
                shellStatus = "FuelWell could not open that link."
                return
            }
            shellStatus = nil
            webView.load(URLRequest(url: destination))
        }

        func cancelAuthentication() {
            authenticationSession?.cancel()
            authenticationSession = nil
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation?) {
            isLoading = true
            errorMessage = nil
            updateNavigationState(webView)
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation?) {
            isLoading = false
            errorMessage = nil
            updateNavigationState(webView)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation?, withError error: Error) {
            guard !FuelWellDisplayError.shouldIgnore(error) else { return }
            FuelWellDisplayError.record(error, context: "WKWebView navigation failed")
            isLoading = false
            errorMessage = FuelWellDisplayError.message(for: error)
            updateNavigationState(webView)
        }

        func webView(
            _ webView: WKWebView,
            didFailProvisionalNavigation navigation: WKNavigation?,
            withError error: Error
        ) {
            guard !FuelWellDisplayError.shouldIgnore(error) else { return }
            FuelWellDisplayError.record(error, context: "WKWebView provisional navigation failed")
            isLoading = false
            errorMessage = FuelWellDisplayError.message(for: error)
            updateNavigationState(webView)
        }

        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            guard navigationAction.targetFrame == nil, let url = navigationAction.request.url else { return nil }
            handleNavigation(to: url, in: webView)
            return nil
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction
        ) async -> WKNavigationActionPolicy {
            guard let url = navigationAction.request.url else { return .cancel }

            if navigationAction.shouldPerformDownload {
                return .download
            }

            switch policy.disposition(for: url) {
            case .allowInternal:
                return .allow
            case .routeInternally(let destination):
                webView.load(URLRequest(url: destination))
                return .cancel
            case .openExternal:
                await openExternally(url)
                return .cancel
            case .cancel:
                return .cancel
            }
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationResponse: WKNavigationResponse
        ) async -> WKNavigationResponsePolicy {
            guard let response = navigationResponse.response as? HTTPURLResponse else {
                return .allow
            }
            let disposition = response.value(forHTTPHeaderField: "Content-Disposition")?.lowercased()
            return disposition?.contains("attachment") == true ? .download : .allow
        }

        func webView(
            _ webView: WKWebView,
            navigationResponse: WKNavigationResponse,
            didBecome download: WKDownload
        ) {
            download.delegate = self
            isLoading = false
            errorMessage = nil
            shellStatus = "Download started"
        }

        func webView(
            _ webView: WKWebView,
            navigationAction: WKNavigationAction,
            didBecome download: WKDownload
        ) {
            download.delegate = self
            isLoading = false
            errorMessage = nil
            shellStatus = "Download started"
        }

        func download(
            _ download: WKDownload,
            decideDestinationUsing response: URLResponse,
            suggestedFilename: String
        ) async -> URL? {
            let safeName = suggestedFilename.replacingOccurrences(of: "/", with: "-")
            let destination = FileManager.default.temporaryDirectory.appendingPathComponent(safeName)
            try? FileManager.default.removeItem(at: destination)
            pendingDownloadURL = destination
            return destination
        }

        func downloadDidFinish(_ download: WKDownload) {
            isLoading = false
            errorMessage = nil
            shellStatus = "Download ready to share"
            guard let url = pendingDownloadURL else { return }
            pendingDownloadURL = nil

            guard !shellTestMode else { return }
            presentShareSheet(for: url)
        }

        func download(_ download: WKDownload, didFailWithError error: Error, resumeData: Data?) {
            pendingDownloadURL = nil
            isLoading = false
            errorMessage = "The account export could not be downloaded. Please try again."
            shellStatus = nil
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            if message.name == FuelWellWebView.shellTestMessageName, shellTestMode {
                handleShellTestMessage(message.body)
                return
            }

            guard message.name == FuelWellWebView.oauthMessageName else { return }
            guard message.frameInfo.isMainFrame,
                  policy.isTrustedBridgeOrigin(
                    scheme: message.frameInfo.securityOrigin.protocol,
                    host: message.frameInfo.securityOrigin.host,
                    port: message.frameInfo.securityOrigin.port
                  )
            else {
                shellStatus = "FuelWell blocked an untrusted sign-in request."
                notifyWebAuthenticationResult(error: shellStatus)
                return
            }
            do {
                let request = try FuelWellNativeOAuthRequest(messageBody: message.body, policy: policy)
                startAuthentication(request)
            } catch {
                shellStatus = (error as? LocalizedError)?.errorDescription ?? "FuelWell could not start sign in."
                notifyWebAuthenticationResult(error: shellStatus)
            }
        }

        func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
            UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .first(where: { $0.activationState == .foregroundActive })?
                .windows
                .first(where: \.isKeyWindow) ?? ASPresentationAnchor()
        }

        private func updateNavigationState(_ webView: WKWebView) {
            canGoBack = webView.canGoBack
        }

        private func handleNavigation(to url: URL, in webView: WKWebView) {
            switch policy.disposition(for: url) {
            case .allowInternal:
                webView.load(URLRequest(url: url))
            case .routeInternally(let destination):
                webView.load(URLRequest(url: destination))
            case .openExternal:
                Task { await openExternally(url) }
            case .cancel:
                break
            }
        }

        private func openExternally(_ url: URL) async {
            if shellTestMode {
                shellStatus = "External link opened outside FuelWell"
                return
            }

            let opened = await UIApplication.shared.open(url)
            if !opened {
                shellStatus = "FuelWell could not open that external link."
            }
        }

        private func startAuthentication(_ request: FuelWellNativeOAuthRequest) {
            if shellTestMode {
                shellStatus = "Native OAuth requested for \(request.provider.capitalized)"
                return
            }

            cancelAuthentication()
            shellStatus = nil
            let session = ASWebAuthenticationSession(
                url: request.authorizationURL,
                callbackURLScheme: FuelWellURLPolicy.callbackScheme
            ) { [weak self] callbackURL, error in
                Task { @MainActor [weak self] in
                    guard let self else { return }
                    self.authenticationSession = nil

                    if let callbackURL, let destination = self.policy.webDestination(for: callbackURL) {
                        self.webView?.load(URLRequest(url: destination))
                        return
                    }

                    let message: String
                    if let authenticationError = error as? ASWebAuthenticationSessionError,
                       authenticationError.code == .canceledLogin {
                        message = "Sign in was canceled."
                    } else {
                        message = "FuelWell could not finish sign in. Please try again."
                    }
                    self.shellStatus = message
                    self.notifyWebAuthenticationResult(error: message)
                }
            }
            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = false
            authenticationSession = session

            if !session.start() {
                authenticationSession = nil
                shellStatus = "FuelWell could not open secure sign in. Please try again."
                notifyWebAuthenticationResult(error: shellStatus)
            }
        }

        private func notifyWebAuthenticationResult(error: String?) {
            guard let webView, let error else { return }
            let data = try? JSONSerialization.data(withJSONObject: ["error": error])
            guard let data, let payload = String(data: data, encoding: .utf8) else { return }
            webView.evaluateJavaScript(
                "window.dispatchEvent(new CustomEvent('fuelwell:native-auth-result',{detail:\(payload)}));"
            )
        }

        private func handleShellTestMessage(_ body: Any) {
            guard let message = body as? [String: Any], let action = message["action"] as? String else {
                return
            }
            if action == "inspectPermissions" {
                let info = Bundle.main.infoDictionary ?? [:]
                let camera = info["NSCameraUsageDescription"] as? String
                let location = info["NSLocationWhenInUseUsageDescription"] as? String
                shellStatus = camera?.isEmpty == false && location?.isEmpty == false
                    ? "Camera and location permissions configured"
                    : "Permission configuration missing"
            } else if action == "startDownload",
                      let webView,
                      let url = URL(string: "fuelwell-test://download/export.csv") {
                webView.startDownload(using: URLRequest(url: url)) { [weak self] download in
                    guard let self else { return }
                    download.delegate = self
                    self.isLoading = false
                    self.errorMessage = nil
                    self.shellStatus = "Download started"
                }
            }
        }

        private func presentShareSheet(for url: URL) {
            guard let windowScene = UIApplication.shared.connectedScenes
                .compactMap({ $0 as? UIWindowScene })
                .first(where: { $0.activationState == .foregroundActive }),
                let root = windowScene.windows.first(where: \.isKeyWindow)?.rootViewController
            else { return }

            var presenter = root
            while let presented = presenter.presentedViewController {
                presenter = presented
            }
            let share = UIActivityViewController(activityItems: [url], applicationActivities: nil)
            if let popover = share.popoverPresentationController {
                popover.sourceView = presenter.view
                popover.sourceRect = CGRect(
                    x: presenter.view.bounds.midX,
                    y: presenter.view.bounds.midY,
                    width: 1,
                    height: 1
                )
            }
            presenter.present(share, animated: true)
        }
    }
}

private final class FuelWellTestSchemeHandler: NSObject, WKURLSchemeHandler {
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(URLError(.badURL))
            return
        }

        let payload: Data
        let headers: [String: String]
        if url.host == "download" {
            payload = Data("date,calories\n2026-08-09,2250\n".utf8)
            headers = [
                "Content-Disposition": "attachment; filename=fuelwell-export.csv",
                "Content-Type": "text/csv",
            ]
        } else {
            payload = Data(Self.html(for: url).utf8)
            headers = ["Content-Type": "text/html; charset=utf-8"]
        }

        guard let response = HTTPURLResponse(
            url: url,
            statusCode: 200,
            httpVersion: "HTTP/1.1",
            headerFields: headers
        ) else {
            urlSchemeTask.didFailWithError(URLError(.badServerResponse))
            return
        }
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(payload)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

    private static func html(for url: URL) -> String {
        if url.path == "/second" {
            return page(title: "Second screen", body: "<p>Native web history is active.</p>")
        }
        if url.path == "/app/deep-link" {
            return page(title: "Deep link received", body: "<p>The link returned to the FuelWell web session.</p>")
        }
        if url.path == FuelWellURLPolicy.nativeCallbackPath {
            return page(
                title: "Authentication callback received",
                body: "<p>The secure callback returned to FuelWell.</p>"
            )
        }

        let body = """
        <nav aria-label="Shell verification">
          <a href="fuelwell-test://app/second" aria-label="Open internal test page">Internal page</a>
          <a href="https://www.apple.com/" target="_blank" aria-label="Open external test link">External link</a>
          <a href="fuelwell://open?path=/app/deep-link" aria-label="Open FuelWell deep link">Deep link</a>
          <button aria-label="Start native Google sign in" onclick="startOAuth()">Google sign in</button>
          <label class="button" for="upload">Choose a file</label>
          <input id="upload" aria-label="Choose a file to upload" type="file" />
          <button aria-label="Download account export" onclick="startDownload()">Download export</button>
          <button aria-label="Inspect permission configuration" onclick="inspectPermissions()">Permissions</button>
        </nav>
        <script>
          function startOAuth() {
            window.webkit.messageHandlers.fuelwellOAuth.postMessage({
              authorizationURL: 'https://project-ref.supabase.co/auth/v1/authorize?provider=google&redirect_to=fuelwell%3A%2F%2Fauth%2Fcallback%3Fnext%3D%252Fapp%252Fdashboard',
              provider: 'google',
              next: '/app/dashboard'
            });
          }
          function inspectPermissions() {
            window.webkit.messageHandlers.fuelwellShellTest.postMessage({action: 'inspectPermissions'});
          }
          function startDownload() {
            window.webkit.messageHandlers.fuelwellShellTest.postMessage({action: 'startDownload'});
          }
        </script>
        """
        return page(title: "Shell test home", body: body)
    }

    private static func page(title: String, body: String) -> String {
        """
        <!doctype html>
        <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 24px;
              font: 18px -apple-system, system-ui;
              color: CanvasText;
              background: Canvas;
            }
            h1 { font-size: 28px; }
            nav { display: grid; gap: 12px; }
            a, button, .button {
              display: flex;
              min-height: 48px;
              align-items: center;
              justify-content: center;
              border: 1px solid ButtonText;
              border-radius: 12px;
              padding: 10px 14px;
              color: LinkText;
              background: ButtonFace;
              font: inherit;
              font-weight: 700;
              text-decoration: none;
            }
            input[type=file] { position: absolute; inline-size: 1px; block-size: 1px; opacity: 0; }
          </style>
        </head>
        <body><h1>\(title)</h1>\(body)</body>
        </html>
        """
    }
}
// swiftlint:enable file_length type_body_length
