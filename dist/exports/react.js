import { useEffect, useState } from "react";
export function useAccount(wallet) {
    const [account, setAccount] = useState(undefined);
    useEffect(() => {
        const unsubscribe = wallet.accountObservable.subscribe((account) => {
            setAccount(account);
        });
        return () => unsubscribe();
    }, []);
    return account;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXhwb3J0cy9yZWFjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUk1QyxNQUFNLFVBQVUsVUFBVSxDQUFDLE1BQTJCO0lBQ3JELE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUE2QixTQUFTLENBQUMsQ0FBQztJQUU5RSxTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2QsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2xFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sR0FBRyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDNUIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRVAsT0FBTyxPQUFPLENBQUM7QUFDaEIsQ0FBQyJ9