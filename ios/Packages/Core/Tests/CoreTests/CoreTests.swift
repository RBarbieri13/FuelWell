import Core
import Testing

@Test
func fuelWellIDIsHashable() {
    let identifier = FuelWellID()

    #expect(identifier == identifier)
}
