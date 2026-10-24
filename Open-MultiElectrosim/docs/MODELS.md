# Electrical models and numerical boundaries

This file describes what the implementation computes. Named parts sharing a model are illustrative generic devices, not characterized manufacturer SPICE models. There are 114 catalog entries, of which layout-only modules have no electrical output. No finite registry can contain all component types or values.

## Numerical core

Connections use pin-to-pin union-find nets. All ground symbols share node 0. Modified nodal analysis solves node voltages and ideal source branch currents by pivoted Gaussian elimination. Each nominal timestep performs up to 80 fixed-point iterations, stopping when the largest node-voltage change is below 1e-7 V. Failing to converge produces an explicit diagnostic. The dense solver supports up to 250 nodes.

A 1 TΩ numerical leakage ties every nonreference node to zero. Connected nets without an identified electrical reference produce a warning: their absolute voltages depend on this leakage. The topology check is conservative, particularly for switches, sequential devices and MCU input pins; it is not a complete singularity analysis.

The transient integrator is backward Euler. It is stable for simple passive networks but numerically damps oscillations and has timestep-dependent phase/amplitude error. It is not an adaptive SPICE integrator. Use smaller timesteps and compare results before assuming accuracy. There is no automatic operating-point initialization: capacitors start at their configured initial voltage and inductors start with zero current. An explicit `step(dt, {dc:true})` is available at engine level; the GUI currently exposes transient operation only.

## Sources and passives

- Resistor: I = (V1 − V2) / R. Numerical minimum R is 1 µΩ. Rated power and tolerance are metadata only.
- Capacitor: conductance C/Δt and history source; I_n = C(V_n − V_(n−1))/Δt. Polarization changes the symbol, not the equation; reverse-bias damage is not modeled.
- Inductor: I_n = (L I_(n−1) + Δt V_n)/(L + Δt R_series). No core saturation, mutual coupling or winding capacitance.
- Potentiometer: two resistive segments meeting at W. Position 0 connects W toward terminal 1; position 1 toward terminal 2. Minimum segment resistance 1 mΩ.
- Voltage sources: V1 − V2 equals the configured voltage. Sine is offset + amplitude × sin(2πft + phase). Square switches from offset to offset+amplitude with configurable duty. Triangle spans offset−amplitude to offset+amplitude.
- Current source: positive current flows from terminal 1 to 2.
- Switch: finite configured on resistance / 10 GΩ off resistance. Push button uses the same latched simulation state; no spring-return mouse interaction or contact bounce.
- SPDT: selected contact uses a 0.01 Ω connection.
- Fuse and lamp: fixed resistance only. Ratings do not trip the fuse or create a thermal filament response.

## Semiconductors and ICs

- Diode/LED: piecewise I=(V−Vf)/Ron when forward conducting; 10 GΩ reverse/off leakage. No exponential junction law, capacitance, avalanche unless Zener, recovery or power limit.
- Zener: adds reverse conduction below −Vz, with configured on resistance.
- NPN/PNP: piecewise base-emitter knee with 1 kΩ incremental base resistance, configurable beta and collector saturation around 0.1 V. A linearized controlled source represents active-region collector current; saturation switches to a finite conductance. This is a teaching model and omits Early effect, capacitance and high-frequency behavior.
- N/P MOSFET: drain-source conductance = factor × max(0, signed Vgs − Vth), plus leakage. It is an adjustable voltage-controlled conductance, without a body diode, full square-law saturation region or gate capacitance. The UI's factor is used as conductance-per-overdrive (A/V²).
- Op-amp: finite gain VCVS with upper/lower rail clipping, ideal inputs and ideal zero output impedance. It has no explicit supply pins, bandwidth, slew, bias or common-mode constraints. LM358/LM741/TL072 names select this same simplified model.
- Comparator: output through 1 Ω equals the high or low rail based on input order. No open-collector mode or hysteresis.
- Relay: a resistive coil and ideal SPDT pickup based on absolute coil voltage. Contact resistance is configurable. Coil inductance, flyback and hysteresis are not modeled.
- Logic: all eight gates plus 2:1 mux settle through fixed-point iteration within a timestep. Output drivers have 10 Ω impedance and configured high voltage. Gates have no propagation delay. Different driver voltages on the same net produce intermediate voltages; there is no full digital contention/X/Z model.
- D flip-flop and counter: ideal rising-edge sampled behavior. Edge calculations use converged same-step clock/data, with state committed once per timestep. No setup/hold metastability or physical packaged pinout.
- 555: trigger/threshold/reset latch with 1/3 and 2/3 high-rail thresholds and a finite discharge switch. There are no supply pins; the configurable high field sets the supply reference. It is not an exact NE555 silicon model.

## Sensors

| Device | Calculation | Limits |
| --- | --- | --- |
| LDR | R = R_at_10lux × (max(lux,0.001)/10)^−gamma | Generic empirical transfer; no manufacturer calibration or spectrum. |
| NTC | R = R25 × exp(beta × (1/T_K − 1/298.15)) | Ideal beta law, fixed coefficients, no self-heating. |
| PTC | R = R25 × (1 + alpha × (T_C − 25)) | Linear approximation, resistance clamped to ≥1 Ω. |
| LM35 | Vout = 0.010 × T_C | Enabled for supply ≥4 V. Output clamped to 0..supply; negative-temperature support circuits omitted. |
| TMP36 | Vout = 0.500 + 0.010 × T_C | Enabled for supply ≥2.7 V. Output clamped to 0..supply. |
| HC-SR04 | After a ≥10 µs trigger and 200 µs modeled latency, echo duration = 2 × distance_m / 343 | User supplies distance; no acoustic field. Requires adequate timestep. High output is 5 V with supply >3 V. |
| PIR/Hall/IR/reed/tilt | Powered, user-set digital detection | Logic result only; underlying optics, field and mechanical environment omitted. |
| DHT, BME/BMP, MPU, INA219, MAX30102, DS18B20, MQ, pH, HX711, GPS, OLED, LCD | No electrical/protocol output | Layout-only, explicitly labeled. |

Sensor properties describe a user-defined environment. They do not read physical sensors, camera data or the computer's environment. Nominal transfer functions do not imply full datasheet accuracy, loading, valid-range checks or startup behavior.

## Instruments and waveforms

Voltmeter/scope are ideal differential high-impedance probes. Ammeter is an ideal 0 V series source and reads its solved branch current. Up to four instruments are plotted; at most 5,000 recent samples are retained. RMS and peak-to-peak use the visible sample window of the first channel. Samples are timestep-quantized; there is no anti-aliasing, trigger subsystem or automated spectrum/phase response measurement. A logic analyzer probe currently plots voltage, not decoded digital protocols. Frequency, cursor and AC Bode analysis can be added as future modules.

## Firmware

See FIRMWARE.md. Arduino, ESP32 and Pico symbols use logical GPIO with a safe subset interpreter. No compiled machine-code execution or complete boards are emulated. Raspberry Pi computers are layout-only. The board catalog is representative, not exhaustive.

## PCB boundaries

Generic through-hole geometry, configurable two-layer copper tracks, plated vias, rectangular outline and mounting holes. DRC covers track widths, edge clearance, copper pair clearances, via/pad collisions, mounting-hole clearance, detached endpoints and unrouted pads. Connectivity uses anchored trace endpoints; branches and crossings without a pad/via anchor are not a complete geometric connectivity graph. It does not check annular rings, drill tables, silkscreen collision, courtyard collision, creepage, impedance, differential pairs, manufacturing limits, copper pours or stackup.

KiCad export is generated from the shared netlist and physical footprints; ground symbols and measuring instruments are omitted from the board. The export is generic, not a manufacturer footprint library. CPU pins use logical labels. Replace them with real physical module footprints for manufacturing.

3D is actual projected geometry with orbit/zoom, no external libraries. It uses an orthographic camera, generic bodies and front copper. It does not render a complete back-side assembly, vendor STEP models, ray tracing or export STEP. Components and connections stay linked to the 2D project.

## Primary reference links

- [Arduino Uno R3 documentation](https://docs.arduino.cc/hardware/uno-rev3/)
- [Espressif ESP32 GPIO documentation](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/gpio.html)
- [Raspberry Pi hardware / GPIO documentation](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)
- [TI LM35 datasheet](https://www.ti.com/lit/ds/symlink/lm35.pdf)
- [Analog Devices TMP35/TMP36/TMP37 datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/TMP35_36_37.pdf)
- [KiCad board s-expression format](https://dev-docs.kicad.org/en/file-formats/sexpr-pcb/)

These references help distinguish actual devices and file formats from the simplified models above. Reading them does not certify the simulator or turn logical GPIO symbols into physical pinouts.
