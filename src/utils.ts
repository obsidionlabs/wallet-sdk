import { CompleteAddress, PXE } from "@aztec/circuit-types";
import { TypedEip1193Provider } from "./types.js";
import { AsyncOrSync } from "ts-essentials";

export const SHIELDSWAP_WALLET_URL: string =
	typeof window !== "undefined" &&
	["localhost:5183", "localhost:5185"].includes(window.location.host)
		? "http://localhost:5184"
		: "https://wallet.shieldswap.org";

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
	const { Eip1193Account } = await import("./exports/eip1193.js");
	const nodeInfo = await pxe.getNodeInfo();
	return new Eip1193Account(address, provider, pxe, nodeInfo);
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
