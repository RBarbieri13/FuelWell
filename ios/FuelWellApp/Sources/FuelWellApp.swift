import DesignSystem
import OSLog
import SwiftUI

@main
struct FuelWellApp: SwiftUI.App {
    @State private var incomingURL: FuelWellIncomingURL?

    init() {
        FuelWellFontRegistry.registerBundledFonts()
    }

    var body: some Scene {
        WindowGroup {
            FuelWellWebAppView(incomingURL: $incomingURL)
                .onOpenURL { url in
                    incomingURL = FuelWellIncomingURL(url: url)
                }
                .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
                    guard let url = activity.webpageURL else { return }
                    incomingURL = FuelWellIncomingURL(url: url)
                }
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
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.theme) private var theme

    private let releaseBinding: ReleaseBinding?
    private let launchURL: URL?
    private let supabaseURL: URL?
    private let shellTestMode: Bool
    @Binding private var incomingURL: FuelWellIncomingURL?

    @State private var isLoading: Bool
    @State private var errorMessage: String?
    @State private var releaseIsVerified: Bool
    @State private var reloadToken = UUID()
    @State private var canGoBack = false
    @State private var backRequest = 0
    @State private var shellStatus: String?

    init(
        incomingURL: Binding<FuelWellIncomingURL?>,
        infoDictionary: [String: Any] = Bundle.main.infoDictionary ?? [:],
        arguments: [String] = ProcessInfo.processInfo.arguments
    ) {
        _incomingURL = incomingURL
        shellTestMode = arguments.contains("--fuelwell-shell-ui-test")
        let configuredSupabaseURL = (infoDictionary["FuelWellSupabaseURL"] as? String)
            .flatMap(URL.init(string:))
            .flatMap { url in
                url.scheme?.lowercased() == "https" && url.host != nil ? url : nil
            }
        supabaseURL = shellTestMode
            ? URL(string: "https://project-ref.supabase.co")
            : configuredSupabaseURL

        if shellTestMode {
            releaseBinding = nil
            launchURL = URL(string: "fuelwell-test://app/home")
            _isLoading = State(initialValue: true)
            _errorMessage = State(initialValue: nil)
            _releaseIsVerified = State(initialValue: true)
            return
        }

        do {
            let binding = try ReleaseBinding(infoDictionary: infoDictionary)
            releaseBinding = binding
            launchURL = binding.startURL
            _isLoading = State(initialValue: true)
            _errorMessage = State(initialValue: nil)
            _releaseIsVerified = State(initialValue: false)
        } catch {
            releaseBinding = nil
            launchURL = nil
            _isLoading = State(initialValue: false)
            _releaseIsVerified = State(initialValue: false)
            FuelWellDisplayError.record(error, context: "Invalid release configuration")
            _errorMessage = State(initialValue: FuelWellDisplayError.message(for: error))
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            if canGoBack {
                HStack {
                    Button {
                        backRequest &+= 1
                    } label: {
                        Label("Back", systemImage: "chevron.left")
                            .font(.body.weight(.bold))
                            .frame(minHeight: 44)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(self.theme.color.text.primary.color)
                    .accessibilityIdentifier("FuelWell Back")
                    .accessibilityHint("Returns to the previous FuelWell screen.")
                    Spacer(minLength: 0)
                }
                .padding(.horizontal, self.theme.spacing.md)
                .background(self.theme.color.bg.surface.color)
                .overlay(alignment: .bottom) {
                    Rectangle()
                        .fill(self.theme.color.bg.borderSoft.color)
                        .frame(height: 1)
                }
            }

            ZStack(alignment: .top) {
                if releaseIsVerified, let launchURL {
                    FuelWellWebView(
                        url: launchURL,
                        supabaseURL: supabaseURL,
                        reloadToken: reloadToken,
                        incomingURL: incomingURL,
                        backRequest: backRequest,
                        shellTestMode: shellTestMode,
                        isLoading: $isLoading,
                        errorMessage: $errorMessage,
                        canGoBack: $canGoBack,
                        shellStatus: $shellStatus
                    )
                }

                if let shellStatus {
                    HStack(spacing: self.theme.spacing.sm) {
                        Image(systemName: "info.circle.fill")
                            .foregroundStyle(self.theme.color.primary.accent.color)
                            .accessibilityHidden(true)
                        Text(shellStatus)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(self.theme.color.text.primary.color)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        Button {
                            self.shellStatus = nil
                        } label: {
                            Image(systemName: "xmark")
                                .frame(width: 44, height: 44)
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("Dismiss")
                    }
                    .padding(.leading, self.theme.spacing.md)
                    .background(
                        self.theme.color.bg.surface.color,
                        in: RoundedRectangle(cornerRadius: self.theme.radius.md, style: .continuous)
                    )
                    .overlay {
                        RoundedRectangle(cornerRadius: self.theme.radius.md, style: .continuous)
                            .stroke(self.theme.color.bg.border.color, lineWidth: 1)
                    }
                    .padding(self.theme.spacing.sm)
                    .accessibilityElement(children: .contain)
                    .accessibilityIdentifier("FuelWell Shell Status")
                }

                if isLoading {
                    VStack(spacing: self.theme.spacing.sm) {
                        Image(colorScheme == .dark ? "FuelWellLaunchLogoInverse" : "FuelWellLaunchLogo")
                            .resizable()
                            .scaledToFit()
                            .frame(maxWidth: 220)
                            .accessibilityHidden(true)
                            .padding(.bottom, self.theme.spacing.sm)
                        ProgressView()
                            .controlSize(.large)
                            .tint(self.theme.color.primary.accent.color)
                        Text("Preparing FuelWell")
                            .font(.headline.weight(.bold))
                            .foregroundStyle(self.theme.color.text.primary.color)
                        Text(
                            shellTestMode
                                ? "Opening shell verification."
                                : "Verifying this build and opening your dashboard."
                        )
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
                    .accessibilityValue("Opening the FuelWell app.")
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
        }
        .background(self.theme.color.bg.base.color)
        .task(id: reloadToken) {
            if !shellTestMode {
                await verifyRelease()
            }
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
