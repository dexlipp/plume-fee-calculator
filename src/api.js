// Список прокси-серверов для обхода CORS
const PROXY_SERVERS = [
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy/?quest=',
    'https://thingproxy.freeboard.io/fetch/'
];

// Текущий индекс прокси
let currentProxyIndex = 0;

// Функция для получения транзакций с таймаутами и ретраями
export async function fetchTransactions(address, progressCallback) {
    let lastError = null;
    
    // Пробуем все доступные прокси
    for (let i = 0; i < PROXY_SERVERS.length; i++) {
        const proxyUrl = PROXY_SERVERS[currentProxyIndex];
        const apiUrl = `https://explorer.plume.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&offset=10000`;
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // Увеличили таймаут до 15 секунд
            
            const response = await fetch(proxyUrl + encodeURIComponent(apiUrl), {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // Получаем данные потоком для отслеживания прогресса
            const reader = response.body.getReader();
            const contentLength = +response.headers.get('Content-Length');
            let receivedLength = 0;
            let chunks = [];
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                receivedLength += value.length;
                
                // Вызываем колбэк прогресса, если он предоставлен
                if (progressCallback && contentLength > 0) {
                    progressCallback(receivedLength, contentLength);
                }
            }
            
            // Собираем все чанки в единый Uint8Array
            const chunksAll = new Uint8Array(receivedLength);
            let position = 0;
            for (const chunk of chunks) {
                chunksAll.set(chunk, position);
                position += chunk.length;
            }
            
            // Конвертируем в строку
            const result = new TextDecoder("utf-8").decode(chunksAll);
            const data = JSON.parse(result);
            
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
