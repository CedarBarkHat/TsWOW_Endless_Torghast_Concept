/**
 * passive_allocation.ts — Phase 1 skeleton (livescript)
 * -----------------------------------------------------
 * Runtime logic for spending passive points and allocating tree nodes.
 * See DESIGN_SPEC.md "Passive Tree Architecture" + "Character Progression Loop".
 *
 * Responsibilities:
 *   - Grant 1 passive point per floor (floors 1–300).
 *   - Validate + apply an allocation request (adjacency, points, keystone rules).
 *   - Persist per-character allocation state.
 *
 * Stat effects of allocated nodes are applied by stat_application.ts. This file
 * only manages WHICH nodes are allocated. STRUCTURE ONLY — DB access stubbed.
 */

import type {
  PassiveTree,
  CharacterTreeState,
} from '../datascripts/passive_tree';
import { canAllocate } from '../datascripts/passive_tree';

/** Result of an allocation attempt. */
export interface AllocateResult {
  ok: boolean;
  reason?: string;
  state?: CharacterTreeState;
}

/** Floors 1–300 grant points; after that the tree is full (see spec). */
export const MAX_POINT_FLOOR = 300;

/**
 * Award the per-floor passive point. Called when a character clears a floor.
 * TODO(phase6): hook this to the floor-advance event from the Torghast module.
 */
export function awardFloorPoint(state: CharacterTreeState, floor: number): CharacterTreeState {
  if (floor <= MAX_POINT_FLOOR) {
    state.unspentPoints += 1; // 1 point per floor
  }
  // else: tree is full; no more points (infinite gear scaling only).
  return state;
}

/**
 * Attempt to allocate a node for a character.
 * Uses the pure `canAllocate` rule from the datascript (adjacency + points).
 * TODO(phase1): implement keystone-specific gating (requiredDepth) and the
 * "keystones cannot be refunded" flag once the refund system is designed.
 */
export function allocateNode(
  tree: PassiveTree,
  state: CharacterTreeState,
  nodeId: number,
): AllocateResult {
  if (!canAllocate(tree, state, nodeId)) {
    return { ok: false, reason: 'not_allocatable' };
  }
  // TODO(phase1): enforce keystone requiredDepth before allowing keystone nodes.
  state.allocated.push(nodeId);
  state.unspentPoints -= 1;
  persistTreeState(state); // TODO(phase1): real persistence
  // TODO(phase2): trigger a stat recalculation (stat_application.ts).
  return { ok: true, state };
}

/**
 * Refund a non-keystone node (respec). Whether this is allowed is an OPEN
 * decision (see DECISIONS.md); spec recommends allowing non-keystone respec.
 * TODO(design): confirm respec rules, then implement.
 */
export function refundNode(
  _tree: PassiveTree,
  _state: CharacterTreeState,
  _nodeId: number,
): AllocateResult {
  // TODO(phase1): block keystones; verify the tree stays connected after removal;
  // refund a point; re-run stat calc.
  return { ok: false, reason: 'not_implemented' };
}

// ---------------------------------------------------------------------------
// Persistence stubs (passive_tree_allocations)
// ---------------------------------------------------------------------------

/** TODO(phase1): load a character's allocation state from the DB. */
export function loadTreeState(characterId: number): CharacterTreeState {
  return { characterId, allocated: [], unspentPoints: 0 };
}

/** TODO(phase1): upsert allocation rows + unspent points for a character. */
export function persistTreeState(_state: CharacterTreeState): void {
  // INSERT ... ON DUPLICATE KEY UPDATE into passive_tree_allocations.
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Livescript entry point for the allocation UI/commands.
 * TODO(phase1): register commands / addon messages to open the tree and allocate.
 */
export function Main(_events: unknown /* TSEvents */): void {
  // events.Player.OnCommand((player, command, found) => {
  //   TODO(phase1): "#tree" opens the passive tree; "#allocate <nodeId>" allocates.
  // });
}
