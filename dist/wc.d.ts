/**
 * @implements {TypedEip1193Provider}
 *
 * @deprecated Use ShieldswapWalletSdk instead.
 */
export class ShieldswapWalletWcSdk implements TypedEip1193Provider {
    /**
     * @param {import('./types.js').MyWalletConnectOptions} options
     * @param {(() => import("ts-essentials").AsyncOrSync<import("@aztec/aztec.js").PXE>) | import('@aztec/aztec.js').PXE} pxe
     * @param {import("./types.js").OnRpcConfirmationRequest} [onRequest]
     *
     */
    constructor(options: import("./types.js").MyWalletConnectOptions, pxe: (() => import("ts-essentials").AsyncOrSync<import("@aztec/aztec.js").PXE>) | import("@aztec/aztec.js").PXE, onRequest?: import("./types.js").OnRpcConfirmationRequest<keyof RpcRequestMap> | undefined);
    /**
     * @readonly
     * @type {import("svelte/store").Readable<Eip1193Account | undefined>}
     */
    readonly accountObservable: import("svelte/store").Readable<Eip1193Account | undefined>;
    /**
     * Returns currently selected account if any.
     */
    getAccount(): Eip1193Account | undefined;
    /**
     * Opens a WalletConnect modal and connects to the user's wallet.
     *
     * Call this when user clicks a "Connect wallet" button.
     *
     * @returns the connected account
     */
    connect(): Promise<Eip1193Account>;
    /**
     * Reconnects to the user's wallet if was previously connected.
     *
     * Call this on page refresh.
     *
     * @returns the connected account
     */
    reconnect(): Promise<Eip1193Account | undefined>;
    /**
     * Disconnects from the user's wallet.
     */
    disconnect(): Promise<void>;
    request<M extends keyof RpcRequestMap>(request: RpcRequest<M>): Promise<ReturnType<RpcRequestMap[M]>>;
    #private;
}
import type { TypedEip1193Provider } from "./types.js";
import type { Eip1193Account } from "./exports/eip1193.js";
import type { RpcRequestMap } from "./types.js";
import type { RpcRequest } from "./types.js";
//# sourceMappingURL=wc.d.ts.map