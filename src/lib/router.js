// NexoPro — SPA Router (hash-based)
const routes = {};
let currentRoute = null;

export function addRoute(path, handler) {
    routes[path] = handler;
}

export function navigate(path) {
    window.location.hash = path;
}

export function getParams() {
    const hash = window.location.hash.slice(1);
    const [path, query] = hash.split('?');
    const params = {};
    if (query) {
        query.split('&').forEach(pair => {
            const [key, val] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(val || '');
        });
    }
    return { path, params };
}

export function initRouter() {
    const handleRoute = () => {
        const { path, params } = getParams();
        const route = path || '/';
        const handler = routes[route] || routes['/404'] || routes['/'];
        if (handler) {
            currentRoute = route;
            handler(params);
        }
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}
