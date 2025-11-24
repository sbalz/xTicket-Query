import client from './ZAFClient';

export const resizeApp = (container?: HTMLElement) => {
    if (!container) {
        const root = document.getElementById('root');
        if (!root) return;
        container = root;
    }

    const totalHeight = container.scrollHeight + 16; // buffer
    client?.invoke('resize', {height: totalHeight});
};

let observer: ResizeObserver | null = null;
export const registerComponent = (container: HTMLElement) => {
    if (!observer) observer = new ResizeObserver(() => resizeApp(container));
    observer.observe(container);
};
