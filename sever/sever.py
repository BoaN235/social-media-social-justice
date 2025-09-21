import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


try:
    connection = mysql.connector.connect(
        host="localhost",
        user="boan",
        password="768073",
        database="social_justice_social_media"
    )
    cursor = connection.cursor()
    if connection.is_connected():
        print("Connected to MySQL database successfully!")
except mysql.connector.Error as err:
    print(f"Error connecting to MySQL: {err}")

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'message': 'Username and password required', 'data': None}), 400
    cursor.execute('SELECT ID, Profilename FROM Profiles WHERE Username = %s AND Password = %s', (username, password))
    result = cursor.fetchone()
    if result:
        return jsonify({'message': 'Login successful', 'data': {'id': result[0], 'name': result[1]}}), 200
    else:
        return jsonify({'message': 'Invalid username or password', 'data': None}), 401

@app.route('/api/data')
def get_posts():
    cursor.execute("SELECT * FROM Posts;")
    posts = cursor.fetchall()
    posts_data = []
    for post in posts:
        post_data = {
            'id': post[0],
            'content': post[1],
            'created_at': post[2]
        }
        posts_data.append(post_data)
    return jsonify(posts_data)

@app.route('/create_profile', methods=['POST'])
def create_profile():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    if not username or not password:
        return jsonify({'message': 'Username and password required', 'data': None}), 400
    cursor.execute('SELECT 1 FROM Profiles WHERE Username = %s', (username,))
    if cursor.fetchone():
        return jsonify({'message': 'Username already exists', 'data': None}), 409
    if name:
        cursor.execute('SELECT 1 FROM Profiles WHERE Profilename = %s', (name,))
        if cursor.fetchone():
            return jsonify({'message': 'Profile name already exists', 'data': None}), 409
    try:
        cursor.execute('SELECT ID FROM Profiles ORDER BY ID DESC LIMIT 1;')
        result = cursor.fetchone()
        if result and result[0] is not None:
            new_id = str(int(result[0]) + 1)
        else:
            new_id = str(1)
        cursor.execute("INSERT INTO Profiles (Username, Password, Profilename, ID, Timecreated) VALUES (%s, %s, %s, %s, NOW())", (username, password, name, new_id))
        connection.commit()
        return jsonify({'message': 'Profile created successfully', 'id': new_id}), 201
    except mysql.connector.Error as err:
        return jsonify({'message': f'Error: {err}', 'data': None}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'message': 'Username and password required', 'data': None}), 400
    cursor.execute('SELECT ID, Profilename FROM Profiles WHERE Username = %s AND Password = %s', (username, password))
    result = cursor.fetchone()
    if result:
        return jsonify({'message': 'Login successful', 'data': {'id': result[0], 'name': result[1]}}), 200
    else:
        return jsonify({'message': 'Invalid username or password', 'data': None}), 401

@app.route('/data_from_id', methods=['POST'])
def data_from_id():
    data = request.get_json()
    user_id = data.get('id')
    if not user_id:
        return jsonify({'message': 'User ID required', 'data': None}), 400
    cursor.execute('SELECT ID, Username, Profilename, Timecreated FROM Profiles WHERE ID = %s', (user_id,))
    result = cursor.fetchone()
    if result:
        profile_data = {
            'id': result[0],
            'username': result[1],
            'name': result[2],
            'timecreated': str(result[3])
        }
        return jsonify({'message': 'Profile found', 'data': profile_data}), 200
    else:
        return jsonify({'message': 'Profile not found', 'data': None}), 404




if __name__ == '__main__':
    app.run(debug=True)