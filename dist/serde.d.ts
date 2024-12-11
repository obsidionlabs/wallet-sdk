import { FunctionCall } from "@aztec/circuit-types";
import { FunctionType } from "@aztec/foundation/abi";
export declare const serde: {
    FunctionCall: {
        serialize: (fc: FunctionCall) => Promise<{
            selector: string;
            name: string;
            type: FunctionType;
            isStatic: boolean;
            to: `0x${string}`;
            args: `0x${string}`[];
            returnTypes: import("@aztec/aztec.js").AbiType[];
        }>;
        deserialize: (fc: any) => Promise<FunctionCall>;
    };
};
//# sourceMappingURL=serde.d.ts.map