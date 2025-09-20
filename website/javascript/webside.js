async function createProfile() {
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    const name = document.getElementById('name').value;
    const responseDiv = document.getElementById('response');
    responseDiv.textContent = 'Creating profile...';

    const data = {
        "username":username, 
        "password":String(hashPasswordSHA256(password)),
        "name": name
    } // Convert to plain object for JSON

    try {
        const response = await fetch('http://127.0.0.1:5000/create_profile', {
        method: 'POST',
        headers: {
                'Content-Type': 'application/json' // Specify content type for JSON
        },
        body: JSON.stringify(data) // Send data as JSON string
        });

        if (response.ok) {
            const result = await response.json();
            responseDiv.textContent = `Server response: ${result.message}, Data: ${JSON.stringify(result.data)}`;
        } else {
            responseDiv.textContent = `Error: ${response.status} - ${response.statusText}`;
        }
    } catch (error) {
        responseDiv.textContent = `Fetch error: ${error}`;
    }
    }

async function hashPasswordSHA256(password) {
  // Encode the password string as a Uint8Array
  const msgBuffer = new TextEncoder().encode(String(password));

  // Hash the message using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // Convert the ArrayBuffer to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}
