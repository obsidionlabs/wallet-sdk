import {
  AccountWallet,
  AuthWitness,
  AztecAddress,
  CompleteAddress,
  Fr,
  FunctionSelector,
  TxExecutionRequest,
  type NodeInfo,
  type PXE,
} from "@aztec/aztec.js"
import type { AccountInterface } from "@aztec/aztec.js/account"
import type { ExecutionRequestInit } from "@aztec/aztec.js/entrypoint"
import type { FunctionCall, PrivateExecutionResult } from "@aztec/circuit-types"
import { serde } from "../serde.js"
import type { Eip1193Provider, TypedEip1193Provider } from "../types.js"
import { poseidon2Hash } from "@aztec/foundation/crypto"

export class SessionKeyManager {
  // key: session id
  readonly #sessions: Map<
    string,
    {
      target: AztecAddress
      selector: string
    }
  >

  constructor(private readonly address: AztecAddress) {
    this.#sessions = new Map()
    this.loadSessions()
  }

  loadSessions() {
    console.log("key ", "wallet-sdk_sessionkeys_" + this.address.toString().slice(0, 6))
    const sessionsJson = localStorage.getItem(
      "wallet-sdk_sessionkeys_" + this.address.toString().slice(0, 6),
    )
    console.log("sessionsJson: ", sessionsJson)
    if (sessionsJson) {
      try {
        const sessionsArray: [string, { target: string; selector: string }][] =
          JSON.parse(sessionsJson)
        console.log("sessionsArray: ", sessionsArray)
        this.#sessions.clear()
        sessionsArray.forEach(([key, value]) => {
          const aztecAddress = AztecAddress.fromString(value.target) // Assumes a fromString method exists
          this.#sessions.set(key, {
            target: aztecAddress,
            selector: value.selector,
          })
        })
      } catch (error) {
        console.error("Failed to load sessions from localStorage:", error)
      }
    }
  }

  saveSessions() {
    try {
      const sessionsArray: [string, { target: string; selector: string }][] = Array.from(
        this.#sessions.entries(),
      ).map(([key, value]) => [key, { target: value.target.toString(), selector: value.selector }])
      localStorage.setItem(
        "wallet-sdk_sessionkeys_" + this.address.toString().slice(0, 6),
        JSON.stringify(sessionsArray),
      )
    } catch (error) {
      console.error("Failed to save sessions to localStorage:", error)
    }
  }

  addSessions(targets: AztecAddress[], selectors: FunctionSelector[]) {
    targets.forEach((target, index) => {
      const selector = selectors[index].toString()
      const sessionId = this.getSessionId(target.toString(), selector.toString())
      this.#sessions.set(sessionId, { target, selector })
    })
    this.saveSessions()
  }

  removeSessions(key: string) {
    this.#sessions.delete(key)
    this.saveSessions()
  }

  getSessions() {
    return this.#sessions
  }

  getSession(key: string) {
    return this.#sessions.get(key)
  }

  checkIsSessionTx(calls: FunctionCall[]): { isSessionTx: boolean; sessionId: string } {
    console.log("#sessions: ", this.#sessions.entries())
    console.log("calls: ", calls)
    console.log("calls[0].to: ", calls[0].to.toString())
    console.log("calls[0].selector: ", calls[0].selector.toString())
    const sessionId = this.getSessionId(calls[0].to.toString(), calls[0].selector.toString())
    console.log("sessionId: ", sessionId)
    if (this.#sessions.has(sessionId)) {
      return { isSessionTx: true, sessionId }
    }
    return { isSessionTx: false, sessionId: "" }
  }

  getSessionId(targetContract: string, selector: string): string {
    return poseidon2Hash([
      Fr.fromString(targetContract),
      Fr.fromString(selector),
      Fr.fromString(this.address.toString()),
    ]).toString()
  }
}

// This is a terrible hack. More info here https://discord.com/channels/1144692727120937080/1215729116716728410
export class Eip1193Account extends AccountWallet {
  readonly #eip1193Provider: TypedEip1193Provider

  /**
   * HACK: this is a super hack until Aztec implements proper RPC with wallets.
   * The flow is to collect all AuthWit requests and send them in one aztec_sendTransaction RPC call.
   */
  readonly #pendingAuthWits: Fr[]
  #sessionKeyManager: SessionKeyManager

  constructor(
    completeAddress: CompleteAddress,
    eip1193Provider: Eip1193Provider,
    pxe: PXE,
    nodeInfo: NodeInfo,
  ) {
    const typedEip1193Provider = eip1193Provider as TypedEip1193Provider
    const pendingAuthwits: Fr[] = []
    const account = new Eip1193AccountInterface(completeAddress, nodeInfo, pendingAuthwits)
    super(pxe, account)
    this.#eip1193Provider = typedEip1193Provider
    this.#pendingAuthWits = pendingAuthwits
    this.#sessionKeyManager = new SessionKeyManager(completeAddress.address)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async sendTx(tx: any) {
    const { TxHash } = await import("@aztec/aztec.js")
    const calls = (tx.executions as ExecutionRequestInit).calls
    const serializedExecs = await Promise.all(calls.map((e) => serde.FunctionCall.serialize(e)))

    let result
    const isSessionTxResult = this.#sessionKeyManager.checkIsSessionTx(calls)
    console.log("isSessionTxResult: ", isSessionTxResult)

    if (isSessionTxResult.isSessionTx) {
      console.log("is session tx")
      result = await this.#eip1193Provider.request({
        method: "aztec_sendSessionKeyTransaction",
        params: [
          {
            from: this.account.getAddress().toString(),
            call: serializedExecs[0],
            authWitness: "",
            sessionId: isSessionTxResult.sessionId,
          },
        ],
      })
    } else {
      console.log("not session tx")
      result = await this.#eip1193Provider.request({
        method: "aztec_sendTransaction",
        params: [
          {
            from: this.account.getAddress().toString(),
            calls: serializedExecs,
            authWitnesses: this.#pendingAuthWits.map((x) => x.toString()),
          },
        ],
      })
    }
    this.#pendingAuthWits.splice(0, this.#pendingAuthWits.length) // clear
    console.log("result: ", result)
    return TxHash.fromString(result)
  }

  override async proveTx(
    txRequest: TxExecutionRequest,
    privateExecutionResult: PrivateExecutionResult,
  ) {
    // forward data to `this.sendTx`
    return {
      privateExecutionResult,
      ...txRequest,
      toTx() {
        return this
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
  }

  override async simulateTx(
    txRequest: TxExecutionRequest,
    simulatePublic: boolean,
    msgSender: AztecAddress,
    skipTxValidation: boolean,
  ) {
    return {
      simulatePublic,
      msgSender,
      skipTxValidation,
      ...txRequest,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
  }

  override async createTxExecutionRequest(executions: ExecutionRequestInit) {
    // forward data to `this.simulateTx`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { executions } as any
  }

  async addSessionKeys(
    targets: AztecAddress[],
    selectors: FunctionSelector[],
    functionNames: string[],
  ) {
    await this.#eip1193Provider.request({
      method: "aztec_add_session_key",
      params: [
        {
          from: this.account.getAddress().toString(),
          targets: targets.map((t) => t.toString()),
          selectors: selectors.map((s) => s.toString()),
          functionNames: functionNames,
        },
      ],
    })

    this.#sessionKeyManager.addSessions(targets, selectors)
  }

  getSessionKeyManager() {
    return this.#sessionKeyManager
  }
}
class Eip1193AccountInterface implements AccountInterface {
  readonly #completeAddress: CompleteAddress

  readonly #nodeInfo: NodeInfo

  readonly #pendingAuthWits: Fr[]

  constructor(address: CompleteAddress, nodeInfo: NodeInfo, pendingAuthWits: Fr[]) {
    this.#completeAddress = address
    this.#nodeInfo = nodeInfo
    this.#pendingAuthWits = pendingAuthWits
  }

  getCompleteAddress() {
    return this.#completeAddress
  }

  async createAuthWit(messageHash: Fr) {
    this.#pendingAuthWits.push(messageHash)
    return new AuthWitness(Fr.random(), [])
  }

  async createTxExecutionRequest(): Promise<TxExecutionRequest> {
    throw new Error("use account.sendTx")
  }

  getAddress() {
    return this.#completeAddress.address
  }

  getChainId() {
    return new Fr(this.#nodeInfo.l1ChainId)
  }

  getVersion() {
    return new Fr(this.#nodeInfo.protocolVersion)
  }
}
