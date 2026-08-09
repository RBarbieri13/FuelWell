import DesignSystem
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
            _errorMessage = State(initialValue: error.localizedDescription)
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
            isLoading = false
            errorMessage = error.localizedDescription
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

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        @Binding var isLoading: Bool
        @Binding var errorMessage: String?
        var lastReloadToken: UUID?

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
            isLoading = false
            errorMessage = error.localizedDescription
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation?, withError error: Error) {
            isLoading = false
            errorMessage = error.localizedDescription
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
    }
}
