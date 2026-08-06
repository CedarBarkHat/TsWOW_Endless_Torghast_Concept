/**
 * passive_tree.ts — Phase 1 skeleton
 * -----------------------------------
 * Data model + generation stub for the 300-node passive tree described in
 * docs/DESIGN_SPEC.md ("Passive Tree Architecture").
 *
 * This file defines STRUCTURE ONLY. No real game data is generated yet — every
 * concrete number is a placeholder marked with a TODO. The actual node values
 * (which stat ids, how much %, coordinates) come from the MySQL export and a
 * balance pass that have not happened yet.
 *
 * Runtime allocation (spending points, applying bonuses) lives in the
 * livescripts (see src/livescripts/passive_allocation.ts and
 * stat_application.ts). This datascript is only responsible for defining the
 * static tree that both the client and server read.
 *
 * TSWOW note: when this is wired up it will register nodes as custom data
 * (custom DBC/SQL rows). The `std`-based registration is stubbed below.
 */

// import { std } from 'wow/wotlk'; // TODO(tswow): enable when registering real rows

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** The three thematic directions of the tree, plus hybrid connectors. */
export enum Direction {
  ARMOR_POWER = 'armor_power',       // Str / Armor / HP
  MAGIC_SHIELD = 'magic_shield',     // Int / Mana / Resist / ES
  EVASION_CRIT = 'evasion_crit',     // Dex / Crit / Dodge
  CONNECTOR = 'connector',           // hybrid pathway nodes between directions
}

/** Node category — determines how its bonus stacks (see DESIGN_SPEC). */
export enum NodeKind {
  SMALL = 'small',       // additive: +X% to a single stat
  BIG = 'big',           // multiplicative: xX% multiplier to related stats
  KEYSTONE = 'keystone', // game-changing scripted effect (see keystones.ts)
  MODIFIER = 'modifier', // enhances a specific ability (e.g. "+15% Fireball")
}

/**
 * Stat type a node modifies. Values here are logical names that will map onto
 * real stat ids from the MySQL `character_stats` table.
 * TODO(mysql): reconcile this list with the actual exported stat_name values.
 */
export enum StatType {
  ARMOR = 'armor',
  MAX_HEALTH = 'max_health',
  STRENGTH = 'strength',
  INTELLECT = 'intellect',
  DEXTERITY = 'dexterity',
  SPELL_POWER = 'spell_power',
  ENERGY_SHIELD = 'energy_shield',
  MANA = 'mana',
  RESIST_ALL = 'resist_all',
  CRIT_CHANCE = 'crit_chance',
  CRIT_MULTIPLIER = 'crit_multiplier',
  DODGE = 'dodge',
  ATTACK_SPEED = 'attack_speed',
  CAST_SPEED = 'cast_speed',
  // MODIFIER nodes don't use StatType; they reference an ability id instead.
  NONE = 'none',
}

// ---------------------------------------------------------------------------
// Core interfaces
// ---------------------------------------------------------------------------

/**
 * A single passive tree node.
 *
 * Mirrors the planned `passive_tree_nodes` SQL table in DESIGN_SPEC.md so the
 * datascript output and the DB schema stay 1:1.
 */
export interface PassiveNode {
  /** Stable unique id, 0 = start node. */
  id: number;
  /** Display name, e.g. "Heavy Armor", "Iron Will". */
  name: string;
  /** Which direction / cluster this node belongs to. */
  direction: Direction;
  /** Category controlling stacking behavior. */
  kind: NodeKind;

  /** Stat this node modifies (NONE for keystones / modifiers). */
  statType: StatType;
  /** Magnitude of the bonus, interpreted per `kind`:
   *  - SMALL: additive percent (2 => +2%)
   *  - BIG:   multiplier percent (5 => x1.05)
   *  - KEYSTONE/MODIFIER: unused (0) — behavior defined elsewhere.
   *  TODO(balance): all values are placeholders until the balance pass. */
  statValue: number;

  /** True only for keystones. Keystone behavior is defined in keystones.ts. */
  isKeystone: boolean;
  /** Keystone identifier (see keystones.ts KEYSTONES) when isKeystone. */
  keystoneId?: string;

  /** For MODIFIER nodes: the ability this node enhances (id from abilities_*). */
  modifiesAbilityId?: string;

  /** UI position. TODO(design): decide hand-authored vs generated coordinates. */
  x: number;
  y: number;

  /** Ids of nodes directly connected to this one (bidirectional edges). */
  connections: number[];
}

/** The whole tree: a node lookup plus the start node id. */
export interface PassiveTree {
  startNodeId: number;
  nodes: Map<number, PassiveNode>;
}

/**
 * Per-character allocation state. Persisted at runtime (see livescripts).
 * Mirrors the planned `passive_tree_allocations` SQL table.
 */
export interface CharacterTreeState {
  characterId: number;
  /** Node ids this character has allocated, in allocation order. */
  allocated: number[];
  /** Points earned but not yet spent (1 point/floor, floors 1–300). */
  unspentPoints: number;
}

// ---------------------------------------------------------------------------
// Target distribution (from DESIGN_SPEC "Node Distribution")
// ---------------------------------------------------------------------------

export const TARGET_TOTAL_NODES = 300;

/** Rough per-direction budgets — see DESIGN_SPEC. Used to sanity-check output. */
export const DIRECTION_BUDGET: Record<Direction, {
  small: number; big: number; keystones: number; connectors: number;
}> = {
  [Direction.ARMOR_POWER]:  { small: 40, big: 20, keystones: 3, connectors: 25 },
  [Direction.MAGIC_SHIELD]: { small: 40, big: 20, keystones: 3, connectors: 25 },
  [Direction.EVASION_CRIT]: { small: 40, big: 20, keystones: 3, connectors: 25 },
  // Dedicated hybrid connectors that don't belong to a single direction.
  [Direction.CONNECTOR]:    { small: 30, big: 0,  keystones: 0, connectors: 0 },
};

// ---------------------------------------------------------------------------
// Generation (STUB)
// ---------------------------------------------------------------------------

/**
 * Generate the full 300-node tree from the spec.
 *
 * TODO(phase1): implement real generation. Intended approach:
 *   1. Create the START node (id 0).
 *   2. For each direction, lay out small/big/keystone clusters per
 *      DIRECTION_BUDGET, assigning coordinates and stat values.
 *   3. Wire intra-direction connections (small: 1–3, big: 1–2, keystone: 1–3).
 *   4. Add CONNECTOR nodes bridging adjacent directions for hybrid builds.
 *   5. Validate with validateTree() before returning.
 *
 * TODO(mysql): pull real statValue magnitudes + stat ids from the export.
 * TODO(design): decide whether coordinates are authored or generated.
 */
export function generatePassiveTree(): PassiveTree {
  const nodes = new Map<number, PassiveNode>();

  // Start node — the single origin all paths branch from.
  nodes.set(0, {
    id: 0,
    name: 'Origin',
    direction: Direction.CONNECTOR,
    kind: NodeKind.SMALL,
    statType: StatType.NONE,
    statValue: 0,
    isKeystone: false,
    x: 0,
    y: 0,
    connections: [], // TODO: connect to first node of each direction
  });

  // TODO(phase1): populate the remaining 299 nodes here.
  //   for each direction -> buildDirectionCluster(direction, nodes)
  //   then buildConnectors(nodes)

  return { startNodeId: 0, nodes };
}

/**
 * Helper stub: build one direction's cluster of nodes and push them into `nodes`.
 * Returns the ids created so callers can wire connectors afterward.
 * TODO(phase1): implement.
 */
export function buildDirectionCluster(
  _direction: Direction,
  _nodes: Map<number, PassiveNode>,
): number[] {
  // TODO(phase1): create small/big/keystone nodes per DIRECTION_BUDGET,
  // assign coordinates, and connect them internally.
  return [];
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate structural invariants of a generated tree. Called after generation
 * and (eventually) in tests. Rules come from DESIGN_SPEC "Connectivity
 * Requirements".
 */
export function validateTree(tree: PassiveTree): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { nodes, startNodeId } = tree;

  if (!nodes.has(startNodeId)) {
    errors.push(`Start node ${startNodeId} is missing from the tree.`);
  }

  // Connections must be symmetric and point at existing nodes.
  for (const node of nodes.values()) {
    for (const other of node.connections) {
      const target = nodes.get(other);
      if (!target) {
        errors.push(`Node ${node.id} connects to missing node ${other}.`);
        continue;
      }
      if (!target.connections.includes(node.id)) {
        errors.push(`Asymmetric edge: ${node.id} -> ${other} has no return edge.`);
      }
    }

    // Degree rules per kind (see DESIGN_SPEC "Connectivity Requirements").
    const degree = node.connections.length;
    if (node.id !== startNodeId) {
      if (node.kind === NodeKind.SMALL && (degree < 1 || degree > 3)) {
        warnings.push(`Small node ${node.id} has degree ${degree} (expected 1–3).`);
      }
      if (node.kind === NodeKind.BIG && (degree < 1 || degree > 2)) {
        warnings.push(`Big node ${node.id} has degree ${degree} (expected 1–2).`);
      }
      if (node.kind === NodeKind.KEYSTONE && (degree < 1 || degree > 3)) {
        warnings.push(`Keystone ${node.id} has degree ${degree} (expected 1–3).`);
      }
    }
  }

  // Every node must be reachable from the start (single connected component).
  const reachable = reachableFrom(tree, startNodeId);
  if (nodes.size > 0 && reachable.size !== nodes.size) {
    errors.push(
      `Tree is not fully connected: ${reachable.size}/${nodes.size} nodes reachable from start.`,
    );
  }

  // TODO(phase1): once generation is real, assert node count == TARGET_TOTAL_NODES
  // and per-direction counts roughly match DIRECTION_BUDGET.

  return { ok: errors.length === 0, errors, warnings };
}

/** BFS reachability from a starting node id. Used by validation + allocation. */
export function reachableFrom(tree: PassiveTree, fromId: number): Set<number> {
  const seen = new Set<number>();
  const queue: number[] = [fromId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const node = tree.nodes.get(id);
    if (!node) continue;
    for (const n of node.connections) {
      if (!seen.has(n)) queue.push(n);
    }
  }
  return seen;
}

/**
 * Whether `nodeId` may be allocated given a character's current state.
 * Rule (assumed, see DECISIONS.md open question): a node is allocatable if it is
 * the start node, or it is adjacent to an already-allocated node.
 * TODO(design): confirm adjacency-required rule vs free allocation.
 */
export function canAllocate(
  tree: PassiveTree,
  state: CharacterTreeState,
  nodeId: number,
): boolean {
  if (!tree.nodes.has(nodeId)) return false;
  if (state.allocated.includes(nodeId)) return false; // already taken
  if (state.unspentPoints <= 0) return false;
  if (nodeId === tree.startNodeId) return true;

  const node = tree.nodes.get(nodeId)!;
  return node.connections.some((n) => state.allocated.includes(n));
}

// ---------------------------------------------------------------------------
// TSWOW registration (STUB)
// ---------------------------------------------------------------------------

/**
 * Register the generated tree as custom game data.
 * TODO(tswow): emit custom SQL rows for `passive_tree_nodes` (and create the
 * `passive_tree_allocations` table) so livescripts can read/write allocations.
 * The client-facing tree UI is a separate addon (see DECISIONS.md).
 */
export function registerPassiveTree(_tree: PassiveTree): void {
  // TODO(tswow): std-based / raw-SQL registration goes here.
}
