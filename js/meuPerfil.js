document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. DARK MODE & SIDEBAR (Padrão das outras telas)
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
    // 2. CARREGAR DADOS DO USUÁRIO
    // ==========================================
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Se não tiver logado, manda pro login (Segurança básica)
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Preencher HTML
    document.getElementById('headerUserName').textContent = `Olá, ${currentUser.name.split(' ')[0]}`; // Só o primeiro nome
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone || '(Sem telefone)';

    // ==========================================
    // 3. CARREGAR HISTÓRICO E ESTATÍSTICAS
    // ==========================================
    
    // Dados Fictícios (Mock Data) para não ficar vazio no começo
    const mockData = [
        { id: 99, date: '10/11/2025', time: '14:00', service: 'Corte de Cabelo', status: 'Concluído' },
        { id: 98, date: '20/09/2025', time: '16:00', service: 'Manicure', status: 'Cancelado' }
    ];

    // Dados Reais do LocalStorage
    const realAppointments = JSON.parse(localStorage.getItem('salonAppointments')) || [];

    // Junta tudo
    const allData = [...realAppointments, ...mockData];

    // Elementos de Contadores
    let countScheduled = 0;
    let countCompleted = 0;
    let countCancelled = 0;

    const tableBody = document.getElementById('profileTableBody');
    tableBody.innerHTML = '';

    allData.forEach(app => {
        // Contagem para Estatísticas
        if (app.status === 'Agendado') countScheduled++;
        else if (app.status === 'Concluído') countCompleted++;
        else if (app.status === 'Cancelado') countCancelled++;

        // Renderizar Linha na Tabela
        const row = document.createElement('tr');
        
        // Define cor do badge
        let badgeClass = 'bg-primary';
        if (app.status === 'Concluído') badgeClass = 'bg-success';
        if (app.status === 'Cancelado') badgeClass = 'bg-secondary';

        row.innerHTML = `
            <td class="ps-4">
                <strong>${app.date}</strong>
                <div class="small text-muted">${app.time}</div>
            </td>
            <td>${app.service}</td>
            <td><span class="badge ${badgeClass}">${app.status}</span></td>
        `;
        tableBody.appendChild(row);
    });

    // Atualiza os números nos cards
    document.getElementById('countScheduled').textContent = countScheduled;
    document.getElementById('countCompleted').textContent = countCompleted;
    document.getElementById('countCancelled').textContent = countCancelled;

});