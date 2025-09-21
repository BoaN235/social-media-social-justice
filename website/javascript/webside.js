async function createProfile() {
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    const name = document.getElementById('name').value;
    const responseDiv = document.getElementById('response');
    responseDiv.textContent = 'Creating profile...';

    const data = {
        "username": username,
        "password": String(await hashPasswordSHA256(password)),  // Await hash
        "name": name
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/create_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        document.cookie = "ID=" + result.data.id;
        if (response.ok) {
            responseDiv.textContent = `Profile created successfully: ${JSON.stringify(result.data)}`;
            reloadlog();
        } else {
            responseDiv.textContent = `Error: ${result.message}`;
        }
    } catch (error) {
        responseDiv.textContent = `Fetch error: ${error}`;
    }
}

async function hashPasswordSHA256(password) {
    const msgBuffer = new TextEncoder().encode(String(password));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function loginProfile() {
    const password = document.getElementById('log_password').value;
    const username = document.getElementById('log_username').value;
    const responseDiv = document.getElementById('response');
    responseDiv.textContent = 'Logging in...';
    reloadlog();

    const data = {
        "username": username,
        "password": String(await hashPasswordSHA256(password))
    };
    try {
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            responseDiv.textContent = `Login successful: ${JSON.stringify(result.data)}`;
            document.cookie = "ID=" + result.data.id;
            
        } else {
            responseDiv.textContent = `Error: ${result.message}`;
        }
    } catch (error) {
        responseDiv.textContent = `Fetch error: ${error}`;
    }
}

        function getCookie(name) {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
        }
        function handleLoginLogout() {
          const id = getCookie('ID');
          if (id && id.trim() !== "") {
            // Logout
            document.cookie = "ID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.getElementById('loginLogoutBtn').textContent = 'Login';
          } else {
            // Login
            window.location.href = '/website/Login.html';
          }
        }
        document.addEventListener('DOMContentLoaded', function reloadlog() {
          const id = getCookie('ID');
          if (id && id.trim() !== "") {
            document.getElementById('loginLogoutBtn').textContent = 'Logout';
          } else {
            document.getElementById('loginLogoutBtn').textContent = 'Login';
          }
        });