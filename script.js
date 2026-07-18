// ============================================
// REFORMA TRIBUTÁRIA - SCRIPT PRINCIPAL
// ============================================

// Dados simulados de notícias (em produção, viria de uma API)
const mockNews = [
    {
        id: 1,
        title: "Fase de Testes 2026: Primeiras Orientações da Receita Federal",
        description: "A Receita Federal do Brasil divulga as primeiras orientações técnicas para a fase de testes de 2026. Contribuintes que emitem documentos fiscais devem se preparar para destacar CBS (0,9%) e IBS (0,1%) a partir de janeiro.",
        date: "2026-01-15",
        category: "cronograma",
        tags: ["Receita Federal", "2026", "Testes"]
    },
    {
        id: 2,
        title: "Simples Nacional: Adaptações para a Reforma Tributária",
        description: "Empresas enquadradas no Simples Nacional receberão diretrizes especiais de implementação. A alíquota será de 1% em 2026, com ajustes previstos para 2027.",
        date: "2026-01-10",
        category: "mudancas",
        tags: ["Simples Nacional", "Pequenas Empresas"]
    },
    {
        id: 3,
        title: "Comitê Gestor do IBS Divulga Cronograma de Implementação",
        description: "O novo Comitê Gestor do IBS apresenta um cronograma detalhado com responsabilidades de estados e municípios. Investimentos em infraestrutura fiscal são estimados em R$ 2 bilhões.",
        date: "2026-01-08",
        category: "cronograma",
        tags: ["IBS", "Comitê Gestor", "Implementação"]
    },
    {
        id: 4,
        title: "Cashback Tributário: Como Funciona o Benefício para Baixa Renda",
        description: "Pessoas físicas de baixa renda começarão a receber devolução de parte dos tributos pagos. Sistema será integrado ao CPF e processado via Receita Federal.",
        date: "2026-01-05",
        category: "impactos",
        tags: ["Cashback", "Benefícios", "Baixa Renda"]
    },
    {
        id: 5,
        title: "Extinção de PIS e COFINS em 2027: Transição Completa para CBS",
        description: "Em 2027, PIS e COFINS serão completamente extintos. A Contribuição sobre Bens e Serviços (CBS) entra em vigor com alíquota de aproximadamente 8,8%.",
        date: "2026-01-02",
        category: "tributos",
        tags: ["PIS", "COFINS", "CBS"]
    },
    {
        id: 6,
        title: "Impacto na Indústria: Reduções de Imposto sobre Produtos",
        description: "O IPI será reduzido a zero para a maioria dos produtos industrializados. Especialistas apontam potencial de reindustrialização do Brasil.",
        date: "2025-12-28",
        category: "impactos",
        tags: ["IPI", "Indústria", "Reindustrialização"]
    },
    {
        id: 7,
        title: "Sistemas Fiscais: Fabricantes Lançam Atualizações",
        description: "Grandes fornecedores de sistemas fiscais (ERP, NF-e) anunciam versões atualizadas para suportar CBS e IBS. Testes de integração já estão em andamento.",
        date: "2025-12-20",
        category: "mudancas",
        tags: ["Sistemas Fiscais", "NF-e", "Tecnologia"]
    },
    {
        id: 8,
        title: "Fim da 'Guerra Fiscal': Cobrança no Destino a partir de 2026",
        description: "Com a tributação no destino, estados perdem incentivos para atrair empresas com benefícios fiscais. Esperado fim da 'guerra fiscal' histórica entre unidades federativas.",
        date: "2025-12-15",
        category: "impactos",
        tags: ["Guerra Fiscal", "Federalismo", "Tributação"]
    }
];

// Estado global da aplicação
const state = {
    currentFilter: 'todos',
    news: [],
    autoRefreshInterval: null
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    startAutoRefresh();
});

function initializeApp() {
    loadNews();
    updateCountdown();
    updateTimestamps();
    setInterval(updateCountdown, 1000); // Atualiza countdown a cada segundo
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.currentFilter = e.target.dataset.filter;
            filterNews();
        });
    });
}

// ============================================
// CARREGAMENTO E FILTRAGEM DE NOTÍCIAS
// ============================================

function loadNews() {
    // Em produção, isso buscaria de uma API
    state.news = mockNews.map(item => ({
        ...item,
        timestamp: new Date(item.date)
    })).sort((a, b) => b.timestamp - a.timestamp);

    renderNews();
    updateLastUpdate();
}

function filterNews() {
    const container = document.getElementById('newsFeed');
    const filtered = state.currentFilter === 'todos' 
        ? state.news 
        : state.news.filter(news => news.category === state.currentFilter);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="loading">Nenhuma notícia encontrada nesta categoria.</div>';
        return;
    }

    renderNewsItems(filtered);
}

function renderNews() {
    const filtered = state.currentFilter === 'todos' 
        ? state.news 
        : state.news.filter(news => news.category === state.currentFilter);
    renderNewsItems(filtered);
}

function renderNewsItems(items) {
    const container = document.getElementById('newsFeed');
    
    container.innerHTML = items.map(item => `
        <div class="news-item ${item.category}">
            <div class="news-header">
                <h3>${escapeHtml(item.title)}</h3>
                <span class="news-date">${formatDate(item.date)}</span>
            </div>
            <p>${escapeHtml(item.description)}</p>
            <div class="news-tags">
                ${item.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
        </div>
    `).join('');

    // Trigger animation
    container.querySelectorAll('.news-item').forEach((item, index) => {
        item.style.animation = `fadeIn 0.4s ease ${index * 0.05}s both`;
    });
}

// ============================================
// CONTAGEM REGRESSIVA
// ============================================

function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    // Primeira etapa de testes: Janeiro de 2026
    const target = new Date('2026-01-01').getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference < 0) {
        countdownElement.textContent = '✅ Fase iniciada!';
        countdownElement.style.color = '#10b981';
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    countdownElement.textContent = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// ============================================
// ATUALIZAÇÃO DE TIMESTAMPS
// ============================================

function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = `Última atualização: ${timeString}`;
    }

    const footerUpdateElement = document.getElementById('footerUpdate');
    if (footerUpdateElement) {
        footerUpdateElement.textContent = getRelativeTime(now);
    }
}

function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins}m`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays}d`;
    
    return date.toLocaleDateString('pt-BR');
}

// ============================================
// AUTO-REFRESH
// ============================================

function startAutoRefresh() {
    // Atualiza a página a cada 5 minutos (300.000 ms)
    state.autoRefreshInterval = setInterval(() => {
        loadNews();
        updateLastUpdate();
        showNotification('📰 Notícias atualizadas!');
    }, 300000); // 5 minutos
}

function showNotification(message) {
    // Cria notificação de toast
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// UTILIDADES
// ============================================

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;

    return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// ANIMAÇÕES E EFEITOS
// ============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(400px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }
`;
document.head.appendChild(style);

// ============================================
// SERVICE WORKER PARA NOTIFICAÇÕES (Opcional)
// ============================================

if ('serviceWorker' in navigator && 'Notification' in window) {
    window.addEventListener('load', () => {
        // Registra service worker para notificações em background
        // navigator.serviceWorker.register('sw.js').catch(err => {
        //     console.log('SW registration failed:', err);
        // });

        // Solicita permissão para notificações
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    });
}

// ============================================
// LOGGING E DEBUG
// ============================================

console.log('%cReforma Tributária - Página de Atualizações', 'color: #1e3a5f; font-size: 16px; font-weight: bold;');
console.log('%cEC nº 132/2023 - LC nº 214/2025', 'color: #2563eb; font-size: 12px;');
console.log('Auto-refresh habilitado: a cada 5 minutos');
console.log('Total de notícias carregadas:', mockNews.length);
