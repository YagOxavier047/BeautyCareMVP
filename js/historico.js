document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. CONFIGURAÇÕES & SIDEBAR
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if(sidebarCollapse) {
        sidebarCollapse.addEventListener('click', () => sidebar.classList.toggle('active'));
    }

    // ==========================================
    // 2. ELEMENTOS DA DOM
    // ==========================================
    const upcomingContainer = document.getElementById('upcomingContainer');
    const historyBody = document.getElementById('historyBody');
    
    // Modal de Cancelamento
    const cancelModalElement = document.getElementById('cancelModal');
    const cancelModal = new bootstrap.Modal(cancelModalElement);
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const cancelIdInput = document.getElementById('cancelIdInput');


    // ==========================================
    // 3. RECUPERAR E COMBINAR DADOS
    // ==========================================
    
    // Dados Fictícios (Histórico Antigo)
    const mockPastData = [
        { id: 1, date: '10/11/2025', time: '14:00', service: 'Corte de Cabelo', professional: 'Ana Silva', status: 'Concluído' },
        { id: 2, date: '05/10/2025', time: '09:00', service: 'Manicure', professional: 'Carla Dias', status: 'Concluído' },
        { id: 3, date: '20/09/2025', time: '16:00', service: 'Pacote Completo', professional: 'MOKA Team', status: 'Cancelado' }
    ];

    // Dados Reais (Novos, vindos do LocalStorage)
    let storedAppointments = JSON.parse(localStorage.getItem('salonAppointments')) || [];

    // Função Principal de Renderização
    function renderHistory() {
        historyBody.innerHTML = '';
        upcomingContainer.innerHTML = '';
        let hasUpcoming = false;

        // Combina as listas para exibição (Reais + Fictícios)
        const allAppointments = [...storedAppointments, ...mockPastData];

        allAppointments.forEach(app => {
            
            // --- SEPARAÇÃO POR STATUS ---
            
            if (app.status === 'Agendado') {
                // >>>> PRÓXIMOS AGENDAMENTOS (Cartões)
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
                                <p class="card-text mb-1 fs-5 fw-bold text-dark">
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
                // >>>> HISTÓRICO PASSADO (Tabela)
                const row = document.createElement('tr');
                
                // Badges de Status
                let statusBadge = '';
                if(app.status === 'Concluído') {
                    statusBadge = '<span class="badge bg-success bg-opacity-10 text-success border border-success">Concluído</span>';
                } else if(app.status === 'Cancelado') {
                    statusBadge = '<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">Cancelado</span>';
                }

                // Botão de Repetir Serviço
                // Envia o nome do serviço (ex: 'Corte') para a função global
                const actionBtn = app.status === 'Concluído' 
                    ? `<button class="btn btn-sm btn-outline-primary fw-bold" onclick="repetirServico('${app.service}')">
                         <i class="bi bi-arrow-repeat"></i> Repetir
                       </button>` 
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

        // Mensagem caso não tenha agendamentos futuros
        if(!hasUpcoming) {
            upcomingContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-light border text-center py-5">
                        <i class="bi bi-calendar-x text-muted display-4 mb-3"></i>
                        <h5 class="text-muted">Nenhum agendamento futuro.</h5>
                        <p class="mb-3 text-muted small">Que tal marcar um horário para cuidar de você?</p>
                        <a href="agenda.html" class="btn btn-primary px-4 fw-bold">Agendar Agora</a>
                    </div>
                </div>`;
        }
    }


    // ==========================================
    // 4. LÓGICA DE CANCELAMENTO (REGRA 48H)
    // ==========================================
    
    // Função chamada ao clicar em "Cancelar" no card
    window.verificarRegraCancelamento = function(id, dateStr, timeStr) {
        // Formato esperado: dateStr="DD/MM/YYYY", timeStr="HH:mm"
        
        const [day, month, year] = dateStr.split('/');
        const [hour, minute] = timeStr.split(':');
        
        // Cria objeto Date do agendamento (Mês no JS começa em 0)
        const appointmentDate = new Date(year, month - 1, day, hour, minute);
        const now = new Date();

        // Calcula diferença em milissegundos
        const diffMs = appointmentDate - now;
        // Converte para horas
        const diffHours = diffMs / (1000 * 60 * 60);

        console.log(`Horas para o atendimento: ${diffHours.toFixed(2)}`);

        // REGRA: Se faltar MENOS de 48h, bloqueia.
        if (diffHours < 48) {
            // Se já passou da data (negativo) ou está muito perto
            let msg = diffHours < 0 
                ? "Este agendamento já passou da data." 
                : `Faltam apenas ${Math.floor(diffHours)} horas para o atendimento.`;

            alert(`🚫 Cancelamento não permitido.\n\n${msg}\nNossa política exige cancelamento com no mínimo 48 horas de antecedência.`);
            return;
        }

        // Se passou na regra, abre o Modal de confirmação
        cancelIdInput.value = id;
        cancelModal.show();
    };

    // Ação do botão "Confirmar Cancelamento" DENTRO do Modal
    confirmCancelBtn.addEventListener('click', () => {
        const idToCancel = Number(cancelIdInput.value);

        // Procura no array de agendamentos reais
        const index = storedAppointments.findIndex(app => app.id === idToCancel);

        if (index !== -1) {
            // Atualiza o status para 'Cancelado'
            storedAppointments[index].status = 'Cancelado';
            
            // Salva de volta no LocalStorage
            localStorage.setItem('salonAppointments', JSON.stringify(storedAppointments));
            
            // UI Feedback
            cancelModal.hide();
            alert('✅ Agendamento cancelado com sucesso!');
            
            // Atualiza a tela
            renderHistory();
        } else {
            // Caso tente cancelar um dado "Mock" (fictício) que não está no localStorage
            alert('Erro: Não é possível cancelar agendamentos de exemplo/histórico antigo.');
            cancelModal.hide();
        }
    });


    // ==========================================
    // 5. LÓGICA DE REPETIR SERVIÇO
    // ==========================================
    window.repetirServico = function(serviceName) {
        // Salva na memória temporária
        sessionStorage.setItem('preSelectedService', serviceName);
        // Redireciona
        window.location.href = 'agenda.html';
    };

    // Inicializa a tela
    renderHistory();
});