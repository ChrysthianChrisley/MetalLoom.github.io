from bs4 import BeautifulSoup
import requests

def parseUrl(band_name, url):
    banda_principal = band_name
    
    payload = {
        'api_key': 'eaea79b87fd16ea3115280e73e355aa1',
        'url': url,
        'render': 'true'
    }
    # Fazer a requisição
    html_content = requests.get('https://api.scraperapi.com/', params=payload)
    if html_content.status_code == 200:
        soup = BeautifulSoup(html_content.text, 'html.parser')
        
        # Lista para armazenar todos os membros
        all_members_data = []
        
        # Procurar em diferentes seções de lineup (current, past, live, all)
        lineup_sections = [
            'band_tab_members_all',
            'band_tab_members_current',
            'band_tab_members_past',
            'band_tab_members_live'
        ]
        
        found_any_section = False
        
        for section_id in lineup_sections:
            members_div = soup.find('div', id=section_id)
            if members_div:
                found_any_section = True
                print(f"Encontrada seção: {section_id}")
                
                # Encontrar todas as linhas de membros nesta seção
                lineup_rows = members_div.find_all('tr', class_='lineupRow')
                
                for row in lineup_rows:
                    # Extrair o nome do membro
                    name_tag = row.find('a', class_='bold')
                    if not name_tag:
                        # Tentar encontrar sem o link, apenas o texto em negrito
                        name_tag = row.find('td').find(text=True, recursive=False)
                    
                    name = name_tag.get_text(strip=True) if name_tag else 'Nome não encontrado'
                    
                    # Extrair o papel e período
                    role_cell = row.find_all('td')[1] if len(row.find_all('td')) > 1 else None
                    role = role_cell.get_text(strip=True) if role_cell else 'Papel não encontrado'
                    
                    # Encontrar a linha seguinte que contém as bandas relacionadas
                    bands_row = row.find_next_sibling('tr', class_='lineupBandsRow')
                    bands = []
                    
                    if bands_row:
                        # Extrair texto completo da linha de bandas relacionadas
                        full_text = bands_row.get_text(strip=True)
                        
                        # Remover o "See also:" se presente
                        if "See also:" in full_text:
                            full_text = full_text.replace("See also:", "")
                        
                        # Extrair TODAS as bandas (com e sem links)
                        # Primeiro pegamos as bandas com links
                        bands_links = bands_row.find_all('a')
                        for band in bands_links:
                            bands.append({
                                'name': band.get_text(strip=True),
                                'url': band['href']
                            })
                        
                        # Depois pegamos o texto restante que contém bandas sem links
                        remaining_text = full_text
                        # Remove o texto das bandas que já foram capturadas (com links)
                        for band in bands_links:
                            remaining_text = remaining_text.replace(band.get_text(strip=True), '')
                        
                        # Processa o texto restante para pegar bandas sem links (como "ex-Dethroned")
                        if remaining_text.strip():
                            # Remove vírgulas e espaços extras
                            remaining_text = remaining_text.replace(',,', ',').strip('')
                            # Divide por vírgulas
                            band_names = [name.strip() for name in remaining_text.split(',') if name.strip()]
                            
                            for band_name in band_names:
                                # Verifica se a banda já não foi adicionada (com link)
                                if not any(b['name'].lower() == band_name.lower() for b in bands):
                                    bands.append({
                                        'name': band_name,
                                        'url': ''  # URL vazia para bandas sem link
                                    })
                                        
                    # Adicionar à lista completa, evitando duplicatas
                    member_exists = False
                    for existing_member in all_members_data:
                        if existing_member['name'] == name and existing_member['role'] == role:
                            member_exists = True
                            # Se o membro já existe, apenas adiciona bandas não duplicadas
                            for band in bands:
                                if band not in existing_member['related_bands']:
                                    existing_member['related_bands'].append(band)
                            break
                    
                    if not member_exists:
                        all_members_data.append({
                            'name': name,
                            'role': role,
                            'related_bands': bands
                        })
                    #print("all_members_data:", all_members_data,"\n")
                    
        if all_members_data:
            
            with open('artists.txt', 'a', encoding='utf-8') as f:
                for member in all_members_data:
                    # 1. Garantir que usamos o nome correto da banda principal
                    main_band_name = banda_principal  # "Silencer" no exemplo
                    
                    # 2. Iniciar a lista de bandas com a banda principal
                    combined_bands = [main_band_name]
                    
                    # 3. Adicionar bandas relacionadas (filtrando strings vazias)
                    for band in member['related_bands']:
                        band_name = band['name'].strip()
                        # Evitar duplicatas e strings vazias (comparação case-insensitive)
                        if band_name and band_name.lower() != main_band_name.lower():
                            combined_bands.append(band_name)
, ;                    
                    # 4. Filtrar itens vazios e juntar com vírgula
                    filtered_bands = [b for b in combined_bands if b]  # Remove strings vazias
                    bands_str = ", ".join(filtered_bands)
                    
                    # 5. Remover vírgulas consecutivas e vírgulas no final
                    bands_str = bands_str.replace(", ,", ", ").strip(", ")
                    
                    # 6. Formatar a linha final
                    output_line = f"{member['name']} - {bands_str};"
                    
                    # 7. Escrever no arquivo
                    f.write(output_line.replace("ex-","").replace(" ex-,","").replace(", , ",", ").replace(", ;",";") + "\n")
                    print(output_line.replace("ex-","").replace(" ex-,","").replace(", , ",", ").replace(", ;",";"))
                print(f"Dados salvos com sucesso em artists.txt")
                
        elif found_any_section:
            print(f"Nenhum membro encontrado para a banda {band_name}, embora as seções de lineup tenham sido encontradas.")
        else:
            print(f"Nenhuma seção de lineup encontrada para a banda {band_name}.")
    else:
        print(f"Erro ao acessar a página: {html_content.status_code}")

if __name__ == '__main__':
    # Exemplo para teste
    parseUrl(band_name, url)
