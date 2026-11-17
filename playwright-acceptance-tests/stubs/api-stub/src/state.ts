import type { StubbedApiResponses } from "./stubbed-api-responses.js";

export interface State {
  stubbedApiResponses: StubbedApiResponses;
}

export const state: State = createFreshState();

function createFreshState(): State {
  return {
    stubbedApiResponses: {},
  };
}

export function resetState(): void {
  Object.assign(state, createFreshState());
}
