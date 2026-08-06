/**
 * anima_currency.ts — Phase 1 skeleton
 * ------------------------------------
 * The "Anima" currency: earned from enemies/bosses, spent only in the shop.
 * See DESIGN_SPEC.md "Currency System".
 *
 * This datascript defines the drop-table structure and per-character tracking
 * schema. The actual earn/spend logic runs at runtime (see
 * src/livescripts/shop_handler.ts). Drop-rate numbers come from the spec but are
 * subject to economy tuning — TODO(balance) / TODO(mysql).
 */

// import { std } from 'wow/wotlk'; // TODO(tswow): enable if Anima is a real currency/item

/** How an Anima source is categorized, for drop-table lookups. */
export enum AnimaSource {
  ENEMY_GROUP = 'enemy_group', // a pack of trash enemies
  BOSS = 'boss',               // a floor boss
}

/**
 * A drop-rate band: rolls a value in [min, max] when a source of `source` dies.
 * Ranges are from the spec ("every enemy group drops 10–50 anima", "boss floors
 * 50–200 anima per boss").
 * TODO(balance): confirm ranges hold up across the floor curve (they likely need
 * to scale with floor — see scaledAnimaDrop() below).
 */
export interface AnimaDropEntry {
  source: AnimaSource;
  min: number;
  max: number;
}

export const ANIMA_DROP_TABLE: AnimaDropEntry[] = [
  { source: AnimaSource.ENEMY_GROUP, min: 10, max: 50 },
  { source: AnimaSource.BOSS, min: 50, max: 200 },
];

export const ANIMA_DROP_BY_SOURCE: Record<AnimaSource, AnimaDropEntry> =
  Object.fromEntries(ANIMA_DROP_TABLE.map((e) => [e.source, e])) as
    Record<AnimaSource, AnimaDropEntry>;

/**
 * Base (floor-1) Anima roll for a source. Pure helper, no randomness injected
 * yet — callers pass a [0,1) roll so this stays testable/deterministic.
 * TODO(balance): confirm uniform distribution is desired.
 */
export function baseAnimaDrop(source: AnimaSource, roll01: number): number {
  const entry = ANIMA_DROP_BY_SOURCE[source];
  if (!entry) return 0;
  const clamped = Math.max(0, Math.min(1, roll01));
  return Math.round(entry.min + clamped * (entry.max - entry.min));
}

/**
 * Anima drop scaled to a floor. The spec keeps drop ranges flat but the economy
 * likely needs to scale with floor so late-game shops stay meaningful.
 * TODO(balance): decide the scaling curve (flat? linear? matches gear %?).
 * Placeholder: flat (multiplier 1.0) so behavior matches the spec today.
 */
export function scaledAnimaDrop(
  source: AnimaSource,
  roll01: number,
  _floor: number,
): number {
  const floorMultiplier = 1.0; // TODO(balance): replace with real curve
  return Math.round(baseAnimaDrop(source, roll01) * floorMultiplier);
}

// ---------------------------------------------------------------------------
// Per-character tracking
// ---------------------------------------------------------------------------

/**
 * Runtime Anima balance for one character. Persisted via livescript DB access.
 * Mirrors the planned `character_anima` SQL table (see schema below).
 *
 * TODO(design): per-character vs account-wide carry-over is still OPEN
 * (see DECISIONS.md). The `characterId` key assumes per-character for now.
 */
export interface CharacterAnima {
  characterId: number;
  balance: number;      // current spendable Anima
  lifetimeEarned: number; // total ever earned (for stats / achievements)
}

/**
 * Planned SQL schema for Anima persistence. Kept here next to the data model so
 * schema + code stay in sync. Created at runtime, not by this datascript.
 * TODO(tswow): create this table via a livescript / SQL migration.
 *
 *   CREATE TABLE IF NOT EXISTS character_anima (
 *     character_id     INT PRIMARY KEY,
 *     balance          INT NOT NULL DEFAULT 0,
 *     lifetime_earned  INT NOT NULL DEFAULT 0
 *   );
 */
export const CHARACTER_ANIMA_SCHEMA = `
  CREATE TABLE IF NOT EXISTS character_anima (
    character_id     INT PRIMARY KEY,
    balance          INT NOT NULL DEFAULT 0,
    lifetime_earned  INT NOT NULL DEFAULT 0
  );
`;

// ---------------------------------------------------------------------------
// TSWOW registration (STUB)
// ---------------------------------------------------------------------------

/**
 * Register the Anima currency.
 * TODO(design): decide representation — a custom currency, a virtual counter in
 * character_anima, or an item stack. The skeleton assumes a virtual counter in
 * the character_anima table (simplest for a single-player module).
 * TODO(tswow): run CHARACTER_ANIMA_SCHEMA at world startup.
 */
export function registerAnimaCurrency(): void {
  // TODO(tswow): ensure character_anima exists; wire drop table into enemy deaths
  // via livescripts (shop_handler.ts / a loot hook).
}
