import type { PXE } from "@aztec/aztec.js";
import { type AsyncOrSync } from "ts-essentials";
import { type FallbackOpenPopup } from "./Communicator.js";
import type { AztecEip1193Account } from "./exports/eip1193.js";
import type { RpcRequest, RpcRequestMap, TypedEip1193Provider } from "./types.js";
export declare class ObsidonWalletSDK implements TypedEip1193Provider {
    #private;
    readonly accountObservable: import("svelte/store").Readable<AztecEip1193Account | undefined>;
    constructor(pxe: (() => AsyncOrSync<PXE>) | PXE, params?: {
        /**
         * Must call the provided callback right after user clicks a button, so browser does not block it.
         */
        fallbackOpenPopup?: FallbackOpenPopup;
    });
    getAccount(): AztecEip1193Account | undefined;
    connect(): Promise<AztecEip1193Account>;
    disconnect(): Promise<void>;
    /**
     * @deprecated not needed anymore
     */
    reconnect(): Promise<void>;
    /**
     * Sends a raw RPC request to the user's wallet.
     */
    request<M extends keyof RpcRequestMap>(request: RpcRequest<M>): Promise<ReturnType<RpcRequestMap[M]>>;
}
//# sourceMappingURL=popup.d.ts.map