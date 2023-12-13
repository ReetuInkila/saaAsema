from datetime import datetime
import hashlib
import io
from flask import Flask, request
import json
import mysql.connector
import mysql.connector.pooling
import mysql.connector.errors
from mysql.connector import errorcode
from secrets import password_coded, password_key

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
    date = datetime.now()

    id = lisaa(lisaa_saa_data, (date, temperature, pressure, humidity))

    return "Data received successfully"

# Lisää tietokantaan
def lisaa(sql, parametrit):
    try:
        con = pool.get_connection()
        cur = con.cursor(buffered=True, dictionary=True)
        cur.execute(sql, parametrit)

        cur.execute("SELECT LAST_INSERT_ID()")
        tulos = cur.fetchone()["LAST_INSERT_ID()"]

        con.commit()
        cur.close()
    except Exception as e:
        raise Exception("Virhe kyselyssä" + str(e) + str(parametrit))
    finally:
        con.close()
    return tulos

# Lisää joukkueen tietokantaan
lisaa_saa_data = """
INSERT INTO saaData (aika, lampo, paine, kosteus)
VALUES (%s, %s, %s, %s)
"""


if __name__ == '__main__':
    app.run()