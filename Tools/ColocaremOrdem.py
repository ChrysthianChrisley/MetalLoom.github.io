def clean_artists_file(file_path):
    # Read the file and process entries
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Process entries
    unique_entries = set()
    for line in lines:
        stripped = line.strip()
        if stripped:  # Only process non-empty lines
            # Remove any trailing semicolons and whitespace
            cleaned = stripped.rstrip(';').strip()
            # Normalize the entry
            normalized = ' - '.join(part.strip() for part in cleaned.split('-', 1))
            unique_entries.add(normalized)
    
    # Sort entries
    sorted_entries = sorted(unique_entries, key=lambda x: x.split('-')[0].strip().lower())
    
    # Write back to file with exactly one semicolon per line
    with open(file_path, 'w', encoding='utf-8') as f:
        for entry in sorted_entries:
            f.write(entry + ';\n')  # Add exactly one semicolon and newline

if __name__ == "__main__":
    file_path = 'artists.txt'
    clean_artists_file(file_path)
    print(f"Arquivo {file_path} processado com sucesso (duplicados removidos, ordenado alfabeticamente e formatado com um único ; por linha).")
