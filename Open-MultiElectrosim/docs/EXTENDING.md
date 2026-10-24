# Extending the project

The source has no build system and no runtime npm dependencies. Edit the JavaScript ES modules, refresh the browser and run `npm test`.

## A new catalog entry

Add an `add(...)` declaration in `public/js/catalog.js`, with a unique ID, category, existing model kind, numeric default values and an array of named local pin coordinates. Use `model: 'layout-only'` when no electrical model exists. Add a description stating what the model does. Names of actual manufacturer devices must not imply that a generic model captures their specifications.

For a new numerical model, implement its MNA stamps in `engine.js`, include it in reference/floating-net analysis, add a symbol in `symbols.js`, add inspector labels in VALUE_LABELS, and add meaningful tests against known analytical behavior. Provide a documented model boundary. Do not substitute generated animation or arbitrary voltages for a model.

For complex real MCU execution, use a dedicated emulator/toolchain integration with accurate pin/peripheral mapping and reproducible firmware builds. The bundled interpreter is intentionally limited. A Raspberry Pi Linux instance needs a fundamentally different emulator and runtime; it cannot be made correct by adding GPIO labels.

For manufacturing PCB support, use manufacturer footprints and pin-number mappings, a complete connectivity engine, zones/stackups and a native KiCad round-trip check. File presence alone is not proof that a board is fabrication-ready.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | /health | Server health |
| GET | /api/auth/me | Signed-in user or null |
| POST | /api/auth/signup | name, email, password |
| POST | /api/auth/signin | email, password |
| POST | /api/auth/signout | Revoke current session |
| GET | /api/projects | User-owned project summaries |
| POST | /api/projects | Create a project document |
| GET | /api/projects/:id | Fetch the user's document |
| PUT | /api/projects/:id | Replace the user's document |
| DELETE | /api/projects/:id | Delete the user's saved copy |

Accounts are server-local and limited to 500 users / 50 saved projects per user. The server atomically renames a JSON file after updates; it is designed for one process, not multiple replicas. There is a 1 MB request cap. Sign-in/signup are rate-limited together to 20 attempts per IP in 15 minutes. State-changing browser requests check Origin against Host and use SameSite cookies.

Environment overrides: PORT, HOST, OME_DATA_DIR. `.env` is not automatically loaded. Set variables in your shell, or use the `--port` / `--host` flags. Public hosting would require TLS, Secure cookies in a trusted reverse-proxy configuration, durable database storage, stricter input validation, backups, recovery/verification flows and operational monitoring. Those deployment concerns are not configured by this ZIP.

## Project document

`.ome.json` uses `{format:'ome-project', version:1, name, parts, wires, traces, vias, board, settings}`.

Parts have stable IDs, a catalog type, reference, schematic position/rotation, numeric values, firmware and an independent PCB footprint placement. Wires reference `part-id:pin-id`. PCB tracks carry endpoints, physical points, layer, width and a schematic net number; vias can act as endpoints. User-facing imports validate format, identifiers, known types, geometry, size and basic settings. Browser storage holds the active project; account saving is explicit.

If changing the format, introduce a migration instead of silently accepting incompatible versions. Do not store passwords, tokens or server account data inside exported project documents.
