document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DARK MODE (Aplicar Tema Salvo) ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
    
    // ==========================================
    // 1. FUNÇÕES AUXILIARES (UI)
    // ==========================================

    // Função para alternar a visibilidade da senha (olhinho)
    function setupPasswordToggle(toggleId, inputId) {
        const toggleBtn = document.getElementById(toggleId);
        const inputField = document.getElementById(inputId);

        if (toggleBtn && inputField) {
            toggleBtn.addEventListener('click', () => {
                // Troca o tipo do input entre 'password' e 'text'
                const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
                inputField.setAttribute('type', type);
                
                // Alterna o ícone (Bootstrap Icons)
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.classList.toggle('bi-eye');
                    icon.classList.toggle('bi-eye-slash');
                }
            });
        }
    }

    // Configura os botões de ver senha para as duas telas
    setupPasswordToggle('togglePassword', 'password');       // Tela de Login
    setupPasswordToggle('toggleRegPassword', 'regPassword'); // Tela de Cadastro


    // ==========================================
    // 2. LÓGICA DE LOGIN
    // ==========================================
    
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const msgArea = document.getElementById('msgArea');

            // Recupera lista de utilizadores do LocalStorage
            const users = JSON.parse(localStorage.getItem('salonUsers')) || [];
            
            // Procura o usuário na lista
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // --- CENÁRIO: CLIENTE ENCONTRADO ---
                
                // Salva a sessão do utilizador atual
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                msgArea.innerHTML = '<div class="alert alert-success">Login realizado com sucesso! Redirecionando...</div>';
                
                setTimeout(() => {
                    // CLIENTE vai para a Agenda (Página Principal)
                    window.location.href = 'agenda.html';
                }, 1500);

            } else {
                // --- CENÁRIO: ADMIN (BACKDOOR/TESTE) ---
                if(email === 'admin@moka.com' && password === 'admin123') {
                     const adminUser = { name: 'Admin', email: 'admin@moka.com', role: 'admin' };
                     localStorage.setItem('currentUser', JSON.stringify(adminUser));
                     
                     msgArea.innerHTML = '<div class="alert alert-success">Bem-vindo Admin! Redirecionando...</div>';
                     
                     setTimeout(() => {
                         // ADMIN vai para o Dashboard de Gestão
                         window.location.href = 'dashboard.html';
                     }, 1500);
                } else {
                    // --- CENÁRIO: ERRO ---
                    msgArea.innerHTML = '<div class="alert alert-danger">E-mail ou senha incorretos.</div>';
                }
            }
        });
    }


    // ==========================================
    // 3. LÓGICA DE CADASTRO (REGISTRO)
    // ==========================================

    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('regName').value.trim();
            const phone = document.getElementById('regPhone').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const msgArea = document.getElementById('msgAreaRegister');

            // Recupera utilizadores existentes
            const users = JSON.parse(localStorage.getItem('salonUsers')) || [];

            // Verifica duplicidade de e-mail
            const emailExists = users.some(u => u.email === email);

            if (emailExists) {
                msgArea.innerHTML = '<div class="alert alert-warning">Este e-mail já está cadastrado.</div>';
                return;
            }

            // Cria novo objeto de utilizador
            const newUser = {
                id: Date.now(),
                name: name,
                phone: phone,
                email: email,
                password: password, // Obs: Em app real, usar hash/criptografia
                role: 'client'      // Perfil padrão
            };

            // Salva no LocalStorage
            users.push(newUser);
            localStorage.setItem('salonUsers', JSON.stringify(users));

            msgArea.innerHTML = '<div class="alert alert-success">Cadastro realizado! Redirecionando para o login...</div>';

            // Redireciona para o login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

});