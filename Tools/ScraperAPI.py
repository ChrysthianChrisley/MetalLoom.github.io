import requests

payload = { 'api_key': 'eaea79b87fd16ea3115280e73e355aa1', 'url': 'https://www.metal-archives.com/bands/Hypothermia/19074' }
r = requests.get('https://api.scraperapi.com/', params=payload)
print(r.text)
