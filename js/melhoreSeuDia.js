document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. CONFIGURAÇÕES VISUAIS (Dark Mode & Sidebar)
    // ==========================================
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;
    const sidebar = document.getElementById('sidebar');
    const sidebarCollapse = document.getElementById('sidebarCollapse');

    // Sidebar Toggle
    if(sidebarCollapse) sidebarCollapse.addEventListener('click', () => sidebar.classList.toggle('active'));

    // Dark Mode Logic
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            if(icon) icon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
        } else {
            body.removeAttribute('data-theme');
            if(icon) icon.classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
        }
    }
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const newTheme = current === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // ==========================================
    // 2. INTEGRAÇÃO API ADVICE SLIP
    // ==========================================
    const adviceText = document.getElementById('adviceText');
    const btnNewAdvice = document.getElementById('btnNewAdvice');
    const loadingState = document.getElementById('loadingState');
    const quoteContent = document.getElementById('quoteContent');

    async function fetchAdvice() {
        // UI: Mostra carregando / esconde texto
        loadingState.classList.remove('d-none');
        quoteContent.classList.add('d-none'); // Esconde temporariamente para efeito visual

        try {
            // Adicionamos timestamp para evitar cache do navegador e da API
            const response = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`);
            
            if (!response.ok) throw new Error('Erro na conexão');

            const data = await response.json();
            
            // Atualiza o texto
            adviceText.textContent = `"${data.slip.advice}"`;

        } catch (error) {
            console.error(error);
            adviceText.textContent = "Não foi possível buscar um conselho agora. Tente novamente.";
        } finally {
            // UI: Esconde carregando / mostra texto
            loadingState.classList.add('d-none');
            quoteContent.classList.remove('d-none');
        }
    }

    // Evento do Botão
    if(btnNewAdvice) {
        btnNewAdvice.addEventListener('click', fetchAdvice);
    }

    // Busca o primeiro conselho ao carregar a página
    fetchAdvice();
});