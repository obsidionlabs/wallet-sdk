/** @import { CompleteAddress, PXE, TxExecutionRequest, NodeInfo, AztecAddress, TxHash } from "@aztec/aztec.js" */
/** @import { PrivateExecutionResult } from "@aztec/circuit-types" */
/** @import { AccountInterface } from "@aztec/aztec.js/account" */
/** @import { TypedEip1193Provider, Eip1193Provider } from "../types.js" */
import { AccountWallet, AuthWitness, Fr } from "@aztec/aztec.js";
import { serde } from "../serde.js";

// This is a terrible hack. More info here https://discord.com/channels/1144692727120937080/1215729116716728410/1215729116716728410
export class Eip1193Account extends AccountWallet {
  /** @readonly @type {TypedEip1193Provider} */
  #eip1193Provider;

  /**
   * @param {CompleteAddress} completeAddress
   * @param {Eip1193Provider} eip1193Provider
   * @param {PXE} pxe
   * @param {NodeInfo} nodeInfo
   */
  constructor(completeAddress, eip1193Provider, pxe, nodeInfo) {
    const typedEip1193Provider = /** @type {TypedEip1193Provider} */ (
      eip1193Provider
    );
    const account = new Eip1193AccountInterface(
      completeAddress,
      typedEip1193Provider,
      nodeInfo,
    );
    super(pxe, account);
    this.#eip1193Provider = typedEip1193Provider;
  }

  /**
   * @param {string | AztecAddress} contractAddress
   */
  async experimental_createSecretHash(contractAddress) {
    const { Fr } = await import("@aztec/aztec.js");
    const secretHash = await this.#eip1193Provider.request({
      method: "aztec_experimental_createSecretHash",
      params: [
        {
          from: this.account.getAddress().toString(),
          contract: contractAddress.toString(),
        },
      ],
    });
    return new Fr(BigInt(secretHash));
  }

  /**
   * @param {AztecAddress | string} token
   * @param {Fr | string | bigint} amount
   * @param {Fr | string | bigint} secretHash
   * @param {TxHash | string} txHash
   */
  async experimental_redeemShield(token, amount, secretHash, txHash) {
    const { SentTx, TxHash } = await import("@aztec/aztec.js");
    const redeemTxHash = this.#eip1193Provider
      .request({
        method: "aztec_experimental_tokenRedeemShield",
        params: [
          {
            from: this.account.getAddress().toString(),
            token: token.toString(),
            amount: amount.toString(),
            secretHash: secretHash.toString(),
            txHash: txHash.toString(),
          },
        ],
      })
      .then((txHash) => TxHash.fromString(txHash));

    return new SentTx(this.pxe, redeemTxHash);
  }

  /**
   * @param {any} tx
   * @override
   */
  async sendTx(tx) {
    const { TxHash } = await import("@aztec/aztec.js");
    const serializedExecs = await Promise.all(
      /** @type {import('@aztec/aztec.js/entrypoint').ExecutionRequestInit} */ (
        tx.executions
      ).calls.map((e) => serde.FunctionCall.serialize(e)),
    );
    const result = await this.#eip1193Provider.request({
      method: "aztec_sendTransaction",
      params: [
        {
          from: this.account.getAddress().toString(),
          calls: serializedExecs,
        },
      ],
    });
    return TxHash.fromString(result);
  }

  /**
   * @param {TxExecutionRequest} txRequest
   * @param {PrivateExecutionResult} privateExecutionResult
   * @override
   */
  async proveTx(txRequest, privateExecutionResult) {
    // forward data to `this.sendTx`
    return /** @type {any} */ ({
      privateExecutionResult,
      ...txRequest,
      toTx() {
        return this;
      },
    });
  }

  /**
   * @param {TxExecutionRequest} txRequest
   * @param {boolean} simulatePublic
   * @param {AztecAddress} [msgSender]
   * @param {boolean} [skipTxValidation]
   * @override
   */
  async simulateTx(txRequest, simulatePublic, msgSender, skipTxValidation) {
    return /** @type {any} */ ({
      simulatePublic,
      msgSender,
      skipTxValidation,
      ...txRequest,
    });
  }

  /**
   * @param {import("@aztec/aztec.js/entrypoint").ExecutionRequestInit} executions
   * @override
   */
  async createTxExecutionRequest(executions) {
    // forward data to `this.simulateTx`
    return /** @type {any} */ ({ executions });
  }
}

/**
 * @implements {AccountInterface}
 */
class Eip1193AccountInterface {
  /** @readonly @type {CompleteAddress} */
  #completeAddress;

  /** @readonly @type {NodeInfo} */
  #nodeInfo;

  /** @readonly @type {TypedEip1193Provider} */
  #eip1193Provider;

  /**
   * @param {CompleteAddress} address
   * @param {TypedEip1193Provider} rpc
   * @param {NodeInfo} nodeInfo
   */
  constructor(address, rpc, nodeInfo) {
    this.#completeAddress = address;
    this.#eip1193Provider = rpc;
    this.#nodeInfo = nodeInfo;
  }

  getCompleteAddress() {
    return this.#completeAddress;
  }

  /**
   *  @param {Fr} messageHash
   */
  async createAuthWit(messageHash) {
    await this.#eip1193Provider.request({
      method: "aztec_createAuthWitness",
      params: [
        {
          from: this.getAddress().toString(),
          messageHash: messageHash.toString(),
        },
      ],
    });
    return new AuthWitness(Fr.random(), []);
  }

  /**
   * @returns {Promise<TxExecutionRequest>}
   */
  async createTxExecutionRequest() {
    throw new Error("use account.sendTx");
  }

  getAddress() {
    return this.#completeAddress.address;
  }

  getChainId() {
    return new Fr(this.#nodeInfo.l1ChainId);
  }

  getVersion() {
    return new Fr(this.#nodeInfo.protocolVersion);
  }
}
