# Manual Test Cases — Toy Robot Simulator

Test cases for `web/index.html`, written independently of the automated
suite as a QA test-design exercise. Most are also automated (see the
"Automated" column, referencing `tests/e2e/specs/toy-robot.spec.ts`); a few
at the end are manual/exploratory-only — a deliberate choice, not a gap
(noted under each).

| ID | Scenario | Steps | Expected Result | Technique | Automated? |
|----|----------|-------|------------------|-----------|------------|
| TC-01 | Place the robot by clicking a cell | 1. Open the app. 2. Select facing NORTH. 3. Click cell (2,2). | Robot marker appears at (2,2) facing NORTH; status panel reads `2,2,NORTH`. | Happy path | Yes — test 0 |
| TC-02 | Official example A | Type `PLACE 0,0,NORTH`, `MOVE`, `REPORT`. | Log's last line reads `0,1,NORTH`. | Acceptance | Yes — test 1 |
| TC-03 | Official example B | Type `PLACE 0,0,NORTH`, `LEFT`, `REPORT`. | Log's last line reads `0,0,WEST`. | Acceptance | Yes — test 1 |
| TC-04 | Official example C | Type `PLACE 1,2,EAST`, `MOVE`, `MOVE`, `LEFT`, `MOVE`, `REPORT`. | Log's last line reads `3,3,NORTH`. | Acceptance | Yes — test 1 |
| TC-05 | `MOVE` blocked at the north edge | Place at (4,4) facing NORTH. Click MOVE. | Position stays `4,4,NORTH`; log shows `(ignored)`. | Boundary | Yes — test 2 |
| TC-06 | `MOVE` blocked at the east edge | Place at (4,4) facing EAST. Click MOVE. | Position stays `4,4,EAST`; log shows `(ignored)`. | Boundary | Yes — test 2 |
| TC-07 | `MOVE` blocked at the south edge | Place at (0,0) facing SOUTH. Click MOVE. | Position stays `0,0,SOUTH`; log shows `(ignored)`. | Boundary | Yes — test 2 |
| TC-08 | `MOVE` blocked at the west edge | Place at (0,0) facing WEST. Click MOVE. | Position stays `0,0,WEST`; log shows `(ignored)`. | Boundary | Yes — test 2 |
| TC-09 | `LEFT` rotates without moving | Place at (2,2) facing NORTH. Click LEFT. | Position stays `2,2`; facing becomes WEST. | State transition | Yes — test 3 |
| TC-10 | `RIGHT` rotates without moving | From TC-09's state (`2,2,WEST`), click RIGHT twice. | Position stays `2,2`; facing ends at EAST. | State transition | Yes — test 3 |
| TC-11 | `MOVE` before any `PLACE` is ignored | On a fresh load (no `PLACE` yet), click MOVE. | Status stays `(not placed yet)`; log shows `(ignored)`. | Negative | Yes — test 4 |
| TC-12 | `REPORT` before any `PLACE` is ignored | On a fresh load, type `REPORT`. | Status stays `(not placed yet)`; log shows `(ignored)`. | Negative | Yes — test 4 |
| TC-13 | Malformed command is ignored | After placing the robot, type `JUMP`. | Log shows `(ignored)`; position unchanged. | Negative | Yes — test 4 |
| TC-14 | Out-of-bounds `PLACE` is ignored | After placing at (1,1), type `PLACE 9,9,NORTH`. | Log shows `(ignored)`; position stays `1,1,NORTH`. | Negative / boundary | Yes — test 4 |
| TC-15 | `PLACE` with an invalid direction is ignored | After placing at (1,1), type `PLACE 2,2,UP`. | Log shows `(ignored)`; position stays `1,1,NORTH`. | Negative | Yes — test 4 |
| TC-16 | Typed commands are case-insensitive | Place at (1,1) facing NORTH. Type `move`, then `report`. | Robot still moves; `REPORT` still works despite lowercase input. | Equivalence | Yes — test 5 |
| TC-17 | Robot icon visually matches its facing | Place the robot, then cycle `LEFT` through all four directions. | The icon visibly rotates so its "front" (antenna) points NORTH/EAST/SOUTH/WEST correctly each time. | Exploratory / visual | No — visual correctness isn't asserted by the DOM-state checks above; would need pixel/snapshot testing, not worth the maintenance cost for a kata this size. |
| TC-18 | App is usable in both light and dark OS theme | Toggle the OS/browser color scheme. Reload the app. | Colors invert appropriately (`prefers-color-scheme` in `web/index.html`); text stays readable, no unstyled flash. | Exploratory / visual | No — theming has no behavioral effect to assert against; checked manually. |
| TC-19 | Layout stays usable on a narrow viewport | Resize the browser below ~720px wide. | The grid and control panel stack into a single column instead of overlapping or clipping. | Exploratory / responsive | No — same reasoning as TC-18; a layout/CSS concern, not a robot-logic one. |

## Notes

- TC-02–TC-04 exercise a fresh `PLACE` mid-scenario (each example starts with
  its own `PLACE`), which also implicitly verifies re-placing an already
  placed robot works correctly.
- TC-14 and TC-15 both target `PLACE` validation but for different reasons
  (out of bounds vs. not a real direction) — kept as separate cases since a
  single failure should point at exactly one broken rule.
- TC-17–TC-19 are intentionally left manual/exploratory: automating visual
  and layout checks for a project this size would add more maintenance
  burden than value. Documenting *why* they're manual is itself the point —
  not every test case needs to be automated to be a good test case.
