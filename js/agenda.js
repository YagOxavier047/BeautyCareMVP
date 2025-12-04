document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // TRADUÇÃO DATATABLES (PT-BR)
    // ==========================================
    const dataTablePTBR = {
        "sEmptyTable": "Nenhum registro encontrado",
        "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
        "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
        "sInfoFiltered": "(Filtrados de _MAX_ registros)",
        "sLengthMenu": "_MENU_ resultados por página",
        "sLoadingRecords": "Carregando...",
        "sProcessing": "Processando...",
        "sZeroRecords": "Nenhum registro encontrado",
        "sSearch": "Pesquisar",
        "oPaginate": {
            "sNext": "Próximo",
            "sPrevious": "Anterior",
            "sFirst": "Primeiro",
            "sLast": "Último"
        }
    };

    // ==========================================
    // 0. AUTO-UPDATE & DARK MODE
    // ==========================================
    function updateAppointmentStatus() {
        let stored = JSON.parse(localStorage.getItem('salonAppointments')) || [];
        const now = new Date();
        let hasChanges = false;
        stored.forEach(app => {
            if (app.status === 'Agendado') {
                const [day, month, year] = app.date.split('/');
                const [hour, minute] = app.time.split(':');
                const appDate = new Date(year, month - 1, day, hour, minute);
                if (appDate < now) {
                    app.status = 'Concluído';
                    hasChanges = true;
                }
            }
        });
        if (hasChanges) localStorage.setItem('salonAppointments', JSON.stringify(stored));
    }
    updateAppointmentStatus();

    // Dark Mode
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;

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

    const sidebar = document.getElementById('sidebar');
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if(sidebarCollapse) sidebarCollapse.addEventListener('click', () => sidebar.classList.toggle('active'));

    const preSelectedService = sessionStorage.getItem('preSelectedService');
    if (preSelectedService) {
        const select = document.querySelector('#bookingForm select');
        if(select) {
            // Varre options e optgroups
            const options = select.getElementsByTagName('option');
            for (let i = 0; i < options.length; i++) {
                if (options[i].text === preSelectedService || options[i].value === preSelectedService) {
                    select.value = options[i].value; // Seleciona pelo valor
                    break;
                }
            }
        }
        sessionStorage.removeItem('preSelectedService');
    }

    // ==========================================
    // 1. CONFIGURAÇÕES & API
    // ==========================================
    const apiKey = 'AwxkM+NAjWhPvUcRkCYcrw==PL26HNlrUQoqL7VY'; 
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const inputDate = document.getElementById('inputDate');
    const hoursGrid = document.getElementById('hoursGrid');
    const selectedTimeInput = document.getElementById('selectedTime');
    
    let date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    let holidaysMap = new Set();
    let holidaysList = [];

    async function fetchHolidays() {
        try {
            const url = `https://api.api-ninjas.com/v1/holidays?country=BR`;
            const res = await fetch(url, { headers: { 'X-Api-Key': apiKey } });
            if (res.ok) {
                const data = await res.json();
                holidaysMap.clear(); holidaysList = [];
                data.forEach(h => {
                    const d = h.date.split('-').reverse().join('/');
                    holidaysMap.add(d); holidaysList.push([d, h.name]);
                });
                updateHolidayTable();
            }
        } catch (e) { console.error(e); }
        renderCalendar();
    }

    function updateHolidayTable() {
        if ($.fn.DataTable.isDataTable('#tabelaFeriados')) $('#tabelaFeriados').DataTable().destroy();
        $('#tabelaFeriados').DataTable({
            data: holidaysList, 
            columns: [{title:"Data"}, {title:"Feriado"}],
            pageLength: 3, 
            lengthChange: false, 
            searching: false, 
            info: false,
            language: dataTablePTBR 
        });
    }

    // ==========================================
    // 2. CALENDÁRIO
    // ==========================================
    function renderCalendar() {
        calendarGrid.querySelectorAll('.calendar-day, .empty-day').forEach(el => el.remove());
        const monthName = new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long' });
        currentMonthYear.textContent = `${monthName} ${currentYear}`.toUpperCase();

        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
        let adjustedIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        const today = new Date();
        today.setHours(0,0,0,0);

        for (let i = 0; i < adjustedIndex; i++) {
            const empty = document.createElement('div');
            empty.classList.add('empty-day');
            calendarGrid.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.innerHTML = `<span class="fs-5">${day}</span>`;
            
            const dayString = `${String(day).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`;
            const dateCheck = new Date(currentYear, currentMonth, day);
            dateCheck.setHours(0,0,0,0);

            const isHoliday = holidaysMap.has(dayString);
            const isPast = dateCheck < today;

            if (isPast) {
                dayCell.classList.add('past');
                dayCell.title = "Indisponível (Passado)";
            } else if (isHoliday) {
                dayCell.classList.add('holiday');
                dayCell.innerHTML += `<br><small style="font-size:0.6em">Feriado</small>`;
            } else {
                dayCell.addEventListener('click', () => {
                    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
                    dayCell.classList.add('selected');
                    inputDate.value = dayString;
                    generateTimeSlots();
                });
            }
            calendarGrid.appendChild(dayCell);
        }
    }

    function generateTimeSlots() {
        hoursGrid.innerHTML = ''; selectedTimeInput.value = '';
        for (let h = 9; h <= 20; h++) {
            const time = `${String(h).padStart(2, '0')}:00`;
            const btn = document.createElement('button');
            btn.type = 'button'; btn.className = 'time-btn'; btn.textContent = time;
            btn.onclick = () => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedTimeInput.value = time;
            };
            hoursGrid.appendChild(btn);
        }
    }

    // ==========================================
    // 3. SUBMIT
    // ==========================================
    const bookingForm = document.getElementById('bookingForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingState = document.getElementById('loadingState');
    const successState = document.getElementById('successState');
    const receiptModal = new bootstrap.Modal(document.getElementById('receiptModal'));
    const modalService = document.getElementById('modalService');
    const modalDate = document.getElementById('modalDate');
    const modalTime = document.getElementById('modalTime');
    const inputService = bookingForm.querySelector('select');

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(!selectedTimeInput.value) { alert('Selecione um horário!'); return; }

        const newAppointment = {
            id: Date.now(),
            date: inputDate.value,
            time: selectedTimeInput.value,
            service: inputService.options[inputService.selectedIndex].text,
            professional: 'MOKA Team',
            status: 'Agendado'
        };

        const stored = JSON.parse(localStorage.getItem('salonAppointments')) || [];
        stored.push(newAppointment);
        localStorage.setItem('salonAppointments', JSON.stringify(stored));

        loadingOverlay.classList.remove('d-none');
        loadingState.classList.remove('d-none');
        successState.classList.add('d-none');

        setTimeout(() => {
            loadingState.classList.add('d-none');
            successState.classList.remove('d-none');
            setTimeout(() => {
                loadingOverlay.classList.add('d-none');
                modalService.textContent = newAppointment.service;
                modalDate.textContent = newAppointment.date;
                modalTime.textContent = newAppointment.time;
                receiptModal.show();
            }, 1500);
        }, 2000);
    });

    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--; if(currentMonth < 0) { currentMonth = 11; currentYear--; } fetchHolidays();
    });
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++; if(currentMonth > 11) { currentMonth = 0; currentYear++; } fetchHolidays();
    });

    fetchHolidays();
});