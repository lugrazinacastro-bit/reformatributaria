// ============================================
// REFORMA TRIBUTÁRIA - SCRIPT PRINCIPAL (ATUALIZADO)
// Carrega notícias de news.json em vez de usar mock estático
// ============================================

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
});

async function initializeApp() {
    await fetchNews(); // Aguarda o carregamento das notícias
    setupEventListeners(); // Depois configura os listeners
    startAutoRefresh();
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
            e.preventDefault();
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

async function fetchNews() {
    const container = document.getElementById('newsFeed');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">⏳ Carregando atualizações...</div>';

    try {
        // Tenta carregar o arquivo news.json
        const res = await fetch(`news.json?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Valida se é um array
        if (!Array.isArray(data)) throw new Error('Formato inválido');

        state.news = data.map(item => ({
            ...item,
            timestamp: new Date(item.date)
        })).sort((a, b) => b.timestamp - a.timestamp);

        console.log('✅ Notícias carregadas com sucesso:', state.news.length);

    } catch (err) {
        console.error('❌ Erro ao carregar notícias:', err);
        
        // Fallback: tenta usar um arquivo local ou dados alternativos
        if (!state.news || state.news.length === 0) {
            container.innerHTML = '<div class="loading" style="color: #ef4444;">⚠️ Erro ao carregar notícias. Verifique se o arquivo news.json existe no mesmo diretório.</div>';
            return false;
        }
    }

    renderNews();
    updateLastUpdate();
    return true;
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
    
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="loading">Nenhuma notícia encontrada.</div>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="news-item ${item.category}">
            <div class="news-header">
                <h3>${escapeHtml(item.title)}</h3>
                <span class="news-date">${formatDate(item.date)}</span>
            </div>
            <p>${escapeHtml(item.description || '')}</p>
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
    // Atualiza as notícias a cada 5 minutos (300.000 ms)
    if (state.autoRefreshInterval) clearInterval(state.autoRefreshInterval);
    state.autoRefreshInterval = setInterval(() => {
        fetchNews();
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
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// ANIMAÇÕES E EFEITOS
// ============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

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

console.log('%cReforma Tributária - Página de Atualizações (fetch news.json)', 'color: #1e3a5f; font-size: 16px; font-weight: bold;');
console.log('%cEC nº 132/2023 - LC nº 214/2025', 'color: #2563eb; font-size: 12px;');
console.log('Auto-refresh habilitado: a cada 5 minutos');
console.log('Notícias serão carregadas do arquivo news.json');
