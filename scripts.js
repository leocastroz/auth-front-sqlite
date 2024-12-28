const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const baseURL = isLocalhost ? 'http://localhost:3000/' : 'https://auth-sqlite.fly.dev/';

let currentPage = 1;
const itemsPerPage = 3;
let products = [];

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${baseURL}login`, {
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
        localStorage.setItem('token', data.token);
        showToast('Login bem-sucedido!', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showToast(data.message, 'error');
    }
}

async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch(`${baseURL}register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.status === 201) {
        const data = await response.json();
        localStorage.setItem('auth', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('token', data.token);
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
    localStorage.removeItem('token');
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
    if (toast) {
        toast.className = 'toast show';
        toast.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
        toast.textContent = message;
        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    } else {
        console.error('Elemento toast não encontrado');
    }
}

function loadContent(page) {
    fetch(page)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
            if (page === 'products.html') {
                loadProducts();
            }
        })
        .catch(error => console.error('Error loading content:', error));
}

async function createProduct(name, value) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${baseURL}products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify({ name, value }),
    });

    if (response.status === 201) {
        showToast('Produto criado com sucesso!', 'success');
        loadProducts();
    } else {
        const data = await response.json();
        showToast(data.message, 'error');
    }
}

async function getProducts() {
    const token = localStorage.getItem('token');

    const response = await fetch(`${baseURL}products`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        }
    });

    if (response.ok) {
        products = await response.json();
        return products;
    } else {
        showToast('Erro ao obter produtos', 'error');
        return [];
    }
}

async function loadProducts() {
    await getProducts();
    displayProducts();
}

function displayProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, products.length);

    for (let i = startIndex; i < endIndex; i++) {
        const product = products[i];
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i + 1}</td><td>${product.name}</td><td>${product.value}</td>`;
        productList.appendChild(tr);
    }
}

function nextPage() {
    if (currentPage * itemsPerPage < products.length) {
        currentPage++;
        displayProducts();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayProducts();
    }
}

function addProduct() {
    const name = document.getElementById('product-name').value;
    const value = document.getElementById('product-value').value;
    createProduct(name, value);
}