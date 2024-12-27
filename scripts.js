async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('https://auth-sqlite.fly.dev/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.auth) {
        localStorage.setItem('auth', 'true');
        localStorage.setItem('username', username);
        showToast('Login bem-sucedido!', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 3000);
    } else {
        showToast(data.message, 'error');
    }
}

async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch('https://auth-sqlite.fly.dev/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.status === 201) {
        localStorage.setItem('auth', 'true');
        localStorage.setItem('username', username);
        showToast('Registro bem-sucedido!', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 3000);
    } else {
        const data = await response.json();
        showToast(data.message, 'error');
    }
}

function checkAuth() {
    if (localStorage.getItem('auth') !== 'true') {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('auth');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

function displayUsername() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('welcome-message').textContent = `Bem-vindo, ${username}!`;
    }
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.className = 'toast show';
    toast.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    toast.textContent = message;
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}