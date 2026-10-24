# Open MultiElectrosim

An independent, local electronics workbench for learning circuit behavior, editing schematics, routing a two-layer PCB and inspecting a live 3D board.

**This is a runnable first release with documented model boundaries. It is not a complete replacement for Proteus, Wokwi, SPICE or KiCad. It does not include every electronic component or execute arbitrary ESP32 / Arduino firmware or Raspberry Pi Linux.** The catalog and inspector distinguish supported electrical models, a GPIO firmware subset and layout-only modules. Unsupported devices never pretend to produce accurate data.

## Start on Windows

1. Install Node.js **20 or newer** if it is not already installed. Check with `node -v` in a terminal. A current Node.js LTS release is preferable.
2. Extract this ZIP using **Extract All**. Do not run files from inside the ZIP preview.
3. Open the extracted `Open-MultiElectrosim` folder.
4. Double-click `start-windows.cmd`. Keep that terminal window open.
5. Open **http://localhost:3000** in Chrome or Edge.

Alternatively, open the folder in VS Code, open **Terminal → New Terminal**, and run:

```sh
npm start
```

There are **no npm dependencies**, no API keys, no external fonts, no CDNs and no build step. `npm install` is not needed. The app works without an Internet connection after Node.js is installed.

On macOS/Linux: `sh start-mac-linux.sh`, or `npm start`.

If port 3000 is occupied:

```sh
node server.js --port 3001
```

Then open http://localhost:3001. This also changes the browser storage origin, so export a project before switching ports. Stop the server with **Ctrl+C**.

## What is included

- **114 searchable catalog entries**, with symbols, names, editable values, category filtering and favorites.
- DC, sine, square and triangle voltage sources; current source; SPST/SPDT switches.
- Metal/carbon/power and variable resistors; three-terminal potentiometer; ceramic, film, electrolytic, tantalum, bipolar, variable and supercapacitor variants; inductors.
- Diodes, LEDs, Zener, NPN/PNP transistors, N/P MOSFETs, behavioral op-amps, comparator and SPDT relay.
- AND/OR/NOT/NAND/NOR/XOR/XNOR/buffer, mux, flip-flop, counter, 555 latch model, logic input and clock.
- Arduino Uno/Nano/Mega/Leonardo/Uno R4, ESP32/C3/S2/S3/C6/H2, ESP8266 and Pico GPIO symbols; Raspberry Pi computer placeholders.
- Sensor transfer/timing models and explicitly labeled layout-only protocol modules.
- Differential voltage and current probes with recorded waveform plots, window RMS, peak-to-peak and CSV export.
- Manual wire bend placement and color palette. Crossings are not connections; join at a pin.
- Undo/redo, duplicate, rotate left/right, delete, favorites, clear-all with undo, keyboard shortcuts, pan, fit and zoom.
- Two-layer PCB editor with movable/rotatable generic footprints, same-net routing, track width, layer selection, vias, ratsnest and basic DRC.
- Live orbitable 3D geometry with FR4 board thickness, copper, holes, generic bodies, leads, labels and mounting holes.
- KiCad board, partial Gerber/drill, SPICE primitive netlist, SVG, BOM and project JSON exports.
- Dark/light themes, browser autosave, account signup/signin/logout and per-account named projects on this local server.
- Six starter circuits and automated numerical / account tests.

## First circuit

1. Open the default **RC low-pass filter** example and click **Run simulation**.
2. CH1 shows filtered output; CH2 shows the source. Samples and measurements come from the solver.
3. Pause. Click the body of R1, enter `2k` in Resistance, and click **Apply properties**. Values also accept `100n`, `4.7u`, `1m` and scientific notation. `M` means mega; `m` means milli. Enter capacitance in F and inductance in H.
4. Run again. Compare the new output with the source.
5. Open **Examples → Voltage divider**, run it and inspect its output probe. The 10 V / equal 1 kΩ circuit produces approximately 5 V.

## Place, connect and edit

- Click a library component, then click the workspace to place it. Press R while placing to rotate it.
- Click a **pin** to start a wire. Click empty space to add bends. Click the destination pin to finish. Press X or Left/Right to change the bend direction. Backspace removes the last bend; Esc cancels.
- Wires visually crossing each other do not connect. Multiple wires ending at the same pin share a node.
- Click a body to inspect it; drag to move it. Click a wire to select its color or remove its intermediate bends.
- Apply properties after changing numeric values. Reconfiguring the circuit resets simulation state; run it again to obtain updated results.
- Double-click a logic input / switch / digital detection sensor body to toggle its state.
- The two terminals on a source or probe are `1` = positive and `2` = negative. Source current is positive from terminal 1 to 2; delivering sources usually display negative branch current. Meter voltage is V(1) − V(2).
- Add **Ground / reference** to every simulated circuit.

## PCB and 3D

1. Switch to **PCB layout**. Component footprints share the schematic's netlist. Measurement probes and ground symbols have no PCB footprints. External generators / supplies use generic two-pin connection footprints.
2. Drag footprint outlines to position parts. Use inspector X/Y (mm) or rotation buttons for exact positioning. Endpoint coordinates follow a moved footprint, while intermediate route bends stay in place. Reroute as needed and run DRC.
3. Click a pad to start a track. Add manual bends and finish at a pad on the **same schematic net**.
4. Choose F.Cu or B.Cu before routing. Press **V** while routing to insert a plated via and continue on the other layer.
5. Run **DRC** for clearance, width, board-edge, detached endpoints and unrouted connections. The check reports unimplemented manufacturing constraints in its description; it is not an industrial sign-off.
6. Switch to **3D viewer**. Drag to orbit; scroll to zoom. This view is regenerated from actual project placement and front-layer copper, not a static image. It uses generic orthographic 3D bodies, not photorealistic manufacturer STEP models.
7. **Export → KiCad board** creates a self-contained `.kicad_pcb` using generic through-hole footprints. Confirm it in KiCad before further fabrication work.

The board's editable width/height include a 2.4 mm margin on every side. Thus the default outline is **105.2 × 67.2 mm**. PCB workspace coordinates use 10 internal units per millimeter. Pads use 0.8 mm holes; vias use 0.6 mm holes. These dimensions are generic, not official footprints for the named modules.

**Fabrication limits:** Board export has no custom outline editing, 3D STEP export, copper zones, differential routing, impedance control, arbitrary footprint libraries, connectivity at unanchored track crossings or complete Gerber manufacturing job. Gerber files contain selected copper only; drill files contain component/via holes and the four 2 mm mounting holes. Mounting holes are also included as non-plated holes in the KiCad board. Review and replace footprints, check mounting clearances, run KiCad's native DRC and generate a complete manufacturing job there. KiCad export syntax has structural tests, but could not be opened in an installed KiCad binary in this environment.

## Accounts and saving

- **http://localhost:3000/signup** creates an account on this local server.
- **http://localhost:3000/signin** signs into that account.
- Click the account name to open saved projects or **Log out**.
- Signed-in **Save project** stores the current project under that account. Repeated saves update the currently opened account project. Starter/imported projects start a new saved project.
- As a guest, **Save project** downloads a complete `.ome.json` file.
- The current workspace also autosaves in this browser. Explicitly export projects for backups and transfers. Account switching does not clear browser-local guest work.
- Accounts and server projects live in `data/accounts.json` (created on first account write). Back up the entire `data` folder. Passwords are salted and hashed with scrypt; sessions use HttpOnly SameSite cookies. Logging out revokes the current session; restarting the server requires signing in again.
- There is no email delivery, email verification, password recovery, cloud synchronization or public hosting included. This is a local development server, not a hardened multi-user Internet service.

## Simulation fidelity and scope

Read **docs/MODELS.md**, or open **Model coverage** in the app. Browser solver capacity is 150 placed parts and 250 electrical nodes; unused MCU pins currently count toward node capacity. Large Mega/ESP symbols consume more nodes and may be slow in a dense solver.

The numerical core uses modified nodal analysis and backward-Euler transient integration. RLC tests compare to closed-form circuit results, but device models are simplified. Semiconductor frequency response, tolerance, realistic noise, thermal effects, overload damage, radiation, radio, operating systems and full MCU peripheral/CPU behavior are outside scope. Results are only as accurate as the selected model and timestep.

Choose a timestep at least 30 times smaller than the fastest source period; use much smaller steps for narrow pulses. Reduce the timestep and check convergence when studying transients. For nonlinear feedback that does not settle, the app reports an error instead of producing guessed output. Waveforms advance in simulated time, not necessarily real time.

## Firmware

Use **Examples → Arduino firmware**. Select U1 and click **Edit GPIO firmware**. The safe interpreter runs a documented subset of `setup()` / `loop()`; it does not use JavaScript eval. Connect board VCC and GND. Inputs come from solved circuit voltages; output drivers participate in the actual circuit model.

See **docs/FIRMWARE.md** for supported syntax, timing, API and limitations. No .hex/.elf loading, compiler toolchain or real CPU emulation is included.

## Tests

```sh
npm test
```

Tests use Node's built-in runner, including account operations against a temporary isolated data directory. See **docs/VALIDATION.md** for coverage and verification limits.

## Project structure

- `server.js` — dependency-free static server, authentication, sessions, private project API.
- `public/index.html`, `public/style.css`, `public/icon.svg` — accessible app shell and theme.
- `public/js/app.js` — editor, pointer/keyboard interactions, inspector, waveforms, saves and dialogs.
- `public/js/catalog.js`, `symbols.js` — device registry, editable defaults, symbols and pin geometry.
- `public/js/engine.js` — nets, matrix solver, electrical models and SPICE export.
- `public/js/firmware.js` — bounded parser/interpreter.
- `public/js/pcb.js` — footprint geometry, PCB rendering, DRC and exports.
- `public/js/view3d.js` — interactive projected 3D geometry.
- `public/js/examples.js`, `examples/` — starter project builders and importable files.
- `test/` — numerical, logic, firmware, PCB/export and authentication tests.
- `docs/` — model formulas, firmware guide, shortcuts, validation and extension notes.
- `start-windows.cmd`, `start-mac-linux.sh` — launch helpers.

Open MultiElectrosim is independent and is not affiliated with Arduino, Espressif, Raspberry Pi or KiCad. Manufacturer names identify familiar families, not certification or full device compatibility.
