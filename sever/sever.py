import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

try:
    connection = mysql.connector.connect(
        host="localhost",  # Or your MySQL server's IP address
        user="boan",
        password="768073",
        database="social_justice_social_media" # Optional: connect to a specific database
    )
    cursor = connection.cursor()

    if connection.is_connected():
        print("Connected to MySQL database successfully!")

        posts_list = cursor.execute("SELECT * FROM Posts;")
        print(cursor.fetchall())

        @app.route('/api/data')
        def get_posts():
            cursor.execute("SELECT * FROM Posts;")
            posts = cursor.fetchall()

            # Convert fetched rows into a list of dictionaries (for JSON serialization)
            posts_data = []
            for post in posts:
                post_data = {
                    'id': post[0],  # assuming first column is post ID
                    'content': post[1],  # assuming second column is content
                    'created_at': post[2]  # assuming third column is creation timestamp
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
            cursor.execute('SELECT 1 FROM Users WHERE Username = %s', (username,))
            if cursor.fetchone():
                return jsonify({'message': 'Username already exists', 'data': None}), 409
            if name:
                cursor.execute('SELECT 1 FROM Users WHERE Profilename = %s', (name,))
                if cursor.fetchone():
                    return jsonify({'message': 'Profile name already exists', 'data': None}), 409

            try:
                cursor.execute('SELECT ID FROM Users ORDER BY ID DESC LIMIT 1;')
                result = cursor.fetchone()
                if result and result[0] is not None:
                    new_id = result[0] + 1
                else:
                    new_id = 1

                cursor.execute("INSERT INTO Users (Username, Password, Profilename, ID) VALUES (%s, %s, %s, %s)", (username, password, name, new_id))
                connection.commit()
                return jsonify({'message': 'Profile created successfully', 'data': {'username': username, 'id': new_id}}), 201
            except mysql.connector.Error as err:
                return jsonify({'message': f'Error: {err}', 'data': None}), 500


        


except mysql.connector.Error as err:
    print(f"Error connecting to MySQL: {err}")





if __name__ == '__main__':
    app.run(debug=True)