import DesignSystem
import SwiftUI
import WebKit

@main
struct FuelWellApp: SwiftUI.App {
    init() {
        FuelWellFontRegistry.registerBundledFonts()
    }

    var body: some Scene {
        WindowGroup {
            FuelWellWebAppView(
                startURL: URL(string: "https://fuelwell-preview.vercel.app/app/dashboard")!
            )
        }
    }
}

private struct FuelWellWebAppView: View {
    let startURL: URL

    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var reloadToken = UUID()

    var body: some View {
        ZStack {
            FuelWellWebView(
                url: startURL,
                reloadToken: reloadToken,
                isLoading: $isLoading,
                errorMessage: $errorMessage
            )
            .ignoresSafeArea(.keyboard)

            if isLoading {
                VStack(spacing: 14) {
                    ProgressView()
                        .tint(Color(red: 0.06, green: 0.61, blue: 0.44))
                    Text("Loading FuelWell")
                        .font(.headline)
                        .foregroundStyle(.secondary)
                }
                .padding(24)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            }

            if let errorMessage {
                VStack(spacing: 16) {
                    Text("FuelWell could not load")
                        .font(.headline)
                    Text(errorMessage)
                        .font(.subheadline)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(.secondary)
                    Button {
                        self.errorMessage = nil
                        isLoading = true
                        reloadToken = UUID()
                    } label: {
                        Text("Try again")
                            .fontWeight(.bold)
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color(red: 0.06, green: 0.61, blue: 0.44))
                }
                .padding(24)
                .frame(maxWidth: 320)
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
                .padding()
            }
        }
        .background(Color(red: 0.91, green: 0.98, blue: 0.96))
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
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.load(URLRequest(url: url, cachePolicy: .reloadRevalidatingCacheData, timeoutInterval: 30))
        context.coordinator.lastReloadToken = reloadToken
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        guard context.coordinator.lastReloadToken != reloadToken else { return }
        context.coordinator.lastReloadToken = reloadToken
        webView.load(URLRequest(url: url, cachePolicy: .reloadRevalidatingCacheData, timeoutInterval: 30))
    }

    final class Coordinator: NSObject, WKNavigationDelegate {
        @Binding var isLoading: Bool
        @Binding var errorMessage: String?
        var lastReloadToken: UUID?

        init(isLoading: Binding<Bool>, errorMessage: Binding<String?>) {
            _isLoading = isLoading
            _errorMessage = errorMessage
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            isLoading = true
            errorMessage = nil
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            isLoading = false
            errorMessage = nil
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            isLoading = false
            errorMessage = error.localizedDescription
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            isLoading = false
            errorMessage = error.localizedDescription
        }
    }
}
