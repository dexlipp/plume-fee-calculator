export function createWorker() {
    const workerCode = `
        self.onmessage = function(e) {
            const { transactions } = e.data;
            const fees = [];
            
            // Быстрый расчет комиссий
            for (const tx of transactions) {
                const gasUsed = parseInt(tx.gasUsed || '0');
                const gasPrice = parseInt(tx.gasPrice || '0');
                fees.push((gasUsed * gasPrice) / 1e18);
            }
            
            // Сортировка для медианы
            fees.sort((a, b) => a - b);
            
            // Расчет метрик
            const totalFee = fees.reduce((sum, fee) => sum + fee, 0);
            const txCount = fees.length;
            const avgFee = totalFee / txCount;
            const minFee = Math.min(...fees);
            const maxFee = Math.max(...fees);
            
            // Медиана
            const mid = Math.floor(txCount / 2);
            const medianFee = txCount % 2 !== 0 
                ? fees[mid] 
                : (fees[mid - 1] + fees[mid]) / 2;
            
            // Топ-5 дорогих транзакций
            const topFees = [...fees]
                .sort((a, b) => b - a)
                .slice(0, 5);
            
            // Группировка для графика
            const feeGroups = {
                low: fees.filter(f => f < medianFee).length,
                medium: fees.filter(f => f >= medianFee && f < medianFee * 3).length,
                high: fees.filter(f => f >= medianFee * 3).length
            };
            
            postMessage({
                totalFee,
                txCount,
                avgFee,
                minFee,
                maxFee,
                medianFee,
                topFees,
                feeGroups
            });
        };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    worker.onmessage = function(e) {
        import('./app.js').then(module => {
            module.displayResults(e.data);
        });
    };
    
    return worker;
}
