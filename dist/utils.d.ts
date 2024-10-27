import { CompleteAddress, PXE } from "@aztec/circuit-types";
import { TypedEip1193Provider } from "./types.js";
import { AsyncOrSync } from "ts-essentials";
export declare const OBSIDON_WALLET_URL = "http://localhost:5173";
/**
 * @template T
 * @param {() => T} fn
 */
export declare function lazyValue(fn: () => any): () => any;
export declare function accountFromCompleteAddress(provider: TypedEip1193Provider, pxe: PXE, address: CompleteAddress): Promise<import("./exports/eip1193.js").AztecEip1193Account>;
export declare function resolvePxe(getPxe: PXE | (() => AsyncOrSync<PXE>)): () => any;
//# sourceMappingURL=utils.d.ts.map