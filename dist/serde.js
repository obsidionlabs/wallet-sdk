/** @import { SerializedFunctionCall, SerdeItem } from "./types.js" */
import { FunctionType } from "@aztec/foundation/abi";
FunctionType;
// /**
//  * @typedef Serde
//  * @prop {SerdeItem<import("@aztec/aztec.js").FunctionCall, SerializedFunctionCall>} FunctionCall
//  */
// /**
//  * @type {Serde}
//  *
//  * @deprecated TODO: think of a better way to do this (serialize as a string using ClassConverter)
//  */
export const serde = {
    FunctionCall: {
        serialize: async (fc) => ({
            selector: fc.selector.toString(),
            name: fc.name,
            type: fc.type,
            isStatic: fc.isStatic,
            to: fc.to.toString(),
            args: fc.args.map((fr) => fr.toString()),
            returnTypes: fc.returnTypes,
        }),
        deserialize: async (fc) => {
            const { Fr, AztecAddress, FunctionSelector } = await import("@aztec/aztec.js");
            return {
                selector: FunctionSelector.fromString(fc.selector),
                name: fc.name,
                type: fc.type,
                isStatic: fc.isStatic == "true",
                to: AztecAddress.fromString(fc.to),
                args: fc.args.map((fr) => Fr.fromString(fr)),
                returnTypes: fc.returnTypes,
            };
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2VyZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsc0VBQXNFO0FBR3RFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVyRCxZQUFZLENBQUM7QUFFYixNQUFNO0FBQ04sb0JBQW9CO0FBQ3BCLG9HQUFvRztBQUNwRyxNQUFNO0FBRU4sTUFBTTtBQUNOLG1CQUFtQjtBQUNuQixLQUFLO0FBQ0wscUdBQXFHO0FBQ3JHLE1BQU07QUFDTixNQUFNLENBQUMsTUFBTSxLQUFLLEdBQUc7SUFDcEIsWUFBWSxFQUFFO1FBQ2IsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTtZQUNoQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUk7WUFDYixJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUk7WUFDYixRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVE7WUFDckIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFO1lBQ3BCLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3hDLFdBQVcsRUFBRSxFQUFFLENBQUMsV0FBVztTQUMzQixDQUFDO1FBQ0YsV0FBVyxFQUFFLEtBQUssRUFBRSxFQUFPLEVBQUUsRUFBRTtZQUM5QixNQUFNLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUMxRCxpQkFBaUIsQ0FDakIsQ0FBQztZQUNGLE9BQU87Z0JBQ04sUUFBUSxFQUFFLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDO2dCQUNsRCxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUk7Z0JBQ2IsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJO2dCQUNiLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxJQUFJLE1BQU07Z0JBQy9CLEVBQUUsRUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQVUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDcEQsV0FBVyxFQUFFLEVBQUUsQ0FBQyxXQUFXO2FBQ1gsQ0FBQztRQUNuQixDQUFDO0tBQ0Q7Q0FDRCxDQUFDIn0=