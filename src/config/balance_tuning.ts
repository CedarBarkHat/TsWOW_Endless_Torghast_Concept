/**
 * balance_tuning.ts — Phase 1 skeleton
 * ------------------------------------
 * Central home for tunable numbers: progression pacing, gear/enemy scaling,
 * economy, and ability scaling coefficients. See DESIGN_SPEC.md
 * "Power Progression Framework" + "Shop Design Philosophy".
 *
 * Keeping every knob here (rather than scattered through datascripts/livescripts)
 * makes the balance pass a single-file edit. All values are placeholders or
 * spec defaults — TODO(balance) marks anything that must be validated by
 * playtesting.
 */

// ---------------------------------------------------------------------------
// Progression pacing (spec: "Level & Passive Point Progression")
// ---------------------------------------------------------------------------

export const PROGRESSION = {
  /** Level cap; leveling ends at floor 80. */
  levelCap: 80,
  /** Floor at which leveling stops (== levelCap). */
  levelingEndFloor: 80,
  /** Passive point granted per floor (floors 1–pointEndFloor). */
  passivePointsPerFloor: 1,
  /** Last floor that grants a passive point (tree fills at 300). */
  pointEndFloor: 300,
  /** Total nodes in the tree. */
  totalNodes: 300,
} as const;

// ---------------------------------------------------------------------------
// Gear scaling (spec: "Gear Scaling Curve")
//   Loot Quality = Baseline * (1 + rate)^(floor - startFloor)
// ---------------------------------------------------------------------------

export interface GearTier {
  startFloor: number;
  /** Per-floor growth (0.03 = +3%/floor). */
  ratePerFloor: number;
}

export const GEAR_TIERS: GearTier[] = [
  { startFloor: 1, ratePerFloor: 0.03 },   // floors 1–80
  { startFloor: 81, ratePerFloor: 0.04 },  // floors 81–150
  { startFloor: 151, ratePerFloor: 0.05 }, // floors 151–300
  { startFloor: 301, ratePerFloor: 0.06 }, // floors 301+
];

/**
 * Gear quality multiplier at a floor, compounding each tier from its start.
 * Pure helper — deterministic and testable. TODO(balance): validate the curve
 * doesn't make gear trivialize enemies at high floors.
 */
export function gearQualityMultiplier(floor: number): number {
  let multiplier = 1;
  for (let i = 0; i < GEAR_TIERS.length; i++) {
    const tier = GEAR_TIERS[i];
    if (floor < tier.startFloor) break;
    const next = GEAR_TIERS[i + 1];
    const tierEnd = next ? Math.min(floor, next.startFloor - 1) : floor;
    const floorsInTier = tierEnd - tier.startFloor + 1;
    if (floorsInTier > 0) {
      multiplier *= Math.pow(1 + tier.ratePerFloor, floorsInTier);
    }
  }
  return multiplier;
}

// ---------------------------------------------------------------------------
// Enemy scaling (spec: "Enemy Scaling")
// ---------------------------------------------------------------------------

export const ENEMY_SCALING = {
  /** Floors 1–80: enemy level == player level. */
  levelBasedUntilFloor: 80,
  /** Floors 81+: scale by allocated passive points instead of level. */
  healthPerPassivePoint: 0.01,  // +1% health per point. TODO(balance)
  damagePerPassivePoint: 0.005, // +0.5% damage per point. TODO(balance)
} as const;

/**
 * Enemy health/damage multipliers past floor 80, driven by the player's
 * allocated passive points. TODO(balance): confirm this stays fair past floor 200.
 */
export function enemyScaling(passivePoints: number): { health: number; damage: number } {
  return {
    health: 1 + passivePoints * ENEMY_SCALING.healthPerPassivePoint,
    damage: 1 + passivePoints * ENEMY_SCALING.damagePerPassivePoint,
  };
}

// ---------------------------------------------------------------------------
// Anima economy (spec: "Currency System" + "Shop System")
// ---------------------------------------------------------------------------

export const ECONOMY = {
  /** Shop appears every N floors. OPEN: every floor vs every 5 (DECISIONS.md). */
  shopFloorInterval: 5, // TODO(design)
  /** How many choices a shop offer presents (spec: 3–5). */
  shopOfferSize: 4, // TODO(balance)
  /** Anima drop ranges (mirrors anima_currency.ts; kept here for tuning). */
  anima: {
    enemyGroupMin: 10, enemyGroupMax: 50,   // TODO(balance)
    bossMin: 50, bossMax: 200,              // TODO(balance)
  },
  /** Rough cost bands by shop category (spec hints). TODO(balance). */
  costBands: {
    abilityMasteryMin: 50, abilityMasteryMax: 100,
    newAbilityMin: 100, newAbilityMax: 200,
    utilityMin: 75, utilityMax: 150,
    passiveModMin: 75, passiveModMax: 125,
  },
} as const;

// ---------------------------------------------------------------------------
// Ability scaling coefficients (spec: "How it stacks")
//   damage = baseDamage * (1 + additiveMods) * multiplier + coeff * spellPower
// ---------------------------------------------------------------------------

export const ABILITY_SCALING = {
  /** Default spell-power coefficient until per-ability values are set. */
  defaultSpellCoeff: 0, // TODO(mysql/balance): per-ability in abilities_core.ts
  /** Default attack-power coefficient for physical abilities. */
  defaultAttackCoeff: 0, // TODO(mysql/balance)
  /** Global cooldown floor (seconds) abilities can't go below. */
  globalCooldownFloor: 1.0, // TODO(balance)
} as const;

// ---------------------------------------------------------------------------
// Modifier node ratio (spec: "TBD / Implementation Notes")
// ---------------------------------------------------------------------------

export const MODIFIER_NODES = {
  /** Recommended count of ability-modifier nodes per 10 tree nodes. */
  perTenNodes: 2.5, // spec recommends 2–3 per 10. TODO(design/balance)
} as const;
