/** @import { SerializedFunctionCall, SerdeItem } from "./types.js" */
/**
 * @typedef Serde
 * @prop {SerdeItem<import("@aztec/aztec.js").FunctionCall, SerializedFunctionCall>} FunctionCall
 */
/**
 * @type {Serde}
 *
 * @deprecated TODO: think of a better way to do this (serialize as a string using ClassConverter)
 */
export const serde: Serde;
export type Serde = {
    FunctionCall: SerdeItem<import("@aztec/aztec.js").FunctionCall, SerializedFunctionCall>;
};
import type { SerializedFunctionCall } from "./types.js";
import type { SerdeItem } from "./types.js";
//# sourceMappingURL=serde.d.ts.map