import hashlib
import io
from flask import Flask, request
import json
import mysql.connector
import mysql.connector.pooling
import mysql.connector.errors
from mysql.connector import errorcode

app = Flask(__name__)

# Tietokantayhteys
tiedosto = io.open("/home/reetuinkila/saa/dbconfig.json", encoding="UTF-8")
dbconfig = json.load(tiedosto)
try:
    pool=mysql.connector.pooling.MySQLConnectionPool(pool_name="tietokantayhteydet",
    pool_size=2, #PythonAnywheren ilmaisen tunnuksen maksimi on kolme
    **dbconfig
    ) 
except mysql.connector.Error:
  if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
    print("Tunnus tai salasana on väärin")
  elif err.errno == errorcode.ER_BAD_DB_ERROR:
    print("Tietokantaa ei löydy")
  else:
    print(err)
 
@app.route('/')
def hello_world():
    return 'Hello World'
 

@app.route('/add', methods=['POST'])
def lisaa_saa_data():
    data = request.data.decode('utf-8')
    temperature, humidity, pressure, password = data.split(',')

    # Check password
    if password:
        m = hashlib.sha512()
        m.update(password_key.encode("UTF-8"))
        m.update(password.encode("UTF-8"))
        password = m.hexdigest()
        if password != password_coded:
            return "Wrong password", 400
    else:
       return "Missing password", 400

    # Check if all required parameters are present
    if temperature is None or humidity is None or pressure is None:
        return "Missing parameters", 400
    
    temperature = float(temperature)
    humidity = float(humidity)
    pressure = float(pressure)



    return "Data received successfully"

if __name__ == '__main__':
    app.run()
