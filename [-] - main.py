def find_band_in_file(band_name, file_path="bandas_e_urls.txt"):
    """
    Procura uma banda exata no arquivo e retorna sua URL.
    
    Args:
        band_name (str): Nome da banda a ser procurada
        file_path (str): Caminho para o arquivo com as bandas e URLs
        
    Returns:
        str or None: URL da banda se encontrada, None se não encontrada
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            for line in file:
                if line.strip():  # Verifica se a linha não está vazia
                    parts = line.strip().split(' - ')
                    if len(parts) == 2:
                        name, url = parts
                        # Verificação exata do nome da banda
                        if name.lower() == band_name.lower():
                            return url
        return None
    except FileNotFoundError:
        print(f"Arquivo {file_path} não encontrado.")
        return None

def main():
    """
    Função principal que obtém o nome da banda do usuário,
    verifica no arquivo e executa o parseUrl se encontrada.
    """
    band_name = input("Digite uma banda: ")
    
    # Procura a banda no arquivo
    url = find_band_in_file(band_name)
    
    if url:
        try:
            # Importa a função parseUrl do módulo ApiScrape
            from ApiScrape import parseUrl
            
            print(f"Banda encontrada: {band_name}")
            print(f"URL: {url}")
            print("Executando parseUrl...")
            
            # Executa a função parseUrl com a URL encontrada
            parseUrl(band_name, url)
            
        except ImportError:
            print("Erro ao importar o módulo ApiScrape.py. Verifique se o arquivo existe no diretório atual.")
        except Exception as e:
            print(f"Erro ao executar parseUrl: {e}")
    else:
        print(f"Banda '{band_name}' não encontrada no arquivo. Verifique o nome ou adicione a banda ao arquivo.")

if __name__ == "__main__":
    main()
