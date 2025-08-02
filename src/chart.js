let chart = null;

// Визуализация данных
export function renderChart(feeGroups) {
    const ctx = document.getElementById('feeChart').getContext('2d');
    
    // Удаляем предыдущий график
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Низкие', 'Средние', 'Высокие'],
            datasets: [{
                data: [feeGroups.low, feeGroups.medium, feeGroups.high],
                backgroundColor: [
                    '#2ecc71',
                    '#f39c12',
                    '#e74c3c'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw} транзакций`;
                        }
                    }
                }
            }
        }
    });
}
