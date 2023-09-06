import "webextension-polyfill-global";

export class BadgeManager {
    public async set(text: string): Promise<void> {
        await browser.action.setBadgeText({text: text});
    }

    public async reset() {
        return this.set('');
    }
}