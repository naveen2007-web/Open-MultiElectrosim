# Validation report

Release: 1.0.0. Validation date: 24 October 2026.

## Automated suite

Run `npm test`. The final suite contains **29 tests**, using Node's built-in test runner and no third-party packages.

- Five analog/digital/firmware starter circuits solve without non-finite voltages; a sixth routed-board starter has a separate electrical and PCB test.
- A 10 V equal-resistor divider matches 5 V within 1 µV and the expected 5 mA branch current.
- An RC step at one time constant matches 5(1−e^-1) within 3 mV for Δt=1 µs.
- Steady-state RC sine gain is within 1% of 1/sqrt(1+(2πfRC)^2) at the tested timestep.
- Eight gate truth tables, a 20-stage same-step combinational chain and an oscillating-loop diagnostic.
- Missing-ground and conflicting ideal-source errors.
- Piecewise-linear LED series current and finite-gain op-amp follower voltage.
- Firmware timing, globals, if/else, circuit input reads, unsupported syntax/API rejection, classic ESP32 input-only output rejection and actual LED circuit output from GPIO.
- Powered LM35 transfer voltage.
- Unique catalog/device-pin identifiers and SI-prefix parsing.
- SPICE export rejects unsupported devices rather than silently dropping them.
- PCB trace-crossing detection and successful same-net connectivity.
- BJT cutoff/active/saturation behavior and first-step D flip-flop rising-edge capture.
- Explicit invalid-value rejection and floating-network diagnostics.
- Routed LED PCB has zero issues under the implemented DRC checks.
- Exported KiCad is a single balanced s-expression with defined pad/segment nets, expected footprints and segments.
- Gerber 4.6 coordinate units match the actual pad geometry; Excellon includes corresponding component and mounting-hole coordinates.
- A live temporary server verifies signup, duplicate-account rejection, login/wrong-password behavior, account project isolation, create/read/update/list, logout invalidation, Origin checking and both signin/signup URL pages.

These are tests of the implemented models and formats, not exhaustive hardware-model certification.

## Browser checks performed

The app was opened in a Chromium browser through the local preview service. The following behaviors were exercised and visibly verified:

- Initial workbench rendering and simulation-generated waveforms / live measurements.
- Inspector selection, SI-prefixed resistance application and schematic label updates.
- Rotate, duplicate, undo, placement and component search.
- Manually bent PCB routing and DRC warnings; complete routed starter reports no implemented DRC issues.
- Switching between schematic, PCB and actual rendered 3D geometry.
- Clear-all removes components/tracks from both schematic and PCB; undo restores the project.
- Dark/light theme rendering.

Account functionality was tested against the real server API with disposable test accounts in an isolated temporary directory. No personal user account, password or preloaded account database is included.

## Limits of verification

- Node.js v24 was used for automated verification; the code targets Node.js 20+, but it was not run on the user's actual Windows laptop.
- KiCad is not installed in the verification environment. Its native importer and DRC were not run. Board exports have structural tests and should be reviewed in KiCad before manufacturing.
- Gerber/Excellon exports have coordinate/syntax-level checks; an external CAM viewer and fabricator workflow were not exercised.
- No manufacturer firmware toolchains, ESP/AVR/RP instruction-set emulators, Linux instances, real sensors or physical boards were run.
- Numerical accuracy was validated for the listed examples. Full nonlinear stability, all parameter extremes and all possible circuits have not been verified.
- Mobile usability has responsive CSS, but the primary editor is designed for a mouse/keyboard desktop and was verified at a desktop viewport.
