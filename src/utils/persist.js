const PREFIX = 'defects-center:'

export function save(key, value) {
    try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
    }
}

export function load(key, fallback) {
    try {
        const raw = localStorage.getItem(PREFIX + key)
        return raw ? JSON.parse(raw) : fallback
    } catch (e) {
        return fallback
    }
}

export function remove(key) {
    try {
        localStorage.removeItem(PREFIX + key)
    } catch (e) {
    }
}