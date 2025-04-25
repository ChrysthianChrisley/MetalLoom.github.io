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
                            return name, url
        return None
    except FileNotFoundError:
        print(f"Arquivo {file_path} não encontrado.")
        return None

def process_bands_file():
    """
    Lê o arquivo bandasParaVerificar.txt, verifica se cada banda está em bandas_e_urls.txt,
    e chama parseUrl para as bandas encontradas.
    """
    try:
        # Abre o arquivo de bandas para verificação
        with open("bandasParaVerificar.txt", 'r', encoding='utf-8') as file:
            bands_to_check = [line.strip() for line in file if line.strip()]
        
        # Contador para estatísticas
        bands_found = 0
        bands_not_found = 0
        
        print(f"Total de bandas para verificar: {len(bands_to_check)}")
        
        # Processa cada banda
        for band_name in bands_to_check:
            result = find_band_in_file(band_name)
            nome_banda, url = result
            
            if url:
                try:
                    # Importa a função parseUrl do módulo ApiScrape
                    from ApiScrape import parseUrl
                    
                    print(f"\nBanda encontrada: {nome_banda}")
                    print(f"URL: {url}")
                    print("Executando parseUrl...")
                    
                    # Executa a função parseUrl com o nome da banda e URL encontrada
                    
                    
                    parseUrl(nome_banda, url)
                    
                    bands_found += 1
                    
                except ImportError:
                    print("\nErro ao importar o módulo ApiScrape.py. Verifique se o arquivo existe no diretório atual.")
                    break
                except Exception as e:
                    print(f"\nErro ao processar a banda {band_name}: {e}")
            else:
                print(f"\nBanda '{band_name}' não encontrada no arquivo bandas_e_urls.txt")
                bands_not_found += 1
        
        # Exibe estatísticas finais
        print("\n--- Resumo da verificação ---")
        print(f"Bandas encontradas e processadas: {bands_found}")
        print(f"Bandas não encontradas: {bands_not_found}")
        print(f"Total de bandas verificadas: {len(bands_to_check)}")
        
    except FileNotFoundError:
        print("Arquivo bandasParaVerificar.txt não encontrado.")
    except Exception as e:
        print(f"Erro inesperado: {e}")

if __name__ == "__main__":
    process_bands_file()
