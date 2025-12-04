document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. DARK MODE & SIDEBAR
    // ==========================================
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;
    const sidebar = document.getElementById('sidebar');
    const sidebarCollapse = document.getElementById('sidebarCollapse');

    if(sidebarCollapse) sidebarCollapse.addEventListener('click', () => sidebar.classList.toggle('active'));

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
    // 2. AUTO-UPDATE
    // ==========================================
    function checkExpiredAppointments() {
        let stored = JSON.parse(localStorage.getItem('salonAppointments')) || [];
        const now = new Date();
        let updated = false;
        stored.forEach(app => {
            if (app.status === 'Agendado') {
                const [day, month, year] = app.date.split('/');
                const [hour, minute] = app.time.split(':');
                const appDate = new Date(year, month - 1, day, hour, minute);
                if (appDate < now) {
                    app.status = 'Concluído';
                    updated = true;
                }
            }
        });
        if (updated) localStorage.setItem('salonAppointments', JSON.stringify(stored));
    }
    checkExpiredAppointments();

    // ==========================================
    // 3. RENDERIZAÇÃO
    // ==========================================
    const upcomingContainer = document.getElementById('upcomingContainer');
    const historyBody = document.getElementById('historyBody');
    const cancelModal = new bootstrap.Modal(document.getElementById('cancelModal'));
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const cancelIdInput = document.getElementById('cancelIdInput');

    const mockPastData = [
        { id: 1, date: '10/11/2025', time: '14:00', service: 'Corte de Cabelo', professional: 'Ana Silva', status: 'Concluído' },
        { id: 2, date: '05/10/2025', time: '09:00', service: 'Manicure', professional: 'Carla Dias', status: 'Concluído' },
        { id: 3, date: '20/09/2025', time: '16:00', service: 'Pacote Completo', professional: 'MOKA Team', status: 'Cancelado' }
    ];

    let storedAppointments = JSON.parse(localStorage.getItem('salonAppointments')) || [];

    function renderHistory() {
        historyBody.innerHTML = '';
        upcomingContainer.innerHTML = '';
        let hasUpcoming = false;
        const allAppointments = [...storedAppointments, ...mockPastData];

        allAppointments.forEach(app => {
            if (app.status === 'Agendado') {
                hasUpcoming = true;
                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-4';
                col.innerHTML = `
                    <div class="card border-primary border-start border-4 shadow-sm h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                <h5 class="card-title fw-bold text-primary text-truncate mb-0">${app.service}</h5>
                                <span class="badge bg-primary align-self-center">Agendado</span>
                            </div>
                            <div class="mb-3">
                                <p class="card-text mb-1 fs-5 fw-bold text-reset">
                                    <i class="bi bi-calendar-event me-2 text-muted"></i>${app.date}
                                </p>
                                <p class="card-text text-muted">
                                    <i class="bi bi-clock me-2"></i>${app.time} hrs
                                </p>
                            </div>
                            <div class="alert alert-light border p-2 mb-3">
                                <small class="text-muted"><i class="bi bi-person-badge me-1"></i> Profissional: <strong>${app.professional}</strong></small>
                            </div>
                            <button class="btn btn-outline-danger btn-sm w-100 fw-bold py-2" 
                                    onclick="verificarRegraCancelamento(${app.id}, '${app.date}', '${app.time}')">
                                <i class="bi bi-x-circle me-1"></i> Cancelar Agendamento
                            </button>
                        </div>
                    </div>
                `;
                upcomingContainer.appendChild(col);
            } else {
                const row = document.createElement('tr');
                let statusBadge = '';
                if(app.status === 'Concluído') statusBadge = '<span class="badge bg-success bg-opacity-10 text-success border border-success">Concluído</span>';
                else if(app.status === 'Cancelado') statusBadge = '<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">Cancelado</span>';
                
                const actionBtn = app.status === 'Concluído' 
                    ? `<button class="btn btn-sm btn-outline-primary fw-bold" onclick="repetirServico('${app.service}')"><i class="bi bi-arrow-repeat"></i> Repetir</button>` 
                    : '<span class="text-muted small">-</span>';

                row.innerHTML = `
                    <td class="ps-4 fw-bold">${app.date} <br> <small class="text-muted fw-normal">${app.time}</small></td>
                    <td>${app.service}</td>
                    <td>${app.professional}</td>
                    <td>${statusBadge}</td>
                    <td class="text-end pe-4">${actionBtn}</td>
                `;
                historyBody.appendChild(row);
            }
        });

        if(!hasUpcoming) {
            upcomingContainer.innerHTML = `
                <div class="col-12"><div class="alert alert-light border text-center py-5">
                    <i class="bi bi-calendar-x text-muted display-4 mb-3"></i>
                    <h5 class="text-muted">Nenhum agendamento futuro.</h5>
                    <a href="agenda.html" class="btn btn-primary px-4 fw-bold">Agendar Agora</a>
                </div></div>`;
        }
    }

    // --- REGRA 48H CANCELAMENTO ---
    window.verificarRegraCancelamento = function(id, dateStr, timeStr) {
        const [day, month, year] = dateStr.split('/');
        const [hour, minute] = timeStr.split(':');
        const appointmentDate = new Date(year, month - 1, day, hour, minute);
        const diffHours = (appointmentDate - new Date()) / (1000 * 60 * 60);

        if (diffHours < 48) {
            alert(`🚫 Cancelamento não permitido. Faltam apenas ${Math.floor(diffHours)} horas.`);
            return;
        }
        cancelIdInput.value = id;
        cancelModal.show();
    };

    confirmCancelBtn.addEventListener('click', () => {
        const idToCancel = Number(cancelIdInput.value);
        const index = storedAppointments.findIndex(app => app.id === idToCancel);
        if (index !== -1) {
            storedAppointments[index].status = 'Cancelado';
            localStorage.setItem('salonAppointments', JSON.stringify(storedAppointments));
            cancelModal.hide();
            renderHistory();
        }
    });

    window.repetirServico = function(serviceName) {
        sessionStorage.setItem('preSelectedService', serviceName);
        window.location.href = 'agenda.html';
    };

    renderHistory();
});