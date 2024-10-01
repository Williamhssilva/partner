const API_URL = 'https://immediate-zesty-place.glitch.me';

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage('Registro bem-sucedido!', 'success');
            localStorage.setItem('token', data.token);
            showUserProfile(data.data.user);
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Erro ao conectar com o servidor', 'error');
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage('Login bem-sucedido!', 'success');
            localStorage.setItem('token', data.token);
            fetchUserProfile();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Erro ao conectar com o servidor', 'error');
    }
}

async function fetchUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Usuário não autenticado', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            showUserProfile(data.data.user);
        } else {
            showMessage(data.message, 'error');
            logout();
        }
    } catch (error) {
        showMessage('Erro ao obter perfil do usuário', 'error');
    }
}

function showUserProfile(user) {
    document.getElementById('authForms').style.display = 'none';
    document.getElementById('userProfile').style.display = 'block';
    document.getElementById('userName').textContent = `Nome: ${user.name}`;
    document.getElementById('userEmail').textContent = `Email: ${user.email}`;
    document.getElementById('userRole').textContent = `Função: ${user.role}`;
}

function logout() {
    localStorage.removeItem('token');
    document.getElementById('authForms').style.display = 'block';
    document.getElementById('userProfile').style.display = 'none';
    showMessage('Logout realizado com sucesso', 'success');
}

function showMessage(message, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = type;
}

// Verificar se o usuário já está logado ao carregar a página
window.onload = fetchUserProfile;