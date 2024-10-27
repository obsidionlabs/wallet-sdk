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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXhwb3J0cy9yZWFjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUk1QyxNQUFNLFVBQVUsVUFBVSxDQUFDLE1BQXdCO0lBQ2xELE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUNyQyxTQUFTLENBQ1QsQ0FBQztJQUVGLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDZCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDbEUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM1QixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFUCxPQUFPLE9BQU8sQ0FBQztBQUNoQixDQUFDIn0=