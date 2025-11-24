import client from './ZAFClient';

let resizeTimeout: number | null = null;

export const resizeApp = (container?: HTMLElement) => {
    const el = container || document.getElementById('root');
    if (!el) return;

    const totalHeight = el.scrollHeight + 16;

    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(
        () => client?.invoke('resize', {height: totalHeight}),
        50,
    );
};

export const registerComponent = (container: HTMLElement) => {
    if (!container) return;

    const observer = new MutationObserver(() => resizeApp(container));
    observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true,
    });

    resizeApp(container);
};
