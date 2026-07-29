// ============================================
// REFORMA TRIBUTÁRIA - SCRIPT PRINCIPAL
// Sistema de notícias funcional e interativo
// ============================================

let state = {
    currentFilter: 'todos',
    news: [],
    autoRefreshInterval: null
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando aplicação...');
    initializeApp();
});

async function initializeApp() {
    console.log('📋 Carregando notícias...');
    
    // Carrega as notícias
    await fetchNews();
    
    // Configura listeners após notícias carregarem
    if (state.news && state.news.length > 0) {
        setupEventListeners();
        console.log('✅ Event listeners configurados');
    }
    
    // Inicia funcionalidades
    startAutoRefresh();
    updateCountdown();
    updateTimestamps();
    
    // Atualiza countdown a cada segundo
    setInterval(updateCountdown, 1000);
    setInterval(updateTimestamps, 60000);
}

// ============================================
// CARREGAMENTO DE NOTÍCIAS
// ============================================

async function fetchNews() {
    const container = document.getElementById('newsFeed');
    
    try {
        // Mostra loading
        container.innerHTML = '<div class="loading">⏳ Carregando atualizações...</div>';
        
        // Fetch com cache-busting
        const response = await fetch('news.json?t=' + Date.now());
        
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Formato de dados inválido');
        }
        
        // Processa dados
        state.news = data.map(item => ({
            ...item,
            timestamp: new Date(item.date)
        })).sort((a, b) => b.timestamp - a.timestamp);
        
        console.log('✅ Notícias carregadas:', state.news.length);
        
        // Renderiza notícias
        renderNews();
        updateLastUpdate();
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao carregar notícias:', error);
        container.innerHTML = `
            <div class="loading" style="color: #ef4444;">
                ⚠️ Erro ao carregar notícias<br>
                <small>${error.message}</small>
            </div>
        `;
        return false;
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    if (navBtns.length === 0) {
        console.warn('⚠️ Nenhum botão de navegação encontrado');
        return;
    }
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active de todos
            navBtns.forEach(b => b.classList.remove('active'));
            
            // Adiciona active ao clicado
            this.classList.add('active');
            
            // Filtra por categoria
            state.currentFilter = this.dataset.filter;
            console.log('🔍 Filtrando por:', state.currentFilter);
            
            filterNews();
        });
    });
    
    console.log('🎯 ' + navBtns.length + ' botões de navegação configurados');
}

// ============================================
// FILTRAGEM DE NOTÍCIAS
// ============================================

function filterNews() {
    const filtered = getFilteredNews();
    
    if (filtered.length === 0) {
        document.getElementById('newsFeed').innerHTML = 
            '<div class="loading">Nenhuma notícia encontrada nesta categoria</div>';
        return;
    }
    
    renderNewsItems(filtered);
}

function getFilteredNews() {
    if (state.currentFilter === 'todos') {
        return state.news;
    }
    
    return state.news.filter(news => news.category === state.currentFilter);
}

// ============================================
// RENDERIZAÇÃO DE NOTÍCIAS
// ============================================

function renderNews() {
    const filtered = getFilteredNews();
    renderNewsItems(filtered);
}

function renderNewsItems(items) {
    const container = document.getElementById('newsFeed');
    
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="loading">Nenhuma notícia encontrada</div>';
        return;
    }
    
    const html = items.map((item, index) => `
        <div class="news-item ${item.category}" style="animation-delay: ${index * 0.05}s">
            <div class="news-header">
                <div>
                    <h3>${escapeHtml(item.title)}</h3>
                    <span class="news-date">${formatDate(item.date)}</span>
                </div>
            </div>
            
            <p class="news-description">${escapeHtml(item.description || '')}</p>
            
            <div class="news-tags">
                ${item.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
            
            <div class="news-footer">
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-link">
                    Leia a matéria completa →
                </a>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
    
    // Adiciona animation
    container.querySelectorAll('.news-item').forEach(item => {
        item.classList.add('fadeIn');
    });
}

// ============================================
// CONTAGEM REGRESSIVA
// ============================================

function updateCountdown() {
    const element = document.getElementById('countdown');
    if (!element) return;
    
    const target = new Date('2026-01-01').getTime();
    const now = new Date().getTime();
    const diff = target - now;
    
    if (diff <= 0) {
        element.textContent = '✅ Fase iniciada!';
        element.style.color = '#10b981';
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    element.textContent = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;
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
    
    const lastUpdate = document.getElementById('lastUpdate');
    if (lastUpdate) {
        lastUpdate.textContent = `Última atualização: ${timeString}`;
    }
    
    const footerUpdate = document.getElementById('footerUpdate');
    if (footerUpdate) {
        footerUpdate.textContent = getRelativeTime(now);
    }
}

function updateTimestamps() {
    updateLastUpdate();
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
    if (state.autoRefreshInterval) {
        clearInterval(state.autoRefreshInterval);
    }
    
    state.autoRefreshInterval = setInterval(() => {
        console.log('🔄 Atualizando notícias...');
        fetchNews();
        showNotification('📰 Notícias atualizadas!');
    }, 300000); // 5 minutos
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============================================
// FUNÇÕES UTILITÁRIAS
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
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// ESTILOS DINÂMICOS
// ============================================

const styles = document.createElement('style');
styles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    }
    
    .fadeIn {
        animation: fadeIn 0.4s ease forwards !important;
    }
    
    .news-link {
        display: inline-block;
        margin-top: 10px;
        padding: 10px 15px;
        background: #2563eb;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        transition: all 0.3s ease;
        font-size: 0.95rem;
    }
    
    .news-link:hover {
        background: #1e40af;
        transform: translateX(3px);
    }
    
    .news-footer {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #e2e8f0;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(400px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
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
`;
document.head.appendChild(styles);

// ============================================
// DEBUG
// ============================================

console.log('%cReforma Tributária - Página de Atualizações', 'color: #1e3a5f; font-size: 16px; font-weight: bold;');
console.log('%cEC nº 132/2023 - LC nº 214/2025', 'color: #2563eb; font-size: 12px;');
console.log('📱 Página totalmente funcional e interativa');
