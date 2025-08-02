// Список прокси-серверов для обхода CORS
const PROXY_SERVERS = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy/?quest='
];

// Текущий индекс прокси
let currentProxyIndex = 0;

// Функция для получения транзакций с таймаутами и ретраями
export async function fetchTransactions(address) {
    let lastError = null;
    
    // Пробуем все доступные прокси
    for (let i = 0; i < PROXY_SERVERS.length; i++) {
        const proxyUrl = PROXY_SERVERS[currentProxyIndex];
        const apiUrl = `https://explorer.plume.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&offset=10000`;
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
            const response = await fetch(proxyUrl + encodeURIComponent(apiUrl), {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== "1") {
                throw new Error(data.message || "Ошибка API");
            }
            
            return data.result || [];
            
        } catch (error) {
            console.error(`Ошибка при использовании прокси ${currentProxyIndex}:`, error);
            lastError = error;
            currentProxyIndex = (currentProxyIndex + 1) % PROXY_SERVERS.length;
        }
    }
    
    throw lastError || new Error("Не удалось загрузить данные");
}
