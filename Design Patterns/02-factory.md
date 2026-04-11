# Factory Pattern

**Intent:** Create objects without specifying the exact class. Delegate instantiation to a factory method.

**When to use:** Creating objects based on type/config, database drivers, payment processors, notification channels.

---

## JavaScript
```javascript
class Car { drive() { return "Driving a car"; } }
class Truck { drive() { return "Driving a truck"; } }
class Bike { drive() { return "Riding a bike"; } }

// Factory function
function createVehicle(type) {
  switch (type) {
    case "car": return new Car();
    case "truck": return new Truck();
    case "bike": return new Bike();
    default: throw new Error(`Unknown vehicle: ${type}`);
  }
}

const v = createVehicle("car");
console.log(v.drive()); // "Driving a car"

// Registry-based factory (extensible)
const vehicleRegistry = {};
function register(type, cls) { vehicleRegistry[type] = cls; }
function create(type) { return new vehicleRegistry[type](); }

register("car", Car);
register("truck", Truck);
```

## Python
```python
class Car:
    def drive(self): return "Driving a car"

class Truck:
    def drive(self): return "Driving a truck"

# Factory function
def create_vehicle(vehicle_type: str):
    vehicles = {"car": Car, "truck": Truck}
    cls = vehicles.get(vehicle_type)
    if not cls:
        raise ValueError(f"Unknown: {vehicle_type}")
    return cls()

v = create_vehicle("car")
print(v.drive())  # "Driving a car"
```

## Java
```java
interface Vehicle { String drive(); }
class Car implements Vehicle { public String drive() { return "Driving a car"; } }
class Truck implements Vehicle { public String drive() { return "Driving a truck"; } }

class VehicleFactory {
    public static Vehicle create(String type) {
        return switch (type) {
            case "car" -> new Car();
            case "truck" -> new Truck();
            default -> throw new IllegalArgumentException("Unknown: " + type);
        };
    }
}
```

## Interview Talking Points
- **Simple Factory** vs **Factory Method** vs **Abstract Factory**
- Eliminates `new` keyword scattered through code — single point of creation
- Open/Closed Principle: add new types without modifying existing code (registry pattern)
- Real-world: `document.createElement()`, React's `createElement()`, payment gateways
