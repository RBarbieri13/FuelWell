import AnthropicClient
import Testing

@Test
func previewClientReturnsDeterministicText() async throws {
    let response = try await AnthropicClient.previewValue.complete(
        AnthropicRequest(prompt: "Build me a recovery dinner.")
    )

    #expect(response.text.contains("Build me a recovery dinner."))
}

@Test
func testClientFailsLoudly() async {
    await #expect(throws: AnthropicClientError.unimplemented) {
        _ = try await AnthropicClient.testValue.complete(AnthropicRequest(prompt: "No network"))
    }
}
