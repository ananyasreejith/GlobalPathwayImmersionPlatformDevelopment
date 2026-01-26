const API_URL = 'http://localhost:3000';

// DOM Elements
const authForm = document.getElementById('auth-form');
const toggleAuth = document.getElementById('toggle-auth');
const logoutBtn = document.getElementById('logout-btn');

// --- Global Functions ---

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function checkAuth() {
    const token = getToken();
    const user = getUser();
    const path = window.location.pathname;

    if (!token && path !== '/index.html' && path !== '/') {
        window.location.href = '/index.html';
    } else if (token && (path === '/index.html' || path === '/')) {
        // Redirect based on role
        if (user.role === 'counselor') window.location.href = '/counselor.html';
        else window.location.href = '/student.html';
    }
}

// Logout
if (logoutBtn) {
    document.getElementById('user-name').innerText = getUser()?.username || 'User';
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    });
}

// --- Auth Page Logic ---

if (authForm) {
    let isRegister = false;
    const title = document.getElementById('form-title');
    const roleGroup = document.getElementById('role-group');
    const errorMsg = document.getElementById('error-msg');

    toggleAuth.addEventListener('click', (e) => {
        e.preventDefault();
        isRegister = !isRegister;
        title.innerText = isRegister ? 'Student Registration' : 'Student Login';
        toggleAuth.innerText = isRegister ? 'Already have an account? Login' : 'Need an account? Register';
        roleGroup.style.display = isRegister ? 'block' : 'none';
        authForm.reset();
        errorMsg.style.display = 'none';
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        const endpoint = isRegister ? '/auth/register' : '/auth/login';
        const body = isRegister ? { username, password, role } : { username, password };

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || data.message);

            if (isRegister) {
                // Auto login or just switch to login view
                alert('Registration successful! Please login.');
                toggleAuth.click();
            } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = data.user.role === 'counselor' ? '/counselor.html' : '/student.html';
            }
        } catch (err) {
            errorMsg.innerText = err.message;
            errorMsg.style.display = 'block';
        }
    });
}

// --- Student Dashboard Logic ---

if (window.location.pathname.includes('student.html')) {
    checkAuth();
    const user = getUser();
    let selectedEmotion = null;

    // Emotion Selection
    document.querySelectorAll('.emotion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedEmotion = btn.dataset.value;
        });
    });

    // Check existing applications (Mock data for now mostly, but structure is there)
    // Ideally we fetch user details again to get applications
    // For MVP, we'll just show a placeholder or empty state if none
    document.getElementById('applications-list').innerHTML = '<p><em>No active applications tracking details found. Contact counselor to update.</em></p>';


    // Submit Emotion
    document.getElementById('submit-emotion').addEventListener('click', async () => {
        if (!selectedEmotion) return alert('Please select an emotion');
        const note = document.getElementById('emotion-note').value;
        const logMsg = document.getElementById('log-msg');

        try {
            const res = await fetch(`${API_URL}/api/emotion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getToken()
                },
                body: JSON.stringify({
                    studentId: user.id,
                    emotion: selectedEmotion,
                    note
                })
            });

            if (res.ok) {
                logMsg.innerText = 'Mood logged successfully!';
                logMsg.style.color = 'green';
                document.getElementById('emotion-note').value = '';
                document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('selected'));
                selectedEmotion = null;
                fetchHistory();
            }
        } catch (err) {
            console.error(err);
        }
    });

    async function fetchHistory() {
        try {
            const res = await fetch(`${API_URL}/api/emotions/${user.id}`);
            const logs = await res.json();
            const tbody = document.getElementById('history-table-body');
            tbody.innerHTML = logs.map(log => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(log.createdAt).toLocaleDateString()} ${new Date(log.createdAt).toLocaleTimeString()}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${log.emotion}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${log.note || '-'}</td>
                </tr>
            `).join('');
        } catch (err) {
            console.error(err);
        }
    }
    fetchHistory();
}

// --- Counselor Dashboard Logic ---

if (window.location.pathname.includes('counselor.html')) {
    checkAuth();

    async function fetchStudents() {
        try {
            const res = await fetch(`${API_URL}/api/dashboard/students`);
            const students = await res.json();
            const tbody = document.getElementById('students-table-body');

            tbody.innerHTML = students.map(student => {
                const isRisk = ['Stressed', 'Anxious'].includes(student.latestEmotion);
                const rowClass = isRisk ? 'alert-row' : '';
                const moodDisplay = isRisk ? `<span style="color: #c0392b; font-weight: bold;">⚠️ ${student.latestEmotion}</span>` : (student.latestEmotion || 'N/A');

                return `
                <tr class="${rowClass}">
                    <td style="padding: 15px; border-bottom: 1px solid #eee;">${student.username}</td>
                    <td style="padding: 15px; border-bottom: 1px solid #eee;">${moodDisplay}</td>
                    <td style="padding: 15px; border-bottom: 1px solid #eee;">${student.latestEmotionDate ? new Date(student.latestEmotionDate).toLocaleDateString() : '-'}</td>
                    <td style="padding: 15px; border-bottom: 1px solid #eee;">${student.applications ? student.applications.length : 0}</td>
                    <td style="padding: 15px; border-bottom: 1px solid #eee;">
                        <button class="btn btn-primary" style="font-size: 0.8rem; padding: 5px 10px;">View Details</button>
                    </td>
                </tr>
                `;
            }).join('');
        } catch (err) {
            console.error(err);
        }
    }
    fetchStudents();
}
