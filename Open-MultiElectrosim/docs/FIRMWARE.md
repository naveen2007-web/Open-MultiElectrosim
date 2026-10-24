# GPIO firmware subset

The interpreter executes a small Arduino-style language with circuit-connected GPIO. It is neither C++ nor a machine-code emulator. It does not upload to physical hardware.

## Example

```cpp
int cycles = 0;
void setup() {
  pinMode(2, OUTPUT);
  Serial.begin(115200);
}
void loop() {
  digitalWrite(2, HIGH);
  delay(500);
  digitalWrite(2, LOW);
  delay(500);
  cycles++;
  Serial.println(cycles);
}
```

On Arduino symbols, `2` resolves to D2. On ESP32 and Pico, it resolves to GPIO2. Existing labels such as `A0` are accepted on boards exposing them. The symbols are LOGICAL GPIO maps, not physical connector pinouts. ESP32 family package/flash reservations and alternate functions differ by actual board; verify the official pinout before moving a design to hardware. Classic ESP32 GPIO34/35/36/39 are blocked as outputs. Other variant restrictions are not fully modeled.

## Syntax

- Optional top-level variable declarations. `int`, `float`, `double`, `long`, `bool`, `unsigned` and `const` are accepted as declaration keywords, but all numeric values use JavaScript double precision. Const is not enforced; C/C++ overflow and integer division semantics do not apply.
- One `void setup()` (optional) and one `void loop()` (required).
- Assignments `n = expression;`, `n++;`, `n--;`.
- Blocks, `if / else`, and `while`.
- `+ - * / %`, comparisons, `&& || !`, parentheses, numeric literals, string literals and variables.
- No for loops, arrays, pointers, structs, classes, casts, user-defined functions, include files, libraries, interrupts or arbitrary code execution.
- Compile validates syntax and known API calls. Some errors (unknown variable, wrong pin, invalid pin mode) are detected on execution.

## APIs

| API | Model |
| --- | --- |
| `pinMode(pin, OUTPUT/INPUT/INPUT_PULLUP)` | Set pin mode. INPUT_PULLUP uses a 30 kΩ pull-up. |
| `digitalWrite(pin, HIGH/LOW)` | Requires OUTPUT. A 25 Ω source drives configured board high voltage or zero. |
| `digitalRead(pin)` | Reads the last solved pin voltage against half of board logic voltage. |
| `analogWrite(pin, 0..255)` | Averaged output voltage, not a switching PWM waveform. |
| `analogRead(pin)` | Ideal clamped 10-bit conversion across configured logic voltage. Not a real chip ADC model. |
| `delay(milliseconds)` | Suspend until simulation time reaches deadline. |
| `delayMicroseconds(microseconds)` | Same, with microsecond argument; resolution remains the configured timestep. |
| `millis()`, `micros()` | Integer simulated time. |
| `Serial.begin(rate)` | Accepted; no physical UART timing model. |
| `Serial.println(value)` | Keeps the most recent 100 lines; editor's Serial output shows recent lines. |

Constants: HIGH, LOW, OUTPUT, INPUT, INPUT_PULLUP, LED_BUILTIN, and A0…A15 labels (only exposed pins can be used). LED_BUILTIN defaults to 13 on Arduino / Pico and 2 on ESP symbols; this is a convenience mapping, not a promise about each hardware board.

Execution runs at the beginning of a solver step, with reads from the prior solved circuit state. Outputs then feed the current step's matrix. Power pins must be wired to enable electrical outputs; the VM clock itself is not power-gated or reset by supply loss. GPIO thresholds, input sampling, ADC scaling and PWM are intentionally generic.

An execution slice has a **2,000 instruction** budget. Repeating loops must yield with delay; otherwise execution stops with a diagnostic. Firmware files are limited to 20,000 characters. Timestep quantization rounds wakeups to the next solver step. No radio, Bluetooth, Wi-Fi, SPI/I2C/1-Wire protocol, DHT/OLED library or operating system is emulated.
