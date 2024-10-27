// copied and adapted from CoinbaseWalletSdk: https://github.com/coinbase/coinbase-wallet-sdk/blob/bb531e34133fde40f53229966812b77a6e5a2626/packages/wallet-sdk/src/core/communicator/Communicator.ts
/**
 * Communicates with a wallet popup window for to send and receive messages.
 *
 * This class is responsible for opening a popup window, posting messages to it,
 * and listening for responses.
 *
 * It also handles cleanup of event listeners and the popup window itself when necessary.
 */
export class Communicator {
    constructor(params) {
        this.popup = null;
        this.listeners = new Map();
        /**
         * Posts a message to the popup window
         */
        this.postMessage = async (message) => {
            console.log("message in postMessage: ", message);
            const popup = await this.waitForPopupLoaded();
            console.log("popup: ", popup);
            console.log("this.url.origin: ", this.url.origin);
            popup.postMessage(message, this.url.origin);
        };
        /**
         * Posts a request to the popup window and waits for a response
         */
        this.postRequestAndWaitForResponse = async (request) => {
            console.log("postRequestAndWaitForResponse...");
            console.log("request id in postRequestAndWaitForResponse: ", request.requestId);
            if (typeof request?.data === "object" &&
                request?.data !== null &&
                "method" in request.data) {
                console.log("request.data.method in postRequestAndWaitForResponse: ", request.data.method);
            }
            console.log("request in postRequestAndWaitForResponse: ", request);
            const responsePromise = this.onMessage(({ requestId }) => requestId === request.requestId);
            console.log("responsePromise: ", responsePromise);
            await this.postMessage(request);
            console.log("...postMessage in postRequestAndWaitForResponse");
            return await responsePromise;
        };
        /**
         * Listens for messages from the popup window that match a given predicate.
         */
        this.onMessage = async (predicate) => {
            console.log("onMessage...");
            return new Promise((resolve, reject) => {
                const listener = (event) => {
                    console.log("event in listener: ", event);
                    if (event.origin !== this.url.origin)
                        return; // origin validation
                    const message = event.data;
                    if (predicate(message)) {
                        resolve(message);
                        window.removeEventListener("message", listener);
                        this.listeners.delete(listener);
                    }
                };
                window.addEventListener("message", listener);
                this.listeners.set(listener, { reject });
            });
        };
        /**
         * Closes the popup, rejects all requests and clears the listeners
         */
        this.disconnect = () => {
            // Note: keys popup handles closing itself. this is a fallback.
            closePopup(this.popup);
            this.popup = null;
            if (this.popupCloseInterval != null) {
                clearInterval(this.popupCloseInterval);
                this.popupCloseInterval = undefined;
            }
            this.listeners.forEach(({ reject }, listener) => {
                reject(new Error("Request rejected"));
                window.removeEventListener("message", listener);
            });
            this.listeners.clear();
        };
        /**
         * Waits for the popup window to fully load and then sends a version message.
         */
        this.waitForPopupLoaded = async () => {
            console.log("waitForPopupLoaded...");
            if (this.popup && !this.popup.closed) {
                // In case the user un-focused the popup between requests, focus it again
                this.popup.focus();
                return this.popup;
            }
            console.log("waitForPopupLoaded: 1");
            this.popup = openPopup(this.url);
            if (!this.popup && this.fallbackOpenPopup) {
                console.log("failed to open, trying fallback");
                this.popup = await this.fallbackOpenPopup(() => openPopup(this.url));
            }
            console.log("waitForPopupLoaded: 2");
            if (!this.popup) {
                throw new Error("Failed to open popup: failed to load");
            }
            console.log("waitForPopupLoaded: 3");
            this.onMessage(({ event }) => event === "PopupUnload")
                .then(this.disconnect)
                .catch(() => { });
            console.log("waitForPopupLoaded: 4");
            if (this.popupCloseInterval == null) {
                this.popupCloseInterval = setInterval(() => {
                    if (!this.popup || this.popup.closed) {
                        this.disconnect();
                    }
                }, 100);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pingInterval = setInterval(() => {
                if (!this.popup || this.popup.closed) {
                    clearInterval(pingInterval);
                    return;
                }
                this.popup.postMessage({ event: "PopupLoadedRequest" }, this.url.origin);
            }, 100);
            try {
                console.log("waitForPopupLoaded: 5");
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const message = await this.onMessage(({ event }) => {
                    return event === "PopupLoaded";
                });
                console.log("message in waitForPopupLoaded: ", message);
                console.log("waitForPopupLoaded: 6");
            }
            finally {
                clearInterval(pingInterval);
            }
            // await this.postMessage({
            //   requestId: message.id,
            //   data: {
            //     version: VERSION,
            //     metadata: this.metadata,
            //     preference: this.preference,
            //   },
            // });
            return this.popup;
        };
        console.log("Communicator constructor...");
        this.url = new URL(params.url);
        console.log("this.url: ", this.url);
        this.fallbackOpenPopup = params.fallbackOpenPopup;
    }
}
const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 540;
// Window Management
export function openPopup(url) {
    console.log("openPopup...");
    const left = (window.innerWidth - POPUP_WIDTH) / 2 + window.screenX;
    const top = (window.innerHeight - POPUP_HEIGHT) / 2 + window.screenY;
    console.log("left: ", left);
    console.log("top: ", top);
    const popup = window.open(url, "Smart Wallet", `width=${POPUP_WIDTH}, height=${POPUP_HEIGHT}, left=${left}, top=${top}`);
    popup?.focus();
    return popup;
}
export function closePopup(popup) {
    if (popup && !popup.closed) {
        popup.close();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbXVuaWNhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0NvbW11bmljYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxTUFBcU07QUFFck07Ozs7Ozs7R0FPRztBQUNILE1BQU0sT0FBTyxZQUFZO0lBWXhCLFlBQVksTUFHWDtRQWJPLFVBQUssR0FBa0IsSUFBSSxDQUFDO1FBQzVCLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFHeEIsQ0FBQztRQWdCSjs7V0FFRztRQUNILGdCQUFXLEdBQUcsS0FBSyxFQUFFLE9BQWdCLEVBQUUsRUFBRTtZQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2pELE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xELEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFDO1FBRUY7O1dBRUc7UUFDSCxrQ0FBNkIsR0FBRyxLQUFLLEVBQ3BDLE9BQWdCLEVBQ0gsRUFBRTtZQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztZQUNoRCxPQUFPLENBQUMsR0FBRyxDQUNWLCtDQUErQyxFQUMvQyxPQUFPLENBQUMsU0FBUyxDQUNqQixDQUFDO1lBRUYsSUFDQyxPQUFPLE9BQU8sRUFBRSxJQUFJLEtBQUssUUFBUTtnQkFDakMsT0FBTyxFQUFFLElBQUksS0FBSyxJQUFJO2dCQUN0QixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksRUFDdkIsQ0FBQztnQkFDRixPQUFP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