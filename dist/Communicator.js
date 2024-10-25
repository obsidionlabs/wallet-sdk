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
            const popup = await this.waitForPopupLoaded();
            popup.postMessage(message, this.url.origin);
        };
        /**
         * Posts a request to the popup window and waits for a response
         */
        this.postRequestAndWaitForResponse = async (request) => {
            const responsePromise = this.onMessage(({ requestId }) => requestId === request.requestId);
            await this.postMessage(request);
            return await responsePromise;
        };
        /**
         * Listens for messages from the popup window that match a given predicate.
         */
        this.onMessage = async (predicate) => {
            return new Promise((resolve, reject) => {
                const listener = (event) => {
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
            if (this.popup && !this.popup.closed) {
                // In case the user un-focused the popup between requests, focus it again
                this.popup.focus();
                return this.popup;
            }
            this.popup = openPopup(this.url);
            if (!this.popup && this.fallbackOpenPopup) {
                console.log("failed to open, trying fallback");
                this.popup = await this.fallbackOpenPopup(() => openPopup(this.url));
            }
            if (!this.popup) {
                throw new Error("Failed to open popup: failed to load");
            }
            this.onMessage(({ event }) => event === "PopupUnload")
                .then(this.disconnect)
                .catch(() => { });
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const message = await this.onMessage(({ event }) => {
                    return event === "PopupLoaded";
                });
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
        this.url = new URL(params.url);
        this.fallbackOpenPopup = params.fallbackOpenPopup;
    }
}
const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 540;
// Window Management
export function openPopup(url) {
    const left = (window.innerWidth - POPUP_WIDTH) / 2 + window.screenX;
    const top = (window.innerHeight - POPUP_HEIGHT) / 2 + window.screenY;
    const popup = window.open(url, "Smart Wallet", `width=${POPUP_WIDTH}, height=${POPUP_HEIGHT}, left=${left}, top=${top}`);
    popup?.focus();
    return popup;
}
export function closePopup(popup) {
    if (popup && !popup.closed) {
        popup.close();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbXVuaWNhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0NvbW11bmljYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxTUFBcU07QUFFck07Ozs7Ozs7R0FPRztBQUNILE1BQU0sT0FBTyxZQUFZO0lBWXZCLFlBQVksTUFHWDtRQWJPLFVBQUssR0FBa0IsSUFBSSxDQUFDO1FBQzVCLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFHeEIsQ0FBQztRQWNKOztXQUVHO1FBQ0gsZ0JBQVcsR0FBRyxLQUFLLEVBQUUsT0FBZ0IsRUFBRSxFQUFFO1lBQ3ZDLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDOUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUM7UUFFRjs7V0FFRztRQUNILGtDQUE2QixHQUFHLEtBQUssRUFDbkMsT0FBZ0IsRUFDSixFQUFFO1lBQ2QsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FDcEMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEtBQUssT0FBTyxDQUFDLFNBQVMsQ0FDbkQsQ0FBQztZQUNGLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoQyxPQUFPLE1BQU0sZUFBZSxDQUFDO1FBQy9CLENBQUMsQ0FBQztRQUVGOztXQUVHO1FBQ0gsY0FBUyxHQUFHLEtBQUssRUFDZixTQUFxQyxFQUN6QixFQUFFO1lBQ2QsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDckMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxLQUFzQixFQUFFLEVBQUU7b0JBQzFDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU07d0JB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