/**
 * Centralized locators for Toy Robot page
 * Organized by functional sections/cases
 */

export const TOY_ROBOT_LOCATORS = {
  // Grid and Placement
  placement: {
    cell: (x: number, y: number) => `.cell[data-x="${x}"][data-y="${y}"]`,
    facingSelect: "#facingSelect",
  },

  // Command Buttons
  buttons: {
    move: "#btnMove",
    left: "#btnLeft",
    right: "#btnRight",
    report: "#btnReport",
    run: '#cmdForm button[type="submit"]',
  },

  // Command Input
  commandInput: {
    input: "#cmdInput",
  },

  // Display and Output
  display: {
    stateReadout: "#report",
    logLines: "#log div",
    robotMarker: "#robotLayer .robot",
  },
};
