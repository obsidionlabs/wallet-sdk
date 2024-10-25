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
export const SHIELDSWAP_WALLET_URL = typeof window !== "undefined" &&
    ["localhost:5183", "localhost:5185"].includes(window.location.host)
    ? "http://localhost:5173"
    : // ? "http://localhost:5184"
        "https://wallet.shieldswap.org";
/** @type {string} */
export const SHIELDSWAP_WALLET_ICON_URL = "https://wallet.shieldswap.org/favicon.svg";
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
    const getPxe2 = lazyValue(typeof getPxe === "function" ? getPxe : () => getPxe);
    return lazyValue(async () => {
        const { waitForPXE } = await import("@aztec/aztec.js");
        const pxe = await getPxe2();
        await waitForPXE(pxe);
        return pxe;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsbUVBQW1FO0FBQ25FLDhEQUE4RDtBQUM5RCxtREFBbUQ7QUFFbkQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDO0FBQzVCLE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQztBQUMzQixNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUc7SUFDbkIsS0FBSztRQUNKLE9BQU8sR0FBRyxXQUFXLElBQUksY0FBYyxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUNEOztPQUVHO0lBQ0gsT0FBTyxDQUFDLE9BQU87UUFDZCxPQUFPLEdBQUcsV0FBVyxJQUFJLGNBQWMsSUFBSSxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztJQUNwRSxDQUFDO0NBQ0QsQ0FBQztBQUVGLHFCQUFxQjtBQUNyQixNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyxtQkFBbUIsQ0FBQztBQUMxRCxxQkFBcUI7QUFDckIsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQ2pDLE9BQU8sTUFBTSxLQUFLLFdBQVc7SUFDN0IsQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztJQUNsRSxDQUFDLENBQUMsdUJBQXVCO0lBQ3pCLENBQUMsQ0FBQyw0QkFBNEI7UUFDN0IsK0JBQStCLENBQUM7QUFDbkMscUJBQXFCO0FBQ3JCLE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUN0QywyQ0FBMkMsQ0FBQztBQUU3Qzs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGtDQUFrQyxHQUFHO0lBQ2pELGdCQUFnQjtJQUNoQix5QkFBeUIsRUFBRSw4R0FBOEc7SUFDekkscUNBQXFDO0NBQ3JDLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsU0FBUyxDQUFDLEVBQUU7SUFDM0IsY0FBYztJQUNkLElBQUksS0FBSyxDQUFDO0lBQ1YsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLE9BQU8sR0FBRyxFQUFFO1FBQ1gsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2xCLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDbkIsS0FBSyxHQUFHLEVBQUUsRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLDBCQUEwQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsT0FBTztJQUN0RSxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUNoRSxNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QyxPQUFPLElBQUksY0FBYyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxVQUFVLENBQUMsTUFBTTtJQUNoQyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQ3hCLE9BQU8sTUFBTSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQ3BELENBQUM7SUFDRixPQUFPLFNBQVMsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUMzQixNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN2RCxNQUFNLEdBQUcsR0FBRyxNQUFNLE9BQU8sRUFBRSxDQUFDO1FBQzVCLE1BQU0sVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDIn0=