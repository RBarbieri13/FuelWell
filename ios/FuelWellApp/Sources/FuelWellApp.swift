import DesignSystem
import OSLog
import SwiftUI
import UIKit
import WebKit

@main
struct FuelWellApp: SwiftUI.App {
    init() {
        FuelWellFontRegistry.registerBundledFonts()
    }

    var body: some Scene {
        WindowGroup {
            FuelWellWebAppView()
        }
    }
}

enum FuelWellDisplayError {
    private static let logger = Logger(
        subsystem: Bundle.main.bundleIdentifier ?? "com.fuelwell.app",
        category: "ReleaseShell"
    )

    static func message(for error: Error) -> String {
        if let releaseError = error as? ReleaseBindingError {
            return releaseError.localizedDescription
        }

        if let urlError = error as? URLError {
            switch urlError.code {
            case .timedOut:
                return "FuelWell is taking longer than expected. Check your connection and try again."
            case .cannotFindHost,
                 .cannotConnectToHost,
                 .dataNotAllowed,
                 .dnsLookupFailed,
                 .internationalRoamingOff,
                 .networkConnectionLost,
                 .notConnectedToInternet:
                return "FuelWell can’t connect right now. Check your internet connection and try again."
            default:
                break
            }
        }

        return "FuelWell is temporarily unavailable. Try again in a moment."
    }

    static func shouldIgnore(_ error: Error) -> Bool {
        (error as? URLError)?.code == .cancelled
    }

    static func record(_ error: Error, context: String) {
        logger.error(
            "\(context, privacy: .public): \(String(describing: error), privacy: .private(mask: .hash))"
        )
    }
}

private struct FuelWellWebAppView: View {
    @Environment(\.theme) private var theme

    private let releaseBinding: ReleaseBinding?

    @State private var isLoading: Bool
    @State private var errorMessage: String?
    @State private var releaseIsVerified = false
    @State private var reloadToken = UUID()

    init(infoDictionary: [String: Any] = Bundle.main.infoDictionary ?? [:]) {
        do {
            releaseBinding = try ReleaseBinding(infoDictionary: infoDictionary)
            _isLoading = State(initialValue: true)
            _errorMessage = State(initialValue: nil)
        } catch {
            releaseBinding = nil
            _isLoading = State(initialValue: false)
            FuelWellDisplayError.record(error, context: "Invalid release configuration")
            _errorMessage = State(initialValue: FuelWellDisplayError.message(for: error))
        }
    }

    var body: some View {
        ZStack {
            if releaseIsVerified, let releaseBinding {
                FuelWellWebView(
                    url: releaseBinding.startURL,
                    reloadToken: reloadToken,
                    isLoading: $isLoading,
                    errorMessage: $errorMessage
                )
            }

            if isLoading {
                VStack(spacing: self.theme.spacing.sm) {
                    ProgressView()
                        .controlSize(.large)
                        .tint(self.theme.color.primary.accent.color)
                    Text("Preparing FuelWell")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(self.theme.color.text.primary.color)
                    Text("Verifying this build and opening your dashboard.")
                        .font(.subheadline)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(self.theme.color.text.secondary.color)
                }
                .padding(self.theme.spacing.lg)
                .frame(maxWidth: 320)
                .background(
                    self.theme.color.bg.surface.color,
                    in: RoundedRectangle(cornerRadius: self.theme.radius.lg, style: .continuous)
                )
                .overlay {
                    RoundedRectangle(cornerRadius: self.theme.radius.lg, style: .continuous)
                        .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel("Loading FuelWell")
                .accessibilityValue("Verifying this build and opening your dashboard.")
                .accessibilityAddTraits(.updatesFrequently)
            }

            if let errorMessage {
                VStack(spacing: self.theme.spacing.md) {
                    Image(systemName: "wifi.exclamationmark")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(self.theme.color.semantic.warning.color)
                        .accessibilityHidden(true)
                    Text("FuelWell couldn’t open")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(self.theme.color.text.primary.color)
                    Text(errorMessage)
                        .font(.subheadline)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(self.theme.color.text.secondary.color)
                    if releaseBinding != nil {
                        Button {
                            self.errorMessage = nil
                            isLoading = true
                            releaseIsVerified = false
                            reloadToken = UUID()
                        } label: {
                            Label("Try again", systemImage: "arrow.clockwise")
                                .font(.headline.weight(.bold))
                                .frame(maxWidth: .infinity)
                                .frame(minHeight: 44)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(self.theme.color.bg.elevated.color)
                        .accessibilityHint("Checks this build again and reloads FuelWell.")
                    }
                }
                .padding(self.theme.spacing.lg)
                .frame(maxWidth: 320)
                .background(
                    self.theme.color.bg.surface.color,
                    in: RoundedRectangle(cornerRadius: self.theme.radius.lg, style: .continuous)
                )
                .overlay {
                    RoundedRectangle(cornerRadius: self.theme.radius.lg, style: .continuous)
                        .stroke(self.theme.color.bg.border.color, lineWidth: 1)
                }
                .padding(self.theme.spacing.md)
                .accessibilityElement(children: .contain)
            }
        }
        .background(self.theme.color.bg.base.color)
        .task(id: reloadToken) {
            await verifyRelease()
        }
    }

    @MainActor
    private func verifyRelease() async {
        guard let releaseBinding else { return }

        isLoading = true
        errorMessage = nil
        releaseIsVerified = false

        do {
            try await releaseBinding.fetchAndValidate()
            guard !Task.isCancelled else { return }
            releaseIsVerified = true
        } catch {
            guard !Task.isCancelled else { return }
            FuelWellDisplayError.record(error, context: "Release verification failed")
            isLoading = false
            errorMessage = FuelWellDisplayError.message(for: error)
        }
    }
}

private struct FuelWellWebView: UIViewRepresentable {
    let url: URL
    let reloadToken: UUID
    @Binding var isLoading: Bool
    @Binding var errorMessage: String?

    func makeCoordinator() -> Coordinator {
        Coordinator(isLoading: $isLoading, errorMessage: $errorMessage)
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.allowsInlineMediaPlayback = true
        configuration.applicationNameForUserAgent = "FuelWell-iOS-TestFlight"

        let webView = WKWebView(frame: .zero, configuration: configuration)
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
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        guard context.coordinator.lastReloadToken != reloadToken else { return }
        context.coordinator.lastReloadToken = reloadToken
        webView.load(URLRequest(url: url, cachePolicy: .reloadRevalidatingCacheData, timeoutInterval: 30))
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKDownloadDelegate {
        @Binding var isLoading: Bool
        @Binding var errorMessage: String?
        var lastReloadToken: UUID?
        private var pendingDownloadURL: URL?

        init(isLoading: Binding<Bool>, errorMessage: Binding<String?>) {
            _isLoading = isLoading
            _errorMessage = errorMessage
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation?) {
            isLoading = true
            errorMessage = nil
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation?) {
            isLoading = false
            errorMessage = nil
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation?, withError error: Error) {
            guard !FuelWellDisplayError.shouldIgnore(error) else { return }
            FuelWellDisplayError.record(error, context: "WKWebView navigation failed")
            isLoading = false
            errorMessage = FuelWellDisplayError.message(for: error)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation?, withError error: Error) {
            guard !FuelWellDisplayError.shouldIgnore(error) else { return }
            FuelWellDisplayError.record(error, context: "WKWebView provisional navigation failed")
            isLoading = false
            errorMessage = FuelWellDisplayError.message(for: error)
        }

        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            guard navigationAction.targetFrame == nil else { return nil }
            webView.load(navigationAction.request)
            return nil
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction
        ) async -> WKNavigationActionPolicy {
            guard let url = navigationAction.request.url else { return .cancel }

            if let scheme = url.scheme?.lowercased(), !["http", "https", "about"].contains(scheme) {
                await UIApplication.shared.open(url)
                return .cancel
            }

            return .allow
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
        }

        func webView(
            _ webView: WKWebView,
            navigationAction: WKNavigationAction,
            didBecome download: WKDownload
        ) {
            download.delegate = self
            isLoading = false
            errorMessage = nil
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
            guard let url = pendingDownloadURL else { return }
            pendingDownloadURL = nil
            Task { @MainActor in
                guard let windowScene = UIApplication.shared.connectedScenes
                    .compactMap({ $0 as? UIWindowScene })
                    .first(where: { $0.activationState == .foregroundActive }),
                    let root = windowScene.windows.first(where: { $0.isKeyWindow })?.rootViewController
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

        func download(_ download: WKDownload, didFailWithError error: Error, resumeData: Data?) {
            pendingDownloadURL = nil
            isLoading = false
            errorMessage = "The account export could not be downloaded. Please try again."
        }
    }
}
