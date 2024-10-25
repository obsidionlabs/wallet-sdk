/**
 * @template T
 * @param {() => T} fn
 */
export function lazyValue<T>(fn: () => T): () => T;
/**
 * @param {Eip1193Provider} provider
 * @param {PXE} pxe
 * @param {CompleteAddress} address
 */
export function accountFromCompleteAddress(provider: Eip1193Provider, pxe: PXE, address: CompleteAddress): Promise<import("./exports/eip1193.js").Eip1193Account>;
/**
 * @param {PXE | (() => AsyncOrSync<PXE>)} getPxe
 */
export function resolvePxe(getPxe: PXE | (() => AsyncOrSync<PXE>)): () => Promise<PXE>;
export namespace CAIP {
    function chain(): string;
    /**
     * @param {string} address
     */
    function address(address: string): string;
}
/** @type {string} */
export const SHIELDSWAP_WALLET_NAME: string;
/** @type {string} */
export const SHIELDSWAP_WALLET_URL: string;
/** @type {string} */
export const SHIELDSWAP_WALLET_ICON_URL: string;
/**
 * @type {(keyof RpcRequestMap)[]}
 */
export const METHODS_NOT_REQUIRING_CONFIRMATION: (keyof RpcRequestMap)[];
import type { Eip1193Provider } from "./types.js";
import type { PXE } from "@aztec/aztec.js";
import type { CompleteAddress } from "@aztec/aztec.js";
import type { AsyncOrSync } from "ts-essentials";
import type { RpcRequestMap } from "./types.js";
//# sourceMappingURL=utils.d.ts.map