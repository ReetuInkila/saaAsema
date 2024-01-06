from datetime import datetime, timedelta
import hashlib
import io
from flask import Flask, make_response, render_template, request
import json
from decimal import Decimal
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
def index():
    return render_template('index.xhtml')

@app.route('/saa')
def saa():
    result = kysely(hae_saa,())[0]
    result['aika'] =  result['aika'].strftime('%Y-%m-%d %H:%M:%S')
    data = json.dumps(result, default=serialize_decimal)
    response = make_response(data, 200)
    response.headers['Content-Type'] = 'application/json'
    return response

@app.route('/historia/')
def historia():
    period = request.args.get('period')
    if period == 'week':
        end_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        start_date = (datetime.now() - timedelta(days=6)).strftime('%Y-%m-%d')
    elif period == 'day':
        end_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        start_date = (datetime.now() - timedelta(hours=23)).strftime('%Y-%m-%d %H:%M:%S')
    else:
        end_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')


        
    result = kysely(hae_ajalla,(start_date, end_date,))

    data = json.dumps(result, default=serialize_decimal)
    response = make_response(data, 200)
    response.headers['Content-Type'] = 'application/json'
    return response

def serialize_decimal(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, datetime):
        return obj.strftime('%Y-%m-%d %H:%M:%S')  # Convert datetime to string
    raise TypeError(f"Type {type(obj)} not serializable")


 
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

# Tekee sql-kyselyt
def kysely(sql, parametrit):
    tulos = None
    try:
        con = pool.get_connection()
        cur = con.cursor(buffered=True, dictionary=True)
        cur.execute(sql, parametrit)
        tulos = cur.fetchall()
        cur.close()
    except Exception as e:
        raise Exception("Virhe kyselyssä" + str(e))
    finally:
        con.close()#vapautetaan tietokantayhteys takaisin pooliin
    return tulos

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

# Hakee sää datapisteet
hae_saa = """
SELECT *
FROM saaData
ORDER BY id DESC
LIMIT 1;
"""

hae_ajalla ="""
SELECT * FROM saaData WHERE aika BETWEEN %s AND %s;
"""

# Lisää joukkueen tietokantaan
lisaa_saa_data = """
INSERT INTO saaData (aika, lampo, paine, kosteus)
VALUES (%s, %s, %s, %s)
"""



if __name__ == '__main__':
    app.run()