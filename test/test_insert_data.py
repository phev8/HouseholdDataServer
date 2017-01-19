import json
from datetime import datetime, timedelta
import urllib.request
from math import sin, cos

base = datetime.today()
date_list = [base - timedelta(minutes=x) for x in range(0, 60*24)]

def send_values(addr, sensor, timestamp, value):
	params = json.dumps({"timestamp": timestamp.isoformat(), "value": value, "sensorName": sensor}).encode('utf8')
	req = urllib.request.Request(addr + "/measurement/insertData", data=params, headers={'content-type': 'application/json'})
	try:
		response = urllib.request.urlopen(req)
		login_respone = json.loads(response.read().decode('utf8'))
		print(login_respone)
	except urllib.error.HTTPError as e:
		print(e)			
	

	
addr = "http://localhost:1337"

for i in range(0, len(date_list)):
	timestamp = date_list[-i]
	t_value = sin(i*3.14/180)
	h_value = cos(i*3.14/180)

	send_values(addr, "temperature", timestamp, t_value)
	send_values(addr, "humidity", timestamp, h_value)



	
