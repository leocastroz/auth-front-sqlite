const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const baseURL = isLocalhost ? 'http://localhost:3000/' : 'https://auth-sqlite.fly.dev/';

let currentPage = 1;
const itemsPerPage = 3;
let products = [];
let userId;
let profileId;

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
        localStorage.setItem('user_id', data.userId);
        localStorage.setItem('baseImg', data.baseImg);
        localStorage.setItem('role', data.role);
        showToast('Login bem-sucedido!', 'success');
        const redirectPage = data.role === 'admin' ? 'dashboardadmin.html' : 'dashboard.html';
        setTimeout(() => {
            window.location.href = redirectPage;
        }, 1500);
    } else {
        showToast(data.message, 'error');
    }
}

async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    const response = await fetch(`${baseURL}register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, role }),
    });

    if (response.status === 201) {
        const data = await response.json();
        localStorage.setItem('auth', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', data.userId);
        localStorage.setItem('baseImg', data.baseImg);
        localStorage.setItem('role', data.role);
        showToast('Registro bem-sucedido!', 'success');
    } else {
        const data = await response.json();
        showToast(data.message, 'error');
    }
}

async function reset() {
    const username = document.getElementById('username').value;
    const newPassword = document.getElementById('newPassword').value;

    const response = await fetch(`${baseURL}reset-password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, newPassword }),
    });

    if (response.ok) {
        showToast('Senha alterada com sucesos!', 'success');
    } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
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
    localStorage.removeItem('user_id');
    localStorage.removeItem('baseImg');
    localStorage.removeItem('nickname');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
}

function displayUsername() {
    const username = localStorage.getItem('username');
    const baseImg = localStorage.getItem('baseImg');
    if (username) document.getElementById('welcome-message').textContent = `Bem-vindo, ${username}!`;
    if (baseImg) document.getElementById('profile-img').src = baseImg; 
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

function loadContent(page, element) {
    localStorage.getItem('role');
    const role = localStorage.getItem('role');
    fetch(page).then(response => response.text()).then(data => {
        document.getElementById('content').innerHTML = data;
        if (page === 'products.html') loadProducts();
        if (page === 'profileuser.html') loadUserProfile();
    }).catch(error => console.error('Error loading content:', error));
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
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${product.name}</td>
            <td>${product.value}</td>
            <td><button onclick="deleteProduct(${product.id})">Deletar</button></td>
        `;
        productList.appendChild(tr);
    }
}

async function deleteProduct(id) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${baseURL}products/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        }
    });

    if (response.status === 200) {
        showToast('Produto deletado com sucesso!', 'success');
        loadProducts();
    } else {
        const data = await response.json();
        showToast(data.message, 'error');
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

// Funções para carregar e salvar o perfil do usuário
async function loadUserProfile() {
    const token = localStorage.getItem('token');

    const response = await fetch(`${baseURL}user`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        }
    });

    if (response.ok) {
        const profile = await response.json();
        // console.log('profile ->', profile);
        document.getElementById('baseImg').value = profile.baseImg;
        document.getElementById('nickname').value = profile.nickname;

        profileId = profile.id;
        userId = profile.user_id;

        localStorage.setItem('baseImg', profile.baseImg);
        localStorage.setItem('nickname', profile.nickname);

        const profileButton = document.getElementById('profile-button');
        profileButton.textContent = 'Editar Perfil';
        profileButton.setAttribute('onclick', 'updateUserProfile()');
    } else {
        showToast('Erro ao carregar perfil', 'error');
    }
}


async function updateUserProfile() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    const baseImg = document.getElementById('baseImg').value;
    const nickname = document.getElementById('nickname').value;

    const response = await fetch(`${baseURL}users`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify({ user_id: userId, baseImg, nickname }),
    });

    if (response.status === 200) {
        showToast('Perfil atualizado com sucesso!', 'success');

        // Armazenar dados atualizados do perfil no localStorage
        localStorage.setItem('baseImg', baseImg);
        localStorage.setItem('nickname', nickname);

        // Redirecionar para dashboard.html para exibir os dados atualizados
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        const data = await response.json();
        showToast(data.message, 'error');
    }
}