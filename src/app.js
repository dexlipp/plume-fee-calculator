import { fetchTransactions } from './api.js';
import { createWorker } from './worker.js';
import { renderChart } from './chart.js';
import { 
    sanitizeInput, 
    showError, 
    showSuccess 
} from './utils.js';
import { 
    getCachedResult, 
    cacheResult 
} from './cache.js';
import { 
    addToHistory, 
    loadHistory, 
    clearHistory 
} from './history.js';

// Примеры адресов для демонстрации
const EXAMPLE_ADDRESSES = [
    '0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5',
    '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE'
];

let feeWorker = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Установка случайного адреса для примера
    const randomAddress = EXAMPLE_ADDRESSES[Math.floor(Math.random() * EXAMPLE_ADDRESSES.length)];
    document.getElementById('address').placeholder = randomAddress;
    
    // Обработчик для кнопки расчета
    document.getElementById('calculateBtn').addEventListener('click', calculateFees);
    
    // Обработчик для клавиши Enter
    document.getElementById('address').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculateFees();
        }
    });
    
    // Обработчик для очистки истории
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
    
    // Загрузка истории
    loadHistory();
    
    // Создание Web Worker
    feeWorker = createWorker();
});

// Основная функция расчета
async function calculateFees() {
    let address = document.getElementById('address').value.trim();
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const errorElement = document.getElementById('error');
    const successElement = document.getElementById('success');
    const resultSection = document.getElementById('resultSection');
    const calculateBtn = document.getElementById('calculateBtn');
    
    // Защита от XSS
    address = sanitizeInput(address);
    
    if (!address || !address.startsWith('0x') || address.length !== 42) {
        showError('Введите корректный адрес кошелька (начинается с 0x, 42 символа)');
        return;
    }
    
    // Проверка кэша
    const cachedData = getCachedResult(address);
    if (cachedData) {
        showSuccess('Данные загружены из кэша');
        displayResults(cachedData);
        return;
    }
    
    // Сброс состояния
    errorElement.style.display = 'none';
    successElement.style.display = 'none';
    resultSection.style.display = 'none';
    progressContainer.style.display = 'block';
    calculateBtn.disabled = true;
    
    try {
        const updateProgress = (percent, text) => {
            progressBar.style.width = `${percent}%`;
            progressText.textContent = text;
        };
        
        updateProgress(10, 'Подключение к блокчейну...');
        
        const transactions = await fetchTransactions(address);
        const totalTx = transactions.length;
        
        if (totalTx === 0) {
            throw new Error("Для этого адреса не найдено транзакций");
        }
        
        updateProgress(30, `Обработка ${totalTx} транзакций...`);
        
        // Отправляем данные в Web Worker
        feeWorker.postMessage({ transactions });
        
        // Добавляем в историю
        addToHistory(address);
        
    } catch (err) {
        showError(err.message || 'Произошла ошибка при расчете комиссий');
        console.error("Ошибка:", err);
        progressContainer.style.display = 'none';
        calculateBtn.disabled = false;
    }
}

// Отображение результатов
function displayResults(data) {
    const {
        totalFee, 
        txCount, 
        avgFee, 
        maxFee, 
        medianFee,
        topFees,
        feeGroups
    } = data;
    
    // Обновление UI
    document.getElementById('totalFee').textContent = `${totalFee.toFixed(8)} PLUME`;
    document.getElementById('txCount').textContent = txCount;
    document.getElementById('avgFee').textContent = avgFee.toFixed(8) + ' PLUME';
    document.getElementById('medianFee').textContent = medianFee.toFixed(8) + ' PLUME';
    document.getElementById('maxFee').textContent = maxFee.toFixed(8) + ' PLUME';
    
    // Топ транзакций
    const topFeesList = document.getElementById('topFees');
    topFeesList.innerHTML = '';
    
    topFees.forEach((fee, index) => {
        const item = document.createElement('div');
        item.className = 'top-fee-item';
        item.innerHTML = `<b>#${index + 1}:</b> ${fee.toFixed(8)} PLUME`;
        topFeesList.appendChild(item);
    });
    
    // График
    renderChart(feeGroups);
    
    // Показываем результат
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('calculateBtn').disabled = false;
    
    // Кэшируем результат
    cacheResult(document.getElementById('address').value.trim(), data);
}

// Очистка воркера при закрытии страницы
window.addEventListener('beforeunload', () => {
    if (feeWorker) {
        feeWorker.terminate();
    }
});

// Экспорт для модулей
export { displayResults };
