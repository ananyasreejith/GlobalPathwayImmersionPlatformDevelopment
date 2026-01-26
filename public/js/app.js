const API_URL = 'http://localhost:5000/api'; // Updated base URL to include /api on port 5000

/* --- Auth --- */

// Register
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;

        try {
            console.log('Sending registration request to:', `${API_URL}/register`);
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Registration successful! Please login.');
                toggleForms(); // Switch to login
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Registration Error:', err);
            alert('Error connecting to server: ' + err.message);
        }
    });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                if (data.user.role === 'admin' || data.user.role === 'counselor') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Error connecting to server');
        }
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

/* --- Student Features --- */

// Submit Application
const appForm = document.getElementById('appForm');
if (appForm) {
    appForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const type = document.getElementById('appType').value;
        const fullName = document.getElementById('fullName').value;
        const contactNumber = document.getElementById('contactNumber').value;
        const email = document.getElementById('appEmail').value;
        const countryInterested = document.getElementById('country').value;

        // Field name depends on Study vs Work
        const courseOrJob = document.getElementById('courseOrJob').value;

        const user = JSON.parse(localStorage.getItem('user')) || {};

        let endpoint = type === 'Study' ? '/apply/study' : '/apply/work';
        let body = {
            fullName, contactNumber, email, countryInterested,
            username: user.username
        };

        if (type === 'Study') {
            body.courseInterested = courseOrJob; // Map to new API field name
        } else {
            body.jobTitle = courseOrJob; // Map to new API field name
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok) {
                alert(`Application successfully submitted by ${user.username || 'You'}`);
                showSelection(); // Go back
                loadMyApplications(); // Refresh list
                document.getElementById('appForm').reset();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Error submitting application');
        }
    });
}

// Track Application
async function trackApplication() {
    const appId = document.getElementById('trackAppId').value.trim();
    if (!appId) return;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/application/${appId}`, { // Updated route
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        const resultDiv = document.getElementById('trackResult');
        if (res.ok) {
            resultDiv.innerHTML = `
                <div style="background: rgba(255,255,255,0.9); padding: 15px; border-radius: 10px; border: 1px solid #eee;">
                    <strong>ID:</strong> ${data.applicationId}<br>
                    <strong>Status:</strong> <span class="status ${getStatusClass(data.status)}">${data.status}</span><br>
                    <strong>Type:</strong> ${data.type}<br>
                    <strong>Country:</strong> ${data.country}
                </div>
            `;
        } else {
            resultDiv.innerHTML = `<p style="color: red;">${data.message}</p>`;
        }
    } catch (err) {
        alert('Error tracking application');
    }
}

// Load My Applications
async function loadMyApplications() {
    const listDiv = document.getElementById('my-applications-list');
    if (!listDiv) return;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/my-applications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.length === 0) {
            listDiv.innerHTML = '<p>No applications found.</p>';
            return;
        }

        listDiv.innerHTML = data.map(app => `
            <div style="background: white; padding: 10px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #ddd;">
                <div style="display: flex; justify-content: space-between;">
                    <strong>${app.type} to ${app.country}</strong>
                    <span class="status ${getStatusClass(app.status)}">${app.status}</span>
                </div>
                <small style="color: #666;">ID: ${app.applicationId} | ${new Date(app.createdAt).toLocaleDateString()}</small>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

/* --- Admin Features --- */

async function loadAllApplications() {
    const tbody = document.querySelector('#applicationsTable tbody');
    if (!tbody) return;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/admin/applications`, { // Updated route
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 403) {
            alert('Access Denied: You are logged in as a Student.\nPlease login with Admin credentials.');
            logout(); // Clear token and user
            return;
        }

        const data = await res.json();

        tbody.innerHTML = data.map(app => `
            <tr>
                <td>${app.applicationId}</td>
                <td>${app.username}<br><small>${app.email}</small></td>
                <td>${app.type}</td>
                <td>${app.country}</td>
                <td>${app.courseOrJob}</td>
                <td><span class="status ${getStatusClass(app.status)}">${app.status}</span></td>
                <td>
                    <select onchange="updateStatus('${app.applicationId}', this.value)" class="status-select"> <!-- Passed applicationId instead of _id -->
                        <option value="">Update Status...</option>
                        <option value="Processing">Processing</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function updateStatus(appId, newStatus) {
    if (!newStatus) return;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/admin/application/${appId}/status`, { // Updated route
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            alert('Status updated successfully');
            loadAllApplications(); // Refresh
        } else {
            alert('Error updating status');
        }
    } catch (err) {
        alert('Error connecting to server');
    }
}

function getStatusClass(status) {
    if (status === 'Approved') return 'status-approved';
    if (status === 'Rejected') return 'status-rejected';
    return 'status-processing';
}
