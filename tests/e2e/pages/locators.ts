/**
 * Centralized locators for Toy Robot page
 * Organized by functional sections/cases
 */

export const TOY_ROBOT_LOCATORS = {
  // Grid and Placement
  placement: {
    grid: ".grid",
    cell: (x: number, y: number) => `.cell[data-x="${x}"][data-y="${y}"]`,
    facingSelect: "#facingSelect",
    pendingCoord: "#pendingCoord",
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
    form: "#cmdForm",
  },

  // Display and Output
  display: {
    stateReadout: "#report",
    log: "#log",
    logLines: "#log div",
  },

  // Compass Navigation
  compass: {
    container: ".compass",
    north: ".compass-north",
    south: ".compass-south",
    east: ".compass-east",
    west: ".compass-west",
  },

  // Header and Title
  header: {
    title: "h1",
    description: "p",
  },
};

export type LocatorSection = keyof typeof TOY_ROBOT_LOCATORS;
