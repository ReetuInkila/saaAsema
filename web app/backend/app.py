from datetime import datetime, timedelta
import hashlib
import io
from flask import Flask, make_response, redirect, request
import json
from decimal import Decimal
import mysql.connector
import mysql.connector.pooling
import mysql.connector.errors
from mysql.connector import errorcode
from secrets import password_coded, password_key
from flask_caching import Cache
from flask_cors import CORS
import pytz

app = Flask(__name__)
CORS(app)

# Configure Flask-Caching
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

# Database Connection
tiedosto = io.open("/home/reetuinkila/saa/dbconfig.json", encoding="UTF-8")
dbconfig = json.load(tiedosto)
try:
    pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name="tietokantayhteydet",
        pool_size=2,  # PythonAnywhere's free account limit is three
        **dbconfig
    )
except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Tunnus tai salasana on väärin")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Tietokantaa ei löydy")
    else:
        print(err)


# home route that redirects to new frontend app
@app.route("/")
def home():
    return redirect("https://lampotila.rinkila.fi/", code=302)


@app.route('/saa')
@cache.cached(timeout=3600)
def saa():
    """Get the latest weather data and return it as a JSON response."""
    result = kysely(hae_saa, ())[0]
    result['aika'] = result['aika'].strftime('%Y-%m-%d %H:%M:%S')
    data = json.dumps(result, default=serialize_decimal)
    response = make_response(data, 200)
    response.headers['Content-Type'] = 'application/json'
    return response

@app.route('/historia/')
@cache.cached(timeout=3600, key_prefix=lambda: request.args.get('period'))
def historia():
    """Get historical weather data based on the specified period and return it as a JSON response."""
    period = request.args.get('period')
    if period == 'week':
        start_date = (datetime.now() - timedelta(days=6)).strftime('%Y-%m-%d')
    elif period == 'day':
        start_date = (datetime.now() - timedelta(hours=23)).strftime('%Y-%m-%d %H:%M:%S')
    else:
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')

    result = kysely(hae_ajalla, (start_date,))

    data = json.dumps(result, default=serialize_decimal)
    response = make_response(data, 200)
    response.headers['Content-Type'] = 'application/json'
    return response

def serialize_decimal(obj):
    """Serialize Decimal and datetime objects to a format suitable for JSON serialization."""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, datetime):
        return obj.strftime('%Y-%m-%d %H:%M:%S')  # Convert datetime to string
    raise TypeError(f"Type {type(obj)} not serializable")

@app.route('/add', methods=['POST'])
def lisaa_saa_data():
    """Add weather data to the database."""
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
    
    finnish_timezone = pytz.timezone('Europe/Helsinki')

    temperature = float(temperature)
    humidity = float(humidity)
    pressure = float(pressure)
    date = datetime.now(finnish_timezone)

    id = lisaa(lisaa_saa_data, (date, temperature, pressure, humidity))

    return "Data received successfully"

# Execute SQL queries
def kysely(sql, parametrit):
    """Execute a SQL query and return the result."""
    tulos = None
    try:
        con = pool.get_connection()
        cur = con.cursor(buffered=True, dictionary=True)
        cur.execute(sql, parametrit)
        tulos = cur.fetchall()
        cur.close()
    except Exception as e:
        raise Exception("Error in query: " + str(e))
    finally:
        con.close()  # Release the database connection back to the pool
    return tulos

# Add data to the database
def lisaa(sql, parametrit):
    """Add data to the database."""
    try:
        con = pool.get_connection()
        cur = con.cursor(buffered=True, dictionary=True)
        cur.execute(sql, parametrit)

        cur.execute("SELECT LAST_INSERT_ID()")
        tulos = cur.fetchone()["LAST_INSERT_ID()"]

        con.commit()
        cur.close()
    except Exception as e:
        raise Exception("Error in query: " + str(e) + str(parametrit))
    finally:
        con.close()
    return tulos

# Retrieve weather data
hae_saa = """
SELECT *
FROM saaData
ORDER BY id DESC
LIMIT 1;
"""

# Retrieve weather data between date values
hae_ajalla = """
SELECT * FROM saaData WHERE aika > %s;
"""

# Add weather data to the database
lisaa_saa_data = """
INSERT INTO saaData (aika, lampo, paine, kosteus)
VALUES (%s, %s, %s, %s)
"""

if __name__ == '__main__':
    app.run()