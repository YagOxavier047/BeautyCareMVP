document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. DARK MODE & SIDEBAR (PRIORIDADE ALTA)
    // ==========================================
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;
    const sidebar = document.getElementById('sidebar');
    const sidebarCollapse = document.getElementById('sidebarCollapse');

    // Sidebar Toggle
    if(sidebarCollapse) {
        sidebarCollapse.addEventListener('click', () => sidebar.classList.toggle('active'));
    }

    // Função Aplicar Tema
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            if(icon) {
                icon.classList.remove('bi-moon-stars-fill');
                icon.classList.add('bi-sun-fill');
            }
        } else {
            body.removeAttribute('data-theme');
            if(icon) {
                icon.classList.remove('bi-sun-fill');
                icon.classList.add('bi-moon-stars-fill');
            }
        }
    }

    // Aplicar ao iniciar
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Evento de Clique
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const newTheme = current === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Recarrega a página para atualizar as cores do gráfico
            setTimeout(() => window.location.reload(), 200); 
        });
    }


    // ==========================================
    // 2. GERADOR DE DADOS DE TESTE (SE VAZIO)
    // ==========================================
    let appointments = JSON.parse(localStorage.getItem('salonAppointments')) || [];

    if (appointments.length === 0) {
        console.log("Banco vazio. Gerando dados de teste...");
        
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        const todayStr = `${d}/${m}/${y}`; // Ex: 05/12/2025

        const mockData = [
            { id: 1, date: todayStr, time: '09:00', service: 'Corte de Cabelo', professional: 'MOKA Team', status: 'Concluído' },
            { id: 2, date: todayStr, time: '10:00', service: 'Unhas das mãos', professional: 'Ana Silva', status: 'Agendado' },
            { id: 3, date: todayStr, time: '14:00', service: 'Progressiva', professional: 'MOKA Team', status: 'Agendado' },
            { id: 4, date: '01/12/2025', time: '11:00', service: 'Unhas dos pés', professional: 'Carla Dias', status: 'Concluído' },
            { id: 5, date: '02/12/2025', time: '15:00', service: 'Luzes', professional: 'MOKA Team', status: 'Concluído' },
            { id: 6, date: '03/12/2025', time: '16:00', service: 'Escova', professional: 'MOKA Team', status: 'Concluído' },
            { id: 7, date: '05/12/2025', time: '09:00', service: 'Maquiagem', professional: 'Beatriz Lima', status: 'Agendado' }
        ];

        localStorage.setItem('salonAppointments', JSON.stringify(mockData));
        appointments = mockData;
        alert("⚠️ Dados de teste gerados! O Dashboard será atualizado.");
    }


    // ==========================================
    // 3. TABELA DE PREÇOS (COM COMPATIBILIDADE)
    // ==========================================
    const prices = {
        // Novos Nomes
        'Corte de Cabelo': 60,
        'Escova': 45,
        'Progressiva': 250,
        'Botox Capilar': 180,
        'Alisamento': 200,
        'Luzes': 350,
        'Penteados': 120,
        'Cílios': 90,
        'Sobrancelha': 35,
        'Maquiagem': 150,
        'Unhas das mãos': 40,
        'Unhas dos pés': 45,
        'Pacote Completo': 150,
        
        // Nomes Antigos (Fallback para dados velhos não darem erro)
        'Manicure': 40,
        'Pedicure': 45,
        'Corte Masculino': 50
    };

    // Data de Hoje para comparações
    const todayObj = new Date();
    const tDay = String(todayObj.getDate()).padStart(2, '0');
    const tMonth = String(todayObj.getMonth() + 1).padStart(2, '0');
    const tYear = todayObj.getFullYear();
    const todayStr = `${tDay}/${tMonth}/${tYear}`;


    // ==========================================
    // 4. CÁLCULOS ESTATÍSTICOS
    // ==========================================
    let countToday = 0;
    let countTotalCompleted = 0;
    let revenue = 0;
    
    // Gráfico: Domingo(0) a Sábado(6)
    const weekCounts = [0, 0, 0, 0, 0, 0, 0]; 

    appointments.forEach(app => {
        // Proteção contra dados corrompidos
        if (!app.date || !app.service) return;

        // 1. Contar Hoje
        if (app.date === todayStr && app.status !== 'Cancelado') {
            countToday++;
        }

        // 2. Receita (Apenas Concluídos)
        if (app.status === 'Concluído') {
            countTotalCompleted++;
            let price = prices[app.service] || 50; // Usa 50 se não achar o preço
            revenue += price;
        }

        // 3. Dados do Gráfico
        if (app.status !== 'Cancelado') {
            const parts = app.date.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Mês 0-11
                const year = parseInt(parts[2], 10);
                
                const dateObj = new Date(year, month, day);
                let dayIndex = dateObj.getDay(); // 0(Dom) a 6(Sáb)
                
                // Ajuste: Gráfico começa na Segunda (0=Seg, ..., 6=Dom)
                let chartIndex = dayIndex === 0 ? 6 : dayIndex - 1;
                
                if (chartIndex >= 0 && chartIndex <= 6) {
                    weekCounts[chartIndex]++;
                }
            }
        }
    });

    // Atualiza HTML
    const elToday = document.getElementById('statToday');
    if(elToday) elToday.textContent = countToday;

    const elCompleted = document.getElementById('statTotalCompleted');
    if(elCompleted) elCompleted.textContent = countTotalCompleted;

    const elRevenue = document.getElementById('statRevenue');
    if(elRevenue) elRevenue.textContent = `R$ ${revenue.toLocaleString('pt-BR')}`;


    // ==========================================
    // 5. LISTA DE PRÓXIMOS
    // ==========================================
    const upcomingList = document.getElementById('upcomingList');
    if (upcomingList) {
        // Filtra "Agendado" e pega os top 4
        const upcoming = appointments
            .filter(app => app.status === 'Agendado')
            .slice(0, 4);

        if(upcoming.length > 0) {
            upcomingList.innerHTML = '';
            upcoming.forEach(app => {
                const item = document.createElement('div');
                // Estilo compatível com Dark Mode
                item.className = 'p-3 border rounded d-flex justify-content-between align-items-center mb-2 bg-light-subtle';
                
                // Ajuste manual de cor para o item da lista
                if (body.getAttribute('data-theme') === 'dark') {
                    item.classList.remove('bg-light-subtle');
                    item.classList.add('bg-dark', 'border-secondary');
                }

                item.innerHTML = `
                    <div>
                        <h6 class="fw-bold mb-1">${app.service}</h6>
                        <small class="text-muted"><i class="bi bi-person me-1"></i> ${app.professional}</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-warning text-dark mb-1">Agendado</span>
                        <div class="fw-bold small text-primary">${app.time}</div>
                    </div>
                `;
                upcomingList.appendChild(item);
            });
        } else {
            upcomingList.innerHTML = '<div class="text-center text-muted mt-4">Nenhum agendamento futuro.</div>';
        }
    }


    // ==========================================
    // 6. GRÁFICO CHART.JS
    // ==========================================
    const ctx = document.getElementById('weeklyChart');
    if (ctx) {
        const isDark = body.getAttribute('data-theme') === 'dark';
        const barColor = '#9C27B0'; 
        const gridColor = isDark ? '#444' : '#e0e0e0';
        const textColor = isDark ? '#ccc' : '#666';

        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Atendimentos',
                    data: weekCounts,
                    backgroundColor: barColor,
                    borderRadius: 6,
                    barThickness: 25,
                    maxBarThickness: 35
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor, borderDash: [5, 5] },
                        ticks: { stepSize: 1, color: textColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });
    }
});