import json

def convert_txt_to_json(input_file='artists.txt', output_file='artists.json'):
    # Ler o arquivo de texto
    with open(input_file, 'r', encoding='utf-8') as file:
        text = file.read()
    
    # Processar cada entrada
    artists = []
    for entry in text.split(';'):
        entry = entry.strip()
        if not entry:
            continue
        
        # Dividir nome e bandas
        parts = entry.split('-', 1)
        if len(parts) != 2:
            continue
        
        name = parts[0].strip()
        bands_text = parts[1].strip()
        
        # Criar objeto artista
        artist = {
            "name": name,
            "bands": [band.strip() for band in bands_text.split(',')],
            "metadata": {}  # Metadados podem ser adicionados posteriormente
        }
        artists.append(artist)
    
    # Escrever o arquivo JSON
    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(artists, file, ensure_ascii=False, indent=2)
    
    print(f"Arquivo {output_file} criado com sucesso com {len(artists)} artistas.")

if __name__ == "__main__":
    convert_txt_to_json()
