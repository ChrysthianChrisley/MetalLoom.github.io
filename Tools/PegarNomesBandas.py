from bs4 import BeautifulSoup
import requests

def scrape_band_members(url):
    """
    Scrape the complete lineup of a band from a Metal Archives page.

    Args:
        url (str): The URL of the band's page on Metal Archives.

    Returns:
        dict: A dictionary where keys are band members and values are their associated bands.
              Returns None if an error occurs during scraping.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes
        soup = BeautifulSoup(response.content, 'html.parser')

        band_content = soup.find('div', id='band_content')
        if not band_content:
            print(f"Erro: Não encontrei a div 'band_content' na página {url}")
            return None

        complete_lineup_header = band_content.find('tr', class_='lineupHeaders', string=lambda text: text and 'Current' in text)
        if not complete_lineup_header:
            complete_lineup_header = band_content.find('tr', class_='lineupHeaders', string=lambda text: text and 'Past' in text)
            if not complete_lineup_header:
                print(f"Aviso: Não encontrei o cabeçalho 'Current' ou 'Past' lineup na página {url}")
                return None

        members_data = {}
        current_member = None

        # Navigate to the table containing the complete lineup
        lineup_table = complete_lineup_header.find_parent('table', class_='lineupTable')
        if not lineup_table:
            print(f"Erro: Não encontrei a tabela de lineup para a página {url}")
            return None

        rows = lineup_table.find_all(['tr'], recursive=False)

        collecting_members = False
        for row in rows:
            if row.has_attr('class') and 'lineupHeaders' in row['class']:
                if row.get_text(strip=True) == 'Current' or row.get_text(strip=True) == 'Past':
                    collecting_members = True
                else:
                    collecting_members = False
                continue

            if not collecting_members:
                continue

            if row.has_attr('class') and 'lineupRow' in row['class']:
                member_link = row.find('a', class_='bold')
                if member_link:
                    current_member = member_link.get_text(strip=True)
                    members_data[current_member] = []
            elif row.has_attr('class') and 'lineupBandsRow' in row['class'] and current_member:
                bands_cell = row.find('td', colspan='2')
                if bands_cell:
                    bands_text = bands_cell.get_text(strip=True)
                    # Split by commas and clean up whitespace
                    bands = [band.strip() for band in bands_text.split(',') if band.strip()]
                    members_data[current_member].extend(bands)

        return members_data

    except requests.exceptions.RequestException as e:
        print(f"Erro de requisição para {url}: {e}")
        return None
    except Exception as e:
        print(f"Ocorreu um erro ao processar {url}: {e}")
        return None

if __name__ == "__main__":
    url = "https://www.metal-archives.com/bands/Sadocrush/3540274213"
    band_members = scrape_band_members(url)

    if band_members:
        for member, bands in band_members.items():
            print(f"{member} e {', '.join(bands)}")
