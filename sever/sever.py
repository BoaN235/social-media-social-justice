import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "*",   # 🔓 any origin allowed
    "allow_headers": ["Content-Type", "Authorization"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "supports_credentials": True
}})



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

# Create a new post
@app.route('/create_post', methods=['POST'])
def create_post():
    data = request.get_json()
    user_id = data.get('user_id')
    content = data.get('content')
    if not user_id or not content:
        return jsonify({'message': 'User ID and content required', 'data': None}), 400
    try:
        # Get the latest post ID
        cursor.execute('SELECT PostID FROM Posts ORDER BY PostID DESC LIMIT 1;')
        result = cursor.fetchone()
        if result and result[0] is not None:
            new_post_id = str(int(result[0]) + 1)
        else:
            new_post_id = str(1)
        cursor.execute('INSERT INTO Posts (PostID, UserID, PostText, Timecreated) VALUES (%s, %s, %s, NOW())', (new_post_id, user_id, content))
        connection.commit()
        return jsonify({'message': 'Post created successfully', 'data': {'id': new_post_id}}), 201
    except mysql.connector.Error as err:
        return jsonify({'message': f'Error: {err}', 'data': None}), 500

@app.route('/api/data', methods=['GET'])
def get_posts():
    cursor = connection.cursor()  # create a fresh cursor
    cursor.execute("""
        SELECT Posts.PostID, Posts.UserID, Posts.PostText, Posts.Timecreated, Profiles.Username , Posts.Likes
        FROM Posts
        LEFT JOIN Profiles ON Posts.UserID = Profiles.ID
        ORDER BY Posts.Timecreated DESC;
    """)
    posts = cursor.fetchall()
    posts_data = []
    for post in posts:
        post_data = {
            'id': post[0],
            'user_id': post[1],
            'content': post[2],
            'created_at': str(post[3]),
            'username': post[4] if post[4] else 'User',
            'likes': post[5] if post[5] else 0
        }
        posts_data.append(post_data)

    return jsonify(posts_data)


@app.route('/create_profile', methods=['POST'])
def create_profile():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    account_type = data.get('type')
    # Advisor = True, Supporter = False
    justice = None
    if account_type == 'ADVISOR':
        justice = True
    elif account_type == 'SUPPORTER':
        justice = False
    else:
        return jsonify({'message': 'Account type required (Advisor or Supporter)', 'data': None}), 400

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
        cursor.execute("INSERT INTO Profiles (Username, Password, Profilename, ID, Timecreated, justice) VALUES (%s, %s, %s, %s, NOW(), %s)", (username, password, name, new_id, justice))
        connection.commit()
        return jsonify({'message': 'Profile created successfully', 'data': {'id': new_id}}), 201
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