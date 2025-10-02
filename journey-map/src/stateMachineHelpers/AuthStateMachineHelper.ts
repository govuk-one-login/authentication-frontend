import {
  AuthStateContext,
  AuthStateMachine,
  authStateMachine,
} from "../../../src/components/common/state-machine/state-machine.js";
import type { AnyEventObject, StateNode, TransitionDefinition } from "xstate";
import StateMachineHelper from "./StateMachineHelper.js";
import { pages } from "../../../src/components/templates/pages.js";
import { State, StateMachineConfig, Transition } from "../index.js";

export interface Options {
  includeOptional: boolean;
  context?: AuthStateContext;
}

const openPageIfExists = (name: string) => {
  if (pages[name]) {
    return () => {
      const variant = Array.isArray(pages[name]) ? pages[name][0].name : "";
      window.open(
        `/templates${name}?lng=en&pageVariant=${encodeURIComponent(variant)}`,
        "_blank"
      );
    };
  }
};

export default class AuthStateMachineHelper extends StateMachineHelper {
  private readonly formElement: HTMLFormElement;
  constructor(formElement: HTMLFormElement) {
    super();
    this.formElement = formElement;
  }

  getReachableStatesAndTransitions(): StateMachineConfig {
    const stateMachine = authStateMachine;
    const xStates = [...stateMachine.initialStateNodes];

    const states: State[] = [];
    const transitions: Transition[] = [];

    for (const state of xStates) {
      // Record this state
      states.push({
        name: state.key,
        id: state.id,
        onClick: openPageIfExists(state.key),
      });

      // Find transitions from this state
      const activeTransitions = this.getTransitions(
        stateMachine,
        state,
        this.parseOptions(new FormData(this.formElement))
      );
      transitions.push(...activeTransitions);

      // Add target states to the list of states to traverse
      activeTransitions.forEach((transition) => {
        if (stateMachine.stateIds.includes(transition.target)) {
          if (!xStates.some((state) => state.id === transition.target)) {
            xStates.push(stateMachine.getStateNodeById(transition.target));
          }
        } else {
          const targetStateName = transition.target.substring(
            stateMachine.id.length + 1
          );
          states.push({
            name: targetStateName,
            id: transition.target,
            onClick: openPageIfExists(targetStateName),
          });
        }
      });
    }

    return { states, transitions };
  }

  private parseOptions(formData: FormData): Options {
    return {
      includeOptional: formData
        .getAll("otherOption")
        .includes("includeOptional"),
      context: this.parseContext(formData),
    };
  }

  private parseContext(formData: FormData): AuthStateContext | undefined {
    if (formData.getAll("otherOption").includes("overrideContext")) {
      try {
        return JSON.parse(formData.get("context") as string);
      } catch (err) {
        console.warn(err);
      }
    }
  }

  private getTransitions(
    stateMachine: AuthStateMachine,
    state: StateNode,
    options: Options
  ): Transition[] {
    const transitions: Transition[] = [];

    if (options.context) {
      // Only show applicable transitions
      state.events.forEach((event) => {
        const { value } = stateMachine.transition(
          state.key,
          event,
          options.context
        );
        transitions.push({
          source: state.id,
          target: `${stateMachine.id}.${value}`,
          event: event,
        });
      });
    } else {
      // Show all transitions
      state.transitions.forEach((transition) =>
        transitions.push({
          source: state.id,
          target: this.getSingleTransitionTarget(transition),
          event: transition.eventType,
          condition: transition.cond?.name ?? undefined,
        })
      );
    }

    if (options.includeOptional) {
      // Add optional transitions
      state.meta?.optionalPaths?.forEach((target: string) => {
        const targetId = `${stateMachine.id}.${target}`;
        transitions.push({
          source: state.id,
          target: targetId,
          optional: true,
        });
      });
    }

    return transitions;
  }

  private getSingleTransitionTarget(
    transition: TransitionDefinition<AuthStateContext, AnyEventObject>
  ): string {
    if (!transition.target?.length) {
      throw new Error(
        `Transition from ${transition.source.id} missing a target`
      );
    }
    if (transition.target.length > 1) {
      throw new Error(
        `Transition from ${transition.source.id} has multiple targets`
      );
    }
    return transition.target[0].id;
  }
}
