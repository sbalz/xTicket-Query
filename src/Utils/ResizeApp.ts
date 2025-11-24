import client from './ZAFClient';

// Resize the app iframe based on the total height of visible child elements
export const resizeApp = (container?: HTMLElement) => {
    if (!container) {
        const root = document.getElementById('root');
        if (!root) return; // exit if root element is not found
        container = root;
    }

    // Sum the heights of all visible children
    const visibleHeight = Array.from(container.children).reduce(
        (acc, child) => {
            const el = child as HTMLElement;
            const style = getComputedStyle(el);
            if (style.display === 'none') return acc; // skip hidden elements
            return acc + el.offsetHeight;
        },
        0,
    );

    // Request the client to resize the iframe
    client?.invoke('resize', {height: visibleHeight});
};

// Optional: automatically resize when the container's content changes
let observer: ResizeObserver | null = null;
export const registerComponent = (container: HTMLElement) => {
    if (!observer) {
        observer = new ResizeObserver(() => resizeApp(container)); // observe changes and resize
    }
    observer.observe(container);
};
