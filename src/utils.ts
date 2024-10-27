import { CompleteAddress, PXE } from "@aztec/circuit-types";
import { TypedEip1193Provider } from "./types.js";
import { AsyncOrSync } from "ts-essentials";

export const OBSIDON_WALLET_URL = "http://localhost:5173";

/**
 * @template T
 * @param {() => T} fn
 */
export function lazyValue(fn: () => any) {
	/** @type T */
	let value: any;
	let initialized = false;
	return () => {
		if (!initialized) {
			initialized = true;
			value = fn();
		}
		return value;
	};
}

export async function accountFromCompleteAddress(
	provider: TypedEip1193Provider,
	pxe: PXE,
	address: CompleteAddress
) {
	const { AztecEip1193Account } = await import("./exports/eip1193.js");
	const nodeInfo = await pxe.getNodeInfo();
	return new AztecEip1193Account(address, provider, pxe, nodeInfo);
}

export function resolvePxe(getPxe: PXE | (() => AsyncOrSync<PXE>)) {
	const getPxe2 = lazyValue(
		typeof getPxe === "function" ? getPxe : () => getPxe
	);
	return lazyValue(async () => {
		const { waitForPXE } = await import("@aztec/aztec.js");
		const pxe = await getPxe2();
		await waitForPXE(pxe);
		return pxe;
	});
}
