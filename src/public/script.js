const socket = io();
let token = localStorage.getItem('token');
let currentUser = null;

const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const usernameSpan = document.getElementById('username');
const todoList = document.getElementById('todo-list');

if (token) {
  fetchUserData();
  fetchTodos();
  showApp();
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.token) {
      token = data.token;
      localStorage.setItem('token', token);
      currentUser = username;
      usernameSpan.textContent = username;
      fetchTodos();
      showApp();
      alert(data.message || 'Ro‘yxatdan o‘tish muvaffaqiyatli');
    } else {
      alert(data.message || data.error || 'Ro‘yxatdan o‘tishda xato');
    }
  } catch (error) {
    alert('Xato yuz berdi: ' + error.message);
  }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.token) {
      token = data.token;
      localStorage.setItem('token', token);
      currentUser = username;
      usernameSpan.textContent = username;
      fetchTodos();
      showApp();
      alert(data.message || 'Kirish muvaffaqiyatli');
    } else {
      alert(data.message || data.error || 'Kirishda xato');
    }
  } catch (error) {
    alert('Xato yuz berdi: ' + error.message);
  }
});

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('profile-username').value;
  const password = document.getElementById('profile-password').value;

  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      currentUser = username || currentUser;
      usernameSpan.textContent = currentUser;
      alert(data.message || 'Profil yangilandi');
    } else {
      alert(data.message || data.error || 'Profil yangilashda xato');
    }
  } catch (error) {
    alert('Xato yuz berdi: ' + error.message);
  }
});

document.getElementById('todo-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('todo-title').value;
  const description = document.getElementById('todo-description').value;

  try {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });
    const data = await response.json();
    if (response.ok) {
      document.getElementById('todo-form').reset();
      alert(data.message || 'Todo qo‘shildi');
    } else {
      alert(data.message || data.error || 'Todo qo‘shishda xato');
    }
  } catch (error) {
    alert('Xato yuz berdi: ' + error.message);
  }
});

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  token = null;
  currentUser = null;
  authContainer.classList.remove('hidden');
  appContainer.classList.add('hidden');
  todoList.innerHTML = '';
});

async function fetchTodos() {
  try {
    const response = await fetch('/api/todos', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Todolarni olishda xato');
    }
    const todos = await response.json();
    todoList.innerHTML = '';
    todos.forEach(todo => renderTodo(todo));
  } catch (error) {
    alert('Todolarni olishda xato: ' + error.message);
    localStorage.removeItem('token');
    token = null;
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
  }
}

async function fetchUserData() {
  try {
    const response = await fetch('/api/todos', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (response.ok) {
      const decoded = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      currentUser = decoded.username;
      usernameSpan.textContent = currentUser;
    } else {
      throw new Error('Foydalanuvchi ma’lumotlari olinmadi');
    }
  } catch (error) {
    localStorage.removeItem('token');
    token = null;
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
  }
}

function renderTodo(todo) {
  const li = document.createElement('li');
  li.className = `flex justify-between items-center p-4 border rounded-lg ${todo.completed ? 'bg-gray-200 line-through' : 'bg-white'}`;
  li.innerHTML = `
    <span>${todo.title} ${todo.description ? `- ${todo.description}` : ''}</span>
    <div class="space-x-2">
      <button onclick="toggleTodo('${todo._id}', ${!todo.completed})"
              class="bg-${todo.completed ? 'yellow' : 'green'}-500 text-white px-3 py-1 rounded hover:bg-${todo.completed ? 'yellow' : 'green'}-600">
        ${todo.completed ? 'Bekor qilish' : 'Bajarildi'}
      </button>
      <button onclick="deleteTodo('${todo._id}')"
              class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
        O‘chirish
      </button>
    </div>
  `;
  todoList.appendChild(li);
}

async function toggleTodo(id, completed) {
  try {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ completed }),
    });
    if (!response.ok) {
      const data = await response.json();
      alert(data.message || data.error || 'Todo yangilashda xato');
    }
  } catch (error) {
    alert('Xato yuz berdi: ' + error.message);
  }
}

async function deleteTodo(id) {
  try {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      const li = document.querySelector(`li button[onclick="deleteTodo('${id}')"]`).parentElement.parentElement;
      li.remove();
      alert(data.message || 'Todo o‘chirildi');
    } else {
      alert(data.message || data.error || 'Todo o‘chirishda xato');
    }
  } catch (error) {
    alert('Xato yuz berdi: ' + error.message);
  }
}

function showApp() {
  authContainer.classList.add('hidden');
  appContainer.classList.remove('hidden');
}

socket.on('todoCreated', (todo) => {
  renderTodo(todo);
});

socket.on('todoUpdated', (todo) => {
  fetchTodos();
});

socket.on('todoDeleted', (id) => {
  const li = document.querySelector(`li button[onclick="deleteTodo('${id}')"]`)?.parentElement.parentElement;
  if (li) li.remove();
});

socket.on('profileUpdated', (data) => {
  currentUser = data.username;
  usernameSpan.textContent = currentUser;
});