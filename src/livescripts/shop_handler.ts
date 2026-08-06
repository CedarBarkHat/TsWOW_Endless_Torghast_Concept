/**
 * shop_handler.ts — Phase 1 skeleton (livescript)
 * -----------------------------------------------
 * Runtime logic for the in-run shop and the Anima economy. Handles: opening the
 * shop on shop floors, rolling an offer, purchasing, and granting the bought
 * ability. See DESIGN_SPEC.md "Shop System" + "Currency System".
 *
 * LIVESCRIPTS run inside the server. This is STRUCTURE ONLY — real DB reads/writes
 * and spell grants are stubbed with TODOs. The purchasable pool + costs come from
 * datascripts (abilities_shop.ts) and the economy from balance_tuning.ts.
 *
 * TSWOW note: livescripts export a Main(events) entry point and hook game events.
 */

// Datascript imports are type-only here so the skeleton compiles without the
// full TSWOW runtime wired up.
import type { ShopAbility } from '../datascripts/abilities_shop';
// import { ALL_SHOP_ABILITIES } from '../datascripts/abilities_shop';
// import { AnimaSource, scaledAnimaDrop } from '../datascripts/anima_currency';

/** An offer presented to the player on a shop floor. */
export interface ShopOffer {
  floor: number;
  /** 3–5 abilities rolled from the pool (never repeats per character). */
  choices: ShopAbility[];
}

/**
 * Roll a shop offer for a character on a given floor.
 * TODO(phase4): implement — exclude already-owned/purchased abilities, weight by
 * the character's build direction, and pick `SHOP_OFFER_SIZE` choices.
 * TODO(design): shop frequency (every floor vs every 5) — see balance_tuning.ts.
 */
export function rollShopOffer(_characterId: number, _floor: number): ShopOffer {
  // const owned = loadPurchased(characterId);
  // const pool = ALL_SHOP_ABILITIES.filter(a => !owned.has(a.id));
  // TODO(phase4): weighted random selection.
  return { floor: _floor, choices: [] };
}

/** Result of attempting a purchase. */
export interface PurchaseResult {
  ok: boolean;
  reason?: string; // set when ok === false
  newBalance?: number;
}

/**
 * Attempt to buy an ability.
 * TODO(phase4): implement — check balance >= cost, deduct Anima, persist the
 * purchase, and grant the spell/effect to the player.
 */
export function purchase(
  _characterId: number,
  _ability: ShopAbility,
): PurchaseResult {
  // const balance = loadAnima(characterId);
  // if (balance < ability.animaCost) return { ok: false, reason: 'insufficient_anima' };
  // deductAnima(characterId, ability.animaCost);
  // recordPurchase(characterId, ability.id);
  // grantAbility(characterId, ability);
  return { ok: false, reason: 'not_implemented' };
}

/**
 * Grant a purchased ability's effect to the player.
 * - NEW_ABILITY: learn the cloned spell.
 * - ABILITY_MASTERY: mark the upgraded core ability as mastered (buff its values).
 * - UTILITY: learn the utility spell.
 * - PASSIVE_MOD: apply a global modifier aura.
 * TODO(phase4): implement per category.
 */
export function grantAbility(_characterId: number, _ability: ShopAbility): void {
  // TODO(phase4): switch on ability.category and apply.
}

// ---------------------------------------------------------------------------
// Persistence stubs (character_anima + character_purchases)
// ---------------------------------------------------------------------------

/** TODO(phase4): SELECT balance FROM character_anima WHERE character_id = ?. */
export function loadAnima(_characterId: number): number {
  return 0;
}

/** TODO(phase4): UPDATE character_anima SET balance = balance + delta ... */
export function addAnima(_characterId: number, _delta: number): void {
  // Also bump lifetime_earned when delta > 0.
}

/** TODO(phase4): SELECT ability_id FROM character_purchases WHERE character_id = ?. */
export function loadPurchased(_characterId: number): Set<string> {
  return new Set<string>();
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Livescript entry point. Wires shop + Anima hooks.
 * TODO(phase4): register the real event handlers.
 */
export function Main(_events: unknown /* TSEvents */): void {
  // events.Player.OnCommand((player, command, found) => {
  //   TODO(phase4): "#shop" opens the offer for the current floor.
  // });
  // TODO(phase4): hook creature death -> award Anima via scaledAnimaDrop().
  // TODO(phase6): hook floor-advance -> if shop floor, rollShopOffer().
}
