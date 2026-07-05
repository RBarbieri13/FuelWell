import Networking
import Testing

@Test
func retryingClientCanBeConstructed() {
    let client = RetryingAPIClient(base: LiveAPIClient(), maxAttempts: 1)

    #expect(client is RetryingAPIClient)
}
