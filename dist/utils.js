export const SHIELDSWAP_WALLET_URL = typeof window !== "undefined" &&
    ["localhost:5183", "localhost:5185"].includes(window.location.host)
    ? "http://localhost:5184"
    : "https://wallet.shieldswap.org";
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
export async function accountFromCompleteAddress(provider, pxe, address) {
    const { Eip1193Account } = await import("./exports/eip1193.js");
    const nodeInfo = await pxe.getNodeInfo();
    return new Eip1193Account(address, provider, pxe, nodeInfo);
}
export function resolvePxe(getPxe) {
    const getPxe2 = lazyValue(typeof getPxe === "function" ? getPxe : () => getPxe);
    return lazyValue(async () => {
        const { waitForPXE } = await import("@aztec/aztec.js");
        const pxe = await getPxe2();
        await waitForPXE(pxe);
        return pxe;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQ2pDLE9BQU8sTUFBTSxLQUFLLFdBQVc7SUFDN0IsQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztJQUNsRSxDQUFDLENBQUMsdUJBQXVCO0lBQ3pCLENBQUMsQ0FBQywrQkFBK0IsQ0FBQztBQUVwQzs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsU0FBUyxDQUFDLEVBQWE7SUFDdEMsY0FBYztJQUNkLElBQUksS0FBVSxDQUFDO0lBQ2YsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLE9BQU8sR0FBRyxFQUFFO1FBQ1gsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2xCLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDbkIsS0FBSyxHQUFHLEVBQUUsRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQUVELE1BQU0sQ0FBQyxLQUFLLFVBQVUsMEJBQTBCLENBQy9DLFFBQThCLEVBQzlCLEdBQVEsRUFDUixPQUF3QjtJQUV4QixNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUNoRSxNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QyxPQUFPLElBQUksY0FBYyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFFRCxNQUFNLFVBQVUsVUFBVSxDQUFDLE1BQXNDO0lBQ2hFLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FDeEIsT0FBTyxNQUFNLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FDcEQsQ0FBQztJQUNGLE9BQU8sU0FBUyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQzNCLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sR0FBRyxHQUFHLE1BQU0sT0FBTyxFQUFFLENBQUM7UUFDNUIsTUFBTSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMifQ==