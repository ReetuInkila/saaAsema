import io
from flask import Flask
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
 
if __name__ == '__main__':
    app.run()
