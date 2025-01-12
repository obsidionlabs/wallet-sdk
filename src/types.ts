import type { AbiType } from "@aztec/foundation/abi";
import type { WalletConnectModalSignOptions } from "@walletconnect/modal-sign-html";

export type SerializedFunctionCall = {
	selector: string;
	name: string;
	type: string;
	isStatic: boolean;
	to: string;
	args: string[];
	returnTypes: AbiType[];
};

export type RpcRequestMap = {
	/**
	 * Requests the user to connect 1 or more accounts to the app.
	 * @returns the list of `CompleteAddress`es of the connected accounts. The first one must be the currently selected account.
	 */
	aztec_requestAccounts: () => string[];
	/**
	 * @returns the list of `CompleteAddress`es of the previously connected accounts. The first one must be the currently selected account.
	 */
	aztec_accounts: () => string[];
	/**
	 * Sends a transaction to the blockchain from `request.from` account.
	 * @returns the transaction hash
	 */
	aztec_sendTransaction: (request: {
		/** `AztecAddress` of the account that will send the transaction */
		from: string;
		/** List of `FunctionCall`s to be executed in the transaction */
		// TODO: use `FunctionCall.toString` and `FunctionCall.fromString` to serialize/deserialize
		calls: SerializedFunctionCall[];
		/** `Fr[]` - auth witnesses required for the transaction */
		authWitnesses: string[];
	}) => string;
};

export type RpcRequest<M extends keyof RpcRequestMap> = {
	method: M;
	params: Parameters<RpcRequestMap[M]>;
};

export type OnRpcConfirmationRequest<
	K extends keyof RpcRequestMap = keyof RpcRequestMap,
> = (request: RpcRequest<K>, controller: AbortController) => unknown;

export type RpcEventsMap = {
	/**
	 * Emitted when the user changes the selected account in wallet UI. It is the `CompleteAddress` of the new selected account.
	 */
	accountsChanged: [string];
};

export type MyWalletConnectOptions = Omit<
	WalletConnectModalSignOptions,
	"metadata"
> & {
	metadata?: WalletConnectModalSignOptions["metadata"];
};

export interface Eip1193Provider {
	request(request: {
		method: string;
		params?: unknown[] | Record<string, unknown>;
	}): Promise<unknown>;
}

export interface TypedEip1193Provider {
	request<M extends keyof RpcRequestMap>(
		request: RpcRequest<M>
	): Promise<ReturnType<RpcRequestMap[M]>>;
}
