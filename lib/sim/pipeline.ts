// Pipeline orchestration lives inside FluidSimulator.step().
// This module exports the types/helpers that Agent 5 & 6 need
// when feeding splats and obstacles into the simulator.

export type { SplatData, SimOptions } from "./simulator";
export { FluidSimulator } from "./simulator";
