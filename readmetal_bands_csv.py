import pandas as pd

try:
    # Carrega o arquivo CSV, especificando o tipo da coluna 'Band ID' como string (para evitar o aviso)
    df = pd.read_csv('metal_bands.csv', dtype={'Band ID': str})

    # Seleciona as colunas 'Name' e 'URL'
    bands_info = df[['Name', 'URL']].copy()  # Use .copy() para evitar SettingWithCopyWarning

    # Cria uma nova coluna combinando 'Name' e 'URL' com o separador '-'
    bands_info['Name - URL'] = bands_info['Name'] + ' - ' + bands_info['URL']

    # Salva apenas a nova coluna no arquivo .txt
    bands_info[['Name - URL']].to_csv('bandas_e_urls.txt', sep='\n', index=False, header=False)

    print("Os dados de 'Name' e 'URL' foram combinados e salvos com sucesso no arquivo 'bandas_e_urls.txt' com o separador '-'.")

except FileNotFoundError:
    print("Erro: O arquivo 'metal_bands.csv' não foi encontrado.")
except Exception as e:
    print(f"Ocorreu um erro: {e}")
