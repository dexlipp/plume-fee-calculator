// Кэширование результатов
export function cacheResult(address, data) {
    try {
        const cache = JSON.parse(localStorage.getItem('plumeCache') || '{}');
        cache[address] = {
            ...data,
            timestamp: Date.now()
        };
        localStorage.setItem('plumeCache', JSON.stringify(cache));
    } catch (e) {
        console.error('Ошибка кэширования:', e);
    }
}

export function getCachedResult(address) {
    try {
        const cache = JSON.parse(localStorage.getItem('plumeCache') || '{}');
        const cachedData = cache[address];
        
        if (cachedData && (Date.now() - cachedData.timestamp) < 86400000) {
            return cachedData;
        }
    } catch (e) {
        console.error('Ошибка чтения кэша:', e);
    }
    return null;
}
