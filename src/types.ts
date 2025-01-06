import type { AbiType } from "@aztec/foundation/abi"
// import type { WalletConnectModalSignOptions } from "@walletconnect/modal-sign-html";

export interface SerdeItem<T, S> {
  serialize(value: T): Promise<S>
  deserialize(value: S): Promise<T>
}

export type SerializedFunctionCall = {
  selector: string
  name: string
  type: string
  isStatic: boolean
  to: string
  args: string[]
  returnTypes: AbiType[]
}

export type RpcRequestMap = {
  /**
   * @returns the list of `CompleteAddress`es of the connected accounts. The first one must be the selected account.
   */
  aztec_requestAccounts: () => string[]
  /**
   * @returns the list of `CompleteAddress`es of the connected accounts. The first one must be the selected account.
   */
  aztec_accounts: () => string[]
  /**
   * Sends a transaction to the blockchain from `request.from` account.
   * @returns the transaction hash
   */
  aztec_sendTransaction: (request: {
    /** `AztecAddress` of the account that will send the transaction */
    from: string
    /** List of `FunctionCall`s to be executed in the transaction */
    // TODO: use `FunctionCall.toString` and `FunctionCall.fromString` to serialize/deserialize
    calls: SerializedFunctionCall[]
    /** List of `AuthWitness`es to be included in the transaction */
    authWitnesses: string[]
  }) => string

  /**
   * Sends a transaction to the blockchain from `request.from` account.
   * @returns the transaction hash
   */
  aztec_sendSessionKeyTransaction: (request: {
    /** `AztecAddress` of the account that will send the transaction */
    from: string
    /** List of `FunctionCall`s to be executed in the transaction */
    // TODO: use `FunctionCall.toString` and `FunctionCall.fromString` to serialize/deserialize
    call: SerializedFunctionCall
    /** `Fr`[] - auth witnesses required for the transaction */
    authWitness: string
    /** `SessionId` of the session key to use */
    sessionId: string
  }) => string

  /**
   * Adds a session key to the account.
   * @returns the session key id
   */
  aztec_add_session_key: (request: {
    /** `AztecAddress` of the account that will send the transaction */
    from: string
    /** `SessionId` of the session key to use */
    targets: string[]
    /** `Fr` of the session key to use */
    selectors: string[]
    /** `FunctionName` of the session key to use */
    functionNames: string[]
  }) => string[]

  /**
   * Removes a session key from the account.
   * @returns the session key id
   */
  remove_session_key: (request: {
    /** `AztecAddress` of the account that will send the transaction */
    from: string
    /** `SessionId` of the session key to use */
    sessionId: string
  }) => string

  /**
   * Creates an `AuthWitness` for the given message hash.
   */
  aztec_createAuthWitness: (request: {
    /** `AztecAddress` of the account that will sign the witness */
    from: string
    /** `Fr` hash to be signed */
    messageHash: string
  }) => void

  /**
   * Sends a transaction to the blockchain from `request.from` account.
   * @returns the transaction hash
   */
  aztec_createTxExecutionRequest: (request: {
    /** `AztecAddress` of the account that will send the transaction */
    from: string
    /** List of `FunctionCall`s to be executed in the transaction */
    // TODO: use `FunctionCall.toString` and `FunctionCall.fromString` to serialize/deserialize
    calls: SerializedFunctionCall[]
  }) => string
  /**
   * Refer here for more information <https://forum.aztec.network/t/management-of-secrets-for-token-redeem-shield/4923>
   *
   * @returns `Fr` hash of the secret.
   */
  aztec_experimental_createSecretHash: (request: {
    /** `AztecAddress` */
    from: string
    /** `AztecAddress` */
    // TODO: check if this is useful. Does not prevent spam attack but may namespace tokens to narrow down search space.
    contract: string
  }) => string
  /**
   * Refer here for more information <https://forum.aztec.network/t/management-of-secrets-for-token-redeem-shield/4923>
   * @returns transaction hash of the redeem tx.
   */
  aztec_experimental_tokenRedeemShield: (request: {
    /** `AztecAddress` of the account that will redeem the shield */
    from: string
    /** `AztecAddress` of the token contract */
    token: string
    /** `Fr` amount of tokens to redeem */
    amount: string
    /** `Fr` hash of the secret */
    secretHash: string
    /** `TxHash` of the transaction that redeemed the shield */
    txHash: string
  }) => string
}

export type RpcRequest<M extends keyof RpcRequestMap> = {
  method: M
  params: Parameters<RpcRequestMap[M]>
}

export type OnRpcConfirmationRequest<K extends keyof RpcRequestMap = keyof RpcRequestMap> = (
  request: RpcRequest<K>,
  controller: AbortController,
) => unknown

export type RpcEventsMap = {
  /**
   * Emitted when the user changes the selected account in wallet UI. It is the `CompleteAddress` of the new selected account.
   */
  accountsChanged: [string]
}

export interface Eip1193Provider {
  request(request: {
    method: string
    params?: unknown[] | Record<string, unknown>
  }): Promise<unknown>
}

export interface TypedEip1193Provider {
  request<M extends keyof RpcRequestMap>(
    request: RpcRequest<M>,
  ): Promise<ReturnType<RpcRequestMap[M]>>
}
