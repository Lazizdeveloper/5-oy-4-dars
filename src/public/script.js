// const socket = io();
// let token = localStorage.getItem('token');
// let currentUser = null;

// const authContainer = document.getElementById('auth-container');
// const appContainer = document.getElementById('app-container');
// const usernameSpan = document.getElementById('username');
// const todoList = document.getElementById('todo-list');

// if (token) {
//   fetchTodos();
//   showApp();
// }

// document.getElementById('register-form').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const username = document.getElementById('reg-username').value;
//   const password = document.getElementById('reg-password').value;

//   try {
//     const response = await fetch('/api/register', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, password }),
//     });
//     const data = await response.json();
//     if (data.token) {
//       token = data.token;
//       localStorage.setItem('token', token);
//       fetchTodos();
//       showApp();
//     } else {
//       alert(data.error);
//     }
//   } catch (error) {
//     alert('Xato yuz berdi');
//   }
// });

// document.getElementById('login-form').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const username = document.getElementById('login-username').value;
//   const password = document.getElementById('login-password').value;

//   try {
//     const response = await fetch('/api/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, password }),
//     });
//     const data = await response.json();
//     if (data.token) {
//       token = data.token;
//       localStorage.setItem('token', token);
//       fetchTodos();
//       showApp();
//     } else {
//       alert(data.error);
//     }
//   } catch (error) {
//     alert('Xato yuz berdi');
//   }
// });

// document.getElementById('profile-form').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const username = document.getElementById('profile-username').value;
//   const password = document.getElementById('profile-password').value;

//   try {
//     const response = await fetch('/api/profile', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify({ username, password }),
//     });
//     const data = await response.json();
//     alert(data.message || data.error);
//     if (response.ok) {
//       usernameSpan.textContent = username || currentUser;
//       currentUser = username || currentUser;
//     }
//   } catch (error) {
//     alert('Xato yuz berdi');
//   }
// });

// document.getElementById('todo-form').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const title = document.getElementById('todo-title').value;
//   const description = document.getElementById('todo-description').value;

//   try {
//     const response = await fetch('/api/todos', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify({ title, description }),
//     });
//     const data = await response.json();
//     if (response.ok) {
//       document.getElementById('todo-form').reset();
//     } else {
//       alert(data.error);
//     }
//   } catch (error) {
//     alert('Xato yuz berdi');
//   }
// });

// document.getElementById('logout').addEventListener('click', () => {
//   localStorage.removeItem('token');
//   token = null;
//   currentUser = null;
//   authContainer.style.display = 'block';
//   appContainer.style.display = 'none';
//   todoList.innerHTML = '';
// });

// async function fetchTodos() {
//   try {
//     const response = await fetch('/api/todos', {
//       headers: { 'Authorization': `Bearer ${token}` },
//     });
//     const todos = await response.json();
//     todoList.innerHTML = '';
//     todos.forEach(todo => renderTodo(todo));
//     const decoded = jwt_decode(token);
//     currentUser = decoded.username;
//     usernameSpan.textContent = currentUser;
//   } catch (error) {
//     alert('Todolarni olishda xato yuz berdi');
//   }
// }

// function renderTodo(todo) {
//   const li = document.createElement('li');
//   li.className = todo.completed ? 'completed' : '';
//   li.innerHTML = `
//     <span>${todo.title} - ${todo.description || ''}</span>
//     <div>
//       <button onclick="toggleTodo('${todo._id}', ${!todo.completed})">${todo.completed ? 'Bekor qilish' : 'Bajarildi'}</button>
//       <button onclick="deleteTodo('${todo._id}')">O‘chirish</button>
//     </div>
//   `;
//   todoList.appendChild(li);
// }

// async function toggleTodo(id, completed) {
//   try {
//     const response = await fetch(`/api/todos/${id}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify({ completed }),
//     });
//     if (!response.ok) {
//       const data = await response.json();
//       alert(data.error);
//     }
//   } catch (error) {
//     alert('Xato yuz berdi');
//   }
// }

// async function deleteTodo(id) {
//   try {
//     const response = await fetch(`/api/todos/${id}`, {
//       method: 'DELETE',
//       headers: { 'Authorization': `Bearer ${token}` },
//     });
//     const data = await response.json();
//     alert(data.message || data.error);
//   } catch (error) {
//     alert('Xato yuz berdi');
//   }
// }

// socket.on('todoCreated', (todo) => {
//   if (todo.userId === jwt_decode(token).id) {
//     renderTodo(todo);
//   }
// });

// socket.on('todoUpdated', (todo) => {
//   if (todo.userId === jwt_decode(token).id) {
//     fetchTodos();
//   }
// });

// socket.on('todoDeleted', (id) => {
//   fetchTodos();
// });

// socket.on('profileUpdated', (data) => {
//   if (data.id === jwt_decode(token).id) {
//     usernameSpan.textContent = data.username;
//     currentUser = data.username;
//   }
// });

// // jwt_decode funksiyasi (oddiy versiya)
// function jwt_decode(token) {
//   const base64Url = token.split('.')[1];
//   const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//   const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
//     return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//   }).join(''));
//   return JSON.parse(jsonPayload);
// }

const socket = io();
let token = localStorage.getItem('token');
let currentUser = null;

const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const usernameSpan = document.getElementById('username');
const todoList = document.getElementById('todo-list');

if (token) {
  fetchTodos();
  showApp();
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;

  try {
    const response = await fetch('/api/register', {
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
    const response = await fetch('/api/login', {
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
    const response = await fetch('/api/profile', {
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
  authContainer.style.display = 'block';
  appContainer.style.display = 'none';
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
    authContainer.style.display = 'block';
    appContainer.style.display = 'none';
  }
}

function renderTodo(todo) {
  const li = document.createElement('li');
  li.className = todo.completed ? 'completed' : '';
  li.innerHTML = `
    <span>${todo.title} - ${todo.description || ''}</span>
    <div>
      <button onclick="toggleTodo('${todo._id}', ${!todo.completed})">${todo.completed ? 'Bekor qilish' : 'Bajarildi'}</button>
      <button onclick="deleteTodo('${todo._id}')">O‘chirish</button>
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