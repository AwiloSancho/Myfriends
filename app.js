const API_BASE = '/api';

let authToken = null;
let currentUser = null;

const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const currentUserLabel = document.getElementById('currentUserLabel');
const logoutBtn = document.getElementById('logoutBtn');

const authAlert = document.getElementById('authAlert');
const friendsAlert = document.getElementById('friendsAlert');

const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginPane = document.getElementById('loginPane');
const registerPane = document.getElementById('registerPane');

const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');

const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerBtn = document.getElementById('registerBtn');

const friendForm = document.getElementById('friendForm');
const friendFormSubmitLabel = document.getElementById('friendFormSubmitLabel');
const resetFriendFormBtn = document.getElementById('resetFriendFormBtn');

const friendsTableBody = document.getElementById('friendsTableBody');
const friendsCount = document.getElementById('friendsCount');

const searchName = document.getElementById('searchName');
const searchNation = document.getElementById('searchNation');
const searchGender = document.getElementById('searchGender');
const searchHobby = document.getElementById('searchHobby');
const searchEducationLevel = document.getElementById('searchEducationLevel');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');

const btnNationDistribution = document.getElementById('btnNationDistribution');
const btnGenderRatio = document.getElementById('btnGenderRatio');
const btnHobbyDistribution = document.getElementById('btnHobbyDistribution');
const btnBodyStats = document.getElementById('btnBodyStats');
const btnAgeDistribution = document.getElementById('btnAgeDistribution');
const analysisOutput = document.getElementById('analysisOutput');

// Helpers
function setAuthAlert(message, type = 'danger') {
  if (!message) {
    authAlert.classList.add('d-none');
    authAlert.textContent = '';
    return;
  }
  authAlert.className = `alert alert-${type}`;
  authAlert.textContent = message;
}

function setFriendsAlert(message, type = 'danger') {
  if (!message) {
    friendsAlert.classList.add('d-none');
    friendsAlert.textContent = '';
    return;
  }
  friendsAlert.className = `alert alert-${type}`;
  friendsAlert.textContent = message;
}

function saveAuth(token, user) {
  authToken = token;
  currentUser = user;
  localStorage.setItem('myfriends_token', token);
  localStorage.setItem('myfriends_user', JSON.stringify(user));
  updateAuthUI();
}

function loadAuthFromStorage() {
  const token = localStorage.getItem('myfriends_token');
  const userStr = localStorage.getItem('myfriends_user');
  if (token && userStr) {
    authToken = token;
    try {
      currentUser = JSON.parse(userStr);
    } catch {
      currentUser = null;
    }
  }
  updateAuthUI();
}

function clearAuth() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('myfriends_token');
  localStorage.removeItem('myfriends_user');
  updateAuthUI();
}

function updateAuthUI() {
  if (authToken && currentUser) {
    authSection.classList.add('d-none');
    appSection.classList.remove('d-none');
    logoutBtn.classList.remove('d-none');
    currentUserLabel.textContent = `Logged in as ${currentUser.name}`;
  } else {
    authSection.classList.remove('d-none');
    appSection.classList.add('d-none');
    logoutBtn.classList.add('d-none');
    currentUserLabel.textContent = '';
  }
}

async function apiRequest(path, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error || 'Request failed';
    throw new Error(message);
  }
  return data;
}

// Auth tab switching
function showAuthPane(target) {
  if (target === 'loginPane') {
    // show login, hide register
    loginPane.classList.remove('d-none');
    registerPane.classList.add('d-none');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    // clear any previous register inputs
    if (registerName) registerName.value = '';
    if (registerEmail) registerEmail.value = '';
    if (registerPassword) registerPassword.value = '';
    // focus first login field
    if (loginEmail) loginEmail.focus();
  } else {
    // show register, hide login
    loginPane.classList.add('d-none');
    registerPane.classList.remove('d-none');
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
    // clear previous login inputs
    if (loginEmail) loginEmail.value = '';
    if (loginPassword) loginPassword.value = '';
    // clear register inputs to ensure no stale data
    if (registerName) registerName.value = '';
    if (registerEmail) registerEmail.value = '';
    if (registerPassword) registerPassword.value = '';
    // focus first register field
    if (registerName) registerName.focus();
  }
  setAuthAlert('');
}

// Helper to show a dashboard section by id and update sidebar active state
function showSection(targetId) {
  document.querySelectorAll('.section').forEach((s) => s.classList.add('d-none'));
  const el = document.getElementById(targetId);
  if (el) el.classList.remove('d-none');
  document.querySelectorAll('.sidebar-menu li').forEach((li) => {
    li.classList.toggle('active', li.getAttribute('data-target') === targetId);
  });
}

loginTab.addEventListener('click', () => showAuthPane('loginPane'));
registerTab.addEventListener('click', () => showAuthPane('registerPane'));

// Auth actions
loginBtn.addEventListener('click', async () => {
  setAuthAlert('');
  try {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    if (!email || !password) {
      setAuthAlert('Email and password are required');
      return;
    }
    loginBtn.disabled = true;
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveAuth(res.data.token, res.data.user);
  } catch (err) {
    setAuthAlert(err.message || 'Login failed');
  } finally {
    loginBtn.disabled = false;
  }
});

registerBtn.addEventListener('click', async () => {
  setAuthAlert('');
  try {
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    if (!name || !email || !password) {
      setAuthAlert('Name, email, and password are required');
      return;
    }
    registerBtn.disabled = true;
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    saveAuth(res.data.token, res.data.user);
  } catch (err) {
    setAuthAlert(err.message || 'Registration failed');
  } finally {
    registerBtn.disabled = false;
  }
});

logoutBtn.addEventListener('click', () => {
  clearAuth();
});

// Friend form helpers
function getFriendFormData() {
  const photos = document
    .getElementById('photos')
    .value.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const hobbies = document
    .getElementById('hobbies')
    .value.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    name: document.getElementById('name').value.trim(),
    nation: document.getElementById('nation').value.trim(),
    birthday: document.getElementById('birthday').value,
    gender: document.getElementById('gender').value,
    telephone: document.getElementById('telephone').value.trim() || null,
    email: document.getElementById('email').value.trim() || null,
    height: document.getElementById('height').value || null,
    weight: document.getElementById('weight').value || null,
    photos,
    educationLevel: document.getElementById('educationLevel').value || null,
    address: document.getElementById('address').value.trim() || null,
    educationExperience: [],
    hobbies,
  };
}

function resetFriendForm() {
  friendForm.reset();
  document.getElementById('friendId').value = '';
  friendFormSubmitLabel.textContent = 'Add friend';
}

resetFriendFormBtn.addEventListener('click', resetFriendForm);

friendForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  setFriendsAlert('');
  try {
    const id = document.getElementById('friendId').value;
    const payload = getFriendFormData();
    if (!payload.name || !payload.nation || !payload.birthday || !payload.gender) {
      setFriendsAlert('Name, nation, birthday and gender are required');
      return;
    }
    friendFormSubmitLabel.textContent = id ? 'Saving...' : 'Adding...';

    if (id) {
      await apiRequest(`/friends/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setFriendsAlert('Friend updated', 'success');
    } else {
      await apiRequest('/friends', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setFriendsAlert('Friend created', 'success');
    }
    resetFriendForm();
    await refreshFriends();
  } catch (err) {
    setFriendsAlert(err.message || 'Save failed');
  } finally {
    friendFormSubmitLabel.textContent = document.getElementById('friendId').value
      ? 'Save changes'
      : 'Add friend';
  }
});

function populateFriendForm(friend) {
  document.getElementById('friendId').value = friend.id;
  document.getElementById('name').value = friend.name || '';
  document.getElementById('nation').value = friend.nation || '';
  document.getElementById('birthday').value = friend.birthday
    ? friend.birthday.split('T')[0]
    : '';
  document.getElementById('gender').value = friend.gender || '';
  document.getElementById('telephone').value = friend.telephone || '';
  document.getElementById('email').value = friend.email || '';
  document.getElementById('height').value = friend.height || '';
  document.getElementById('weight').value = friend.weight || '';
  document.getElementById('photos').value = (friend.photos || []).join(', ');
  document.getElementById('educationLevel').value = friend.educationLevel || '';
  document.getElementById('address').value = friend.address || '';
  document.getElementById('hobbies').value = (friend.hobbies || []).join(', ');
  friendFormSubmitLabel.textContent = 'Save changes';
}

// Friends list
async function refreshFriends(params = null) {
  try {
    setFriendsAlert('');
    friendsTableBody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
    let path = '/friends';
    if (params) {
      const qs = new URLSearchParams(params);
      path = `/friends/search?${qs.toString()}`;
    }
    const res = await apiRequest(path);
    const friends = res.data || [];
    friendsCount.textContent = `${friends.length} friend(s)`;
    if (!friends.length) {
      friendsTableBody.innerHTML = '<tr><td colspan="7">No friends found</td></tr>';
      return;
    }
    friendsTableBody.innerHTML = '';
    friends.forEach((f) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${f.name}</td>
        <td>${f.nation || ''}</td>
        <td><span class="badge bg-secondary badge-pill">${f.gender || ''}</span></td>
        <td>${f.height || ''}</td>
        <td>${f.weight || ''}</td>
        <td>${(f.hobbies || []).slice(0, 3).join(', ')}${
        (f.hobbies || []).length > 3 ? '…' : ''
      }</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${
            f.id
          }">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${
            f.id
          }">Delete</button>
        </td>
      `;
      friendsTableBody.appendChild(tr);
    });
  } catch (err) {
    setFriendsAlert(err.message || 'Failed to load friends');
    friendsTableBody.innerHTML = '';
  }
}

friendsTableBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const action = btn.getAttribute('data-action');

  if (action === 'edit') {
    try {
      const res = await apiRequest(`/friends/${id}`);
      // open Add Friend section directly and populate form
      showSection('section-add-friend');
      populateFriendForm(res.data);
      // focus top of form
      const top = document.querySelector('#section-add-friend');
      if (top) top.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setFriendsAlert(err.message || 'Failed to load friend');
    }
  } else if (action === 'delete') {
    if (!confirm('Delete this friend?')) return;
    try {
      await apiRequest(`/friends/${id}`, { method: 'DELETE' });
      setFriendsAlert('Friend deleted', 'success');
      await refreshFriends();
    } catch (err) {
      setFriendsAlert(err.message || 'Failed to delete friend');
    }
  }
});

// Search — render results under the search panel when available
const searchResultsEl = document.getElementById('searchResults');

function renderSearchResults(friends) {
  if (!searchResultsEl) {
    // fallback: populate friends table
    refreshFriends({});
    return;
  }
  if (!friends || !friends.length) {
    searchResultsEl.innerHTML = '<div class="text-muted">No results found</div>';
    return;
  }
  const rows = friends
    .map((f) => `
      <tr>
        <td>${f.name || ''}</td>
        <td>${f.nation || ''}</td>
        <td><span class="badge bg-secondary badge-pill">${f.gender || ''}</span></td>
        <td>${f.height || ''}</td>
        <td>${f.weight || ''}</td>
        <td>${(f.hobbies || []).slice(0, 3).join(', ')}${(f.hobbies || []).length > 3 ? '…' : ''}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${f.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${f.id}">Delete</button>
        </td>
      </tr>
    `)
    .join('');

  searchResultsEl.innerHTML = `
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Nation</th>
            <th>Gender</th>
            <th>Height</th>
            <th>Weight</th>
            <th>Hobbies</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// Handle clicks inside the search results (edit/delete)
if (searchResultsEl) {
  searchResultsEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    if (action === 'edit') {
      try {
        const res = await apiRequest(`/friends/${id}`);
        // open Add Friend section and populate
        showSection('section-add-friend');
        populateFriendForm(res.data);
        const top = document.querySelector('#section-add-friend');
        if (top) top.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        setFriendsAlert(err.message || 'Failed to load friend');
      }
    } else if (action === 'delete') {
      if (!confirm('Delete this friend?')) return;
      try {
        await apiRequest(`/friends/${id}`, { method: 'DELETE' });
        setFriendsAlert('Friend deleted', 'success');
        // remove the card from UI
        btn.closest('.card').remove();
      } catch (err) {
        setFriendsAlert(err.message || 'Failed to delete friend');
      }
    }
  });
}

searchBtn.addEventListener('click', async () => {
  const params = {};
  if (searchName.value.trim()) params.name = searchName.value.trim();
  if (searchNation.value.trim()) params.nation = searchNation.value.trim();
  if (searchGender.value) params.gender = searchGender.value;
  if (searchHobby.value.trim()) params.hobby = searchHobby.value.trim();
  if (searchEducationLevel.value) params.educationLevel = searchEducationLevel.value;

  try {
    // prefer search endpoint used by server
    const qs = new URLSearchParams(params);
    const res = await apiRequest(`/friends/search?${qs.toString()}`);
    const friends = res.data || [];
    renderSearchResults(friends);
    // if a search panel exists, ensure it is visible
    const searchSection = document.getElementById('section-search');
    if (searchSection) {
      // show the section and hide others
      document.querySelectorAll('.section').forEach(s=>s.classList.add('d-none'));
      searchSection.classList.remove('d-none');
    }
  } catch (err) {
    setFriendsAlert(err.message || 'Search failed');
  }
});

clearSearchBtn.addEventListener('click', () => {
  searchName.value = '';
  searchNation.value = '';
  searchGender.value = '';
  searchHobby.value = '';
  searchEducationLevel.value = '';
  if (searchResultsEl) searchResultsEl.innerHTML = '';
});

// Analysis
async function runAnalysis(path) {
  const chartCanvas = document.getElementById('chartCanvas');
  try {
    if (analysisOutput) {
      analysisOutput.style.display = '';
      analysisOutput.textContent = 'Loading...';
    }
    if (chartCanvas) chartCanvas.innerHTML = '<div class="text-muted">Loading...</div>';
    const res = await apiRequest(path);
    const data = res.data;

    // helpers for rendering tables
    const renderTable = (headers, rowsHtml) => {
      chartCanvas.innerHTML = `\n        <div class="table-responsive">\n          <table class="table table-striped">\n            <thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>\n            <tbody>${rowsHtml}</tbody>\n          </table>\n        </div>`;
      if (analysisOutput) analysisOutput.style.display = 'none';
    };

    const renderKV = (pairs, colA='Category', colB='Count') => {
      const rows = pairs.map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
      renderTable([colA, colB], rows);
    };

    // FORMAT PER ENDPOINT
    if (path.includes('nation-distribution')) {
      // data may be object {nation: count} or array [{nation,count}] or [{label,count}]
      let pairs = [];
      if (Array.isArray(data)) {
        pairs = data.map((r) => [r.nation ?? r.label ?? Object.keys(r)[0], r.count ?? r.value ?? Object.values(r)[0]]);
      } else if (typeof data === 'object' && data !== null) {
        pairs = Object.entries(data);
      }
      renderKV(pairs, 'Nation', 'Count');
    } else if (path.includes('gender-ratio')) {
      // data may be object or array of {gender,count}
      let pairs = [];
      if (Array.isArray(data)) {
        pairs = data.map((r) => [r.gender ?? r.label ?? Object.keys(r)[0], Number(r.count ?? r.value ?? Object.values(r)[0])]);
      } else if (typeof data === 'object' && data !== null) {
        pairs = Object.entries(data).map(([k,v]) => [k, Number(v)]);
      }
      const total = pairs.reduce((s,[,c])=>s + (Number(c)||0),0) || 0;
      const rows = pairs.map(([g,c]) => `<tr><td>${g}</td><td>${c}</td><td>${total?((Number(c)/total*100).toFixed(1)+'%'):'0.0%'}</td></tr>`).join('');
      renderTable(['Gender','Count','Percentage'], rows);
    } else if (path.includes('hobby-distribution')) {
      let pairs = [];
      if (Array.isArray(data)) {
        pairs = data.map((r) => [r.hobby ?? r.label ?? Object.keys(r)[0], r.count ?? r.value ?? Object.values(r)[0]]);
      } else if (typeof data === 'object' && data !== null) {
        pairs = Object.entries(data);
      }
      renderKV(pairs, 'Hobby', 'Count');
    } else if (path.includes('body-stats')) {
      // body stats: likely object with metrics - render key/value
      if (Array.isArray(data)) {
        // array of metrics -> show as key/value if possible
        const rows = data.map((r) => `<tr><td>${r.metric ?? r.label ?? JSON.stringify(r)}</td><td>${r.value ?? JSON.stringify(r)}</td></tr>`).join('');
        renderTable(['Metric','Value'], rows);
      } else if (typeof data === 'object' && data !== null) {
        const rows = Object.entries(data).map(([k,v])=>`<tr><td>${k}</td><td>${typeof v==='object'?JSON.stringify(v):v}</td></tr>`).join('');
        renderTable(['Metric','Value'], rows);
      } else {
        chartCanvas.innerHTML = `<pre class="small text-muted">${String(data)}</pre>`;
      }
    } else if (path.includes('age-distribution')) {
      // age distribution: expect object or array of {ageRange,count}
      let pairs = [];
      if (Array.isArray(data)) {
        pairs = data.map((r) => [r.ageRange ?? r.range ?? r.label ?? Object.keys(r)[0], r.count ?? r.value ?? Object.values(r)[0]]);
      } else if (typeof data === 'object' && data !== null) {
        pairs = Object.entries(data);
      }
      renderKV(pairs, 'Age Range', 'Count');
    } else {
      // generic fallback: if array of objects with key/count render key/count
      if (Array.isArray(data) && data.length && (data[0].label || data[0].count || data[0].key)) {
        const pairs = data.map((r) => [r.label ?? r.key ?? Object.keys(r)[0], r.count ?? r.value ?? Object.values(r)[0]]);
        renderKV(pairs);
      } else if (typeof data === 'object' && data !== null) {
        const rows = Object.entries(data).map(([k,v])=>`<tr><td>${k}</td><td>${typeof v==='object'?JSON.stringify(v):v}</td></tr>`).join('');
        renderTable(['Key','Value'], rows);
      } else {
        chartCanvas.innerHTML = `<pre class="small text-muted">${String(data)}</pre>`;
      }
    }
  } catch (err) {
    const msg = err.message || 'Failed to load analysis';
    if (chartCanvas) chartCanvas.innerHTML = `<div class="text-danger">Error: ${msg}</div>`;
    if (analysisOutput) analysisOutput.textContent = `Error: ${msg}`;
  }
}

btnNationDistribution.addEventListener('click', () =>
  runAnalysis('/analysis/nation-distribution')
);
btnGenderRatio.addEventListener('click', () =>
  runAnalysis('/analysis/gender-ratio')
);
btnHobbyDistribution.addEventListener('click', () =>
  runAnalysis('/analysis/hobby-distribution')
);
btnBodyStats.addEventListener('click', () =>
  runAnalysis('/analysis/body-stats')
);
btnAgeDistribution.addEventListener('click', () =>
  runAnalysis('/analysis/age-distribution')
);

// Init
loadAuthFromStorage();

// Logo loader: try persisted path, then images/logo.png, else show fallback
function loadAuthLogo() {
  const imgEl = document.getElementById('authLogoImg');
  const fallback = document.getElementById('authLogoFallback');
  const trySrcs = [];
  const saved = localStorage.getItem('myfriends_logo');
  if (saved) trySrcs.push(saved);
  trySrcs.push('images/logo.png');

  const tryNext = (i) => {
    if (!trySrcs[i]) {
      if (imgEl) imgEl.style.display = 'none';
      if (fallback) fallback.classList.remove('d-none');
      return;
    }
    const src = trySrcs[i];
    const t = new Image();
    t.onload = () => {
      if (imgEl) { imgEl.src = src; imgEl.style.display = 'block'; }
      if (fallback) fallback.classList.add('d-none');
    };
    t.onerror = () => tryNext(i + 1);
    t.src = src;
  };
  tryNext(0);
}

loadAuthLogo();

// Dark mode persistence and toggle (support multiple toggle buttons)
const darkToggleBtns = document.querySelectorAll('.dark-toggle');
function applyDarkMode(enable) {
  if (enable) document.body.classList.add('dark-mode');
  else document.body.classList.remove('dark-mode');
}
function updateDarkToggleUI(isDark){
  darkToggleBtns.forEach((btn) => {
    const icon = btn.querySelector('i');
    const label = btn.querySelector('.toggle-label');
    btn.classList.toggle('active', isDark);
    if (isDark) {
      if (icon){ icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
      if (label) label.textContent = 'Light';
    } else {
      if (icon){ icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
      if (label) label.textContent = 'Dark';
    }
  });
}
function loadDarkModeSetting() {
  const stored = localStorage.getItem('myfriends_dark');
  const enabled = stored === '1' || stored === 'true';
  applyDarkMode(enabled);
  updateDarkToggleUI(enabled);
}
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('myfriends_dark', isDark ? '1' : '0');
  updateDarkToggleUI(isDark);
}
darkToggleBtns.forEach((btn) => btn.addEventListener('click', toggleDarkMode));
loadDarkModeSetting();

// Allow clicks on analysis table (chartCanvas) to edit/delete similar to friends list
const chartCanvasEl = document.getElementById('chartCanvas');
if (chartCanvasEl) {
  chartCanvasEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    if (action === 'edit') {
      try {
        const res = await apiRequest(`/friends/${id}`);
        // open Add Friend section and populate
        showSection('section-add-friend');
        populateFriendForm(res.data);
        const top = document.querySelector('#section-add-friend');
        if (top) top.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        setFriendsAlert(err.message || 'Failed to load friend');
      }
    } else if (action === 'delete') {
      if (!confirm('Delete this friend?')) return;
      try {
        await apiRequest(`/friends/${id}`, { method: 'DELETE' });
        setFriendsAlert('Friend deleted', 'success');
        // remove the row from the displayed table
        const row = btn.closest('tr');
        if (row) row.remove();
      } catch (err) {
        setFriendsAlert(err.message || 'Failed to delete friend');
      }
    }
  });
}


