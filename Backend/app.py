from flask import Flask, request, jsonify, redirect
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv
import os
import mysql.connector as msc
from database_creator import create_database, add_data, check_database_exists



app = Flask(__name__)
CORS(app)
load_dotenv()

@app.route('/login', methods=['OPTIONS', 'POST'])
@cross_origin()
def login():
    sql_password = os.getenv('SQL_PASSWORD')
    conn = msc.connect(
        host="localhost",
        user="root",
        passwd=sql_password)
    # checkign database and creating if not exist
    if request.method == 'OPTIONS':
        return _build_cors_prelight_response()
    if not check_database_exists('scamazon', sql_password):
        create_database(sql_password)
        add_data(sql_password)
    cursor = conn.cursor()
    cursor.execute("USE scamazon")

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    print(f"username: {username}, password: {password}, role: {role}")
    # checking if the user exists in the database
    if role=="seller":
        # it is a seller
        cursor.execute(f'SELECT seller_id FROM Seller WHERE username="{username}" AND password="{password}"')
        print("Query executed:- ")
        print(f'SELECT seller_id FROM Seller WHERE username="{username}" AND password="{password}"')
    else:
        # it is a user
        cursor.execute(f'SELECT user_id FROM User WHERE username="{username}" AND password="{password}"')
        print("Query executed:- ")
        print(f'SELECT user_id FROM User WHERE username="{username}" AND password="{password}"')
    user = cursor.fetchone()
    # closing connection
    cursor.close()
    conn.close()
    if user:
        return jsonify({"verified": True, "id": user[0]}), 200
    else:
        return jsonify({"verified": False, "message": "Invalid credentials"}), 200

def _build_cors_prelight_response():
    response = jsonify()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

if __name__ == '__main__':
    app.run(debug=True)
