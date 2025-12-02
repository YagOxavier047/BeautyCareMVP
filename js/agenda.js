document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. LÓGICA DARK MODE (NOVO!)
    // ==========================================
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;

    // Função para aplicar o tema
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

    // 1. Verificar preferência salva ao carregar
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // 2. Evento de Clique no botão
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }


    // ==========================================
    // 1. CONFIGURAÇÕES & SIDEBAR
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if(sidebarCollapse) {
        sidebarCollapse.addEventListener('click', () => sidebar.classList.toggle('active'));
    }

    const preSelectedService = sessionStorage.getItem('preSelectedService');
    if (preSelectedService) {
        const selectElement = document.querySelector('#bookingForm select');
        if(selectElement) {
            for (let i = 0; i < selectElement.options.length; i++) {
                if (selectElement.options[i].text === preSelectedService || selectElement.options[i].value === preSelectedService) {
                    selectElement.selectedIndex = i;
                    break;
                }
            }
            selectElement.classList.add('border-primary', 'shadow');
            setTimeout(() => selectElement.classList.remove('border-primary', 'shadow'), 2000);
        }
        sessionStorage.removeItem('preSelectedService');
    }

    // ==========================================
    // 2. VARIÁVEIS
    // ==========================================
    const apiKey = 'AwxkM+NAjWhPvUcRkCYcrw==PL26HNlrUQoqL7VY'; // ⚠️ CHAVE API
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

    // ==========================================
    // 3. API FERIADOS
    // ==========================================
    async function fetchHolidays() {
        try {
            const url = `https://api.api-ninjas.com/v1/holidays?country=BR`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                holidaysMap.clear();
                holidaysList = [];
                data.forEach(h => {
                    const datePT = h.date.split('-').reverse().join('/');
                    holidaysMap.add(datePT);
                    holidaysList.push([datePT, h.name]);
                });
                updateHolidayTable();
            }
        } catch (error) { console.error('Erro API:', error); }
        renderCalendar();
    }

    function updateHolidayTable() {
        if ($.fn.DataTable.isDataTable('#tabelaFeriados')) { $('#tabelaFeriados').DataTable().destroy(); }
        $('#tabelaFeriados').DataTable({
            data: holidaysList,
            columns: [{ title: "Data" }, { title: "Feriado" }],
            pageLength: 3, lengthChange: false, searching: false, info: false,
            language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json' }
        });
    }

    // ==========================================
    // 4. RENDERIZAR CALENDÁRIO
    // ==========================================
    function renderCalendar() {
        calendarGrid.querySelectorAll('.calendar-day, .empty-day').forEach(el => el.remove());
        const monthName = new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long' });
        currentMonthYear.textContent = `${monthName} ${currentYear}`.toUpperCase();

        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
        let adjustedIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

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

            if (holidaysMap.has(dayString)) {
                dayCell.classList.add('holiday');
                dayCell.innerHTML += `<br><small style="font-size:0.6em; color:#d32f2f; line-height:1;">Feriado</small>`;
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

    // ==========================================
    // 5. HORÁRIOS
    // ==========================================
    function generateTimeSlots() {
        hoursGrid.innerHTML = '';
        selectedTimeInput.value = '';
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
    // 6. SUBMIT
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