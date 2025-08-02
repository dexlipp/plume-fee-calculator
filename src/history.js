// Работа с историей
export function addToHistory(address) {
    try {
        const history = JSON.parse(localStorage.getItem('addressHistory') || []);
        
        // Удаляем дубликаты
        const newHistory = [
            address,
            ...history.filter(addr => addr !== address)
        ].slice(0, 10);
        
        localStorage.setItem('addressHistory', JSON.stringify(newHistory));
        loadHistory();
    } catch (e) {
        console.error('Ошибка сохранения истории:', e);
    }
}

export function loadHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('addressHistory') || []);
        const historyList = document.getElementById('historyList');
        const historySection = document.getElementById('historySection');
        
        if (history.length > 0) {
            historySection.style.display = 'block';
            historyList.innerHTML = '';
            
            history.forEach(address => {
                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `<span>${address}</span><span><i class="fas fa-search"></i></span>`;
                
                item.addEventListener('click', () => {
                    document.getElementById('address').value = address;
                    document.getElementById('calculateBtn').click();
                });
                
                historyList.appendChild(item);
            });
        } else {
            historySection.style.display = 'none';
        }
    } catch (e) {
        console.error('Ошибка загрузки истории:', e);
    }
}

export function clearHistory() {
    localStorage.removeItem('addressHistory');
    document.getElementById('historySection').style.display = 'none';
    document.getElementById('success').innerHTML = 
        '<i class="fas fa-check-circle"></i> История очищена';
    document.getElementById('success').style.display = 'block';
}
