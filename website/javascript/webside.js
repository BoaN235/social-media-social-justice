// Create a new post
async function createPost() {
    const content = document.getElementById('postContent').value;
    const responseDiv = document.getElementById('postResponse');
    responseDiv.textContent = 'Posting...';
    const id = getCookie('ID');
    if (!id) {
        responseDiv.textContent = 'You must be logged in to post.';
        return;
    }
    const data = {
        'user_id': id,
        'content': content
    };
    try {
        const response = await fetch('http://127.0.0.1:5000/create_post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            responseDiv.textContent = 'Post created!';
            document.getElementById('postContent').value = '';
            fetchPosts();
        } else {
            responseDiv.textContent = `Error: ${result.message}`;
        }
    } catch (error) {
        responseDiv.textContent = `Fetch error: ${error}`;
    }
}

// Fetch and display posts
async function fetchPosts() {
    const feedDiv = document.getElementById('postFeed');
    if (!feedDiv) return;
    feedDiv.innerHTML = 'Loading...';
    try {
        const response = await fetch('http://127.0.0.1:5000/api/data');
        const posts = await response.json();
        if (Array.isArray(posts) && posts.length > 0) {
            feedDiv.innerHTML = posts.map(post =>
                `<div class="card mb-2"><div class="card-body"><p class="card-text">${post.content}</p><small class="text-muted">${post.created_at}</small></div></div>`
            ).join('');
        } else {
            feedDiv.innerHTML = '<p>No posts yet.</p>';
        }
    } catch (error) {
        feedDiv.innerHTML = `<p>Fetch error: ${error}</p>`;
    }
}
async function createProfile() {
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    const name = document.getElementById('name').value;
    const responseDiv = document.getElementById('response');
    responseDiv.textContent = 'Creating profile...';

    // Get account type from radio buttons
    let type = null;
    const advisorRadio = document.getElementById('advisor');
    const supporterRadio = document.getElementById('supporter');
    if (advisorRadio && advisorRadio.checked) {
        type = 'ADVISOR';
    } else if (supporterRadio && supporterRadio.checked) {
        type = 'SUPPORTER';
    }

    const data = {
        "username": username,
        "password": String(await hashPasswordSHA256(password)),
        "name": name,
        "type": type
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
            window.location.href = '/website/Login.html';
          } else {
            // Login
            window.location.href = '/website/Login.html';
          }
        }
        document.addEventListener('DOMContentLoaded', function() {
          const id = getCookie('ID');
          if (id && id.trim() !== "") {
            document.getElementById('loginLogoutBtn').textContent = 'Logout';
          } else {
            document.getElementById('loginLogoutBtn').textContent = 'Login';
          }
        });