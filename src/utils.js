/** @import { Eip1193Provider, RpcRequestMap } from "./types.js" */
/** @import { CompleteAddress, PXE } from "@aztec/aztec.js" */
/** @import { AsyncOrSync } from "ts-essentials" */

const CAIP_PREFIX = "aztec";
const AZTEC_CHAIN_ID = "1";
export const CAIP = {
	chain() {
		return `${CAIP_PREFIX}:${AZTEC_CHAIN_ID}`;
	},
	/**
	 * @param {string} address
	 */
	address(address) {
		return `${CAIP_PREFIX}:${AZTEC_CHAIN_ID}:${address.toLowerCase()}`;
	},
};

/** @type {string} */
export const SHIELDSWAP_WALLET_NAME = "ShieldSwap Wallet";
/** @type {string} */
export const SHIELDSWAP_WALLET_URL =
	typeof window !== "undefined" &&
	["localhost:5183", "localhost:5185"].includes(window.location.host)
		? "http://localhost:5173"
		: // ? "http://localhost:5184"
			"https://wallet.shieldswap.org";
/** @type {string} */
export const SHIELDSWAP_WALLET_ICON_URL =
	"https://wallet.shieldswap.org/favicon.svg";

/**
 * @type {(keyof RpcRequestMap)[]}
 */
export const METHODS_NOT_REQUIRING_CONFIRMATION = [
	"aztec_accounts",
	"aztec_createAuthWitness", // TODO(security): createAuthWitness must be confirmed by the user. Maybe merge it with aztec_sendTransaction?
	"aztec_experimental_createSecretHash",
];

/**
 * @template T
 * @param {() => T} fn
 */
export function lazyValue(fn) {
	/** @type T */
	let value;
	let initialized = false;
	return () => {
		if (!initialized) {
			initialized = true;
			value = fn();
		}
		return value;
	};
}

/**
 * @param {Eip1193Provider} provider
 * @param {PXE} pxe
 * @param {CompleteAddress} address
 */
export async function accountFromCompleteAddress(provider, pxe, address) {
	const { Eip1193Account } = await import("./exports/eip1193.js");
	const nodeInfo = await pxe.getNodeInfo();
	return new Eip1193Account(address, provider, pxe, nodeInfo);
}

/**
 * @param {PXE | (() => AsyncOrSync<PXE>)} getPxe
 */
export function resolvePxe(getPxe) {
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
