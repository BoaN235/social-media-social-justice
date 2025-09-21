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
            document.cookie = "ID=" + result.data.id;
            responseDiv.textContent = `Login successful: ${JSON.stringify(result.data)}`;
        } else {
            responseDiv.textContent = `Error: ${result.message}`;
        }
    } catch (error) {
        responseDiv.textContent = `Fetch error: ${error}`;
    }
}