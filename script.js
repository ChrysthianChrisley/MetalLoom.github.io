// Estrutura para armazenar os dados dos artistas e suas conexões
let artistsData = [];
let currentNetwork = null;
let allArtistNames = []; // Array para armazenar todos os nomes de artistas

// Função para carregar os dados do arquivo artists.txt
async function loadArtistsData() {
    try {
        const response = await fetch('artists.txt');
        if (!response.ok) {
            throw new Error(`Erro ao carregar o arquivo: ${response.status}`);
        }
        const dataText = await response.text();
        artistsData = parseArtistsData(dataText);
        allArtistNames = artistsData.map(artist => artist.name).sort(); // Carrega e ordena os nomes
    } catch (error) {
        console.error("Não foi possível carregar os dados dos artistas:", error);
        // Aqui você pode adicionar alguma lógica para lidar com o erro,
        // como exibir uma mensagem para o usuário.
    }
}

// Função para fazer o parsing dos dados do arquivo de texto
function parseArtistsData(dataText) {
    const lines = dataText.trim().split(';').filter(line => line.trim() !== '');

    const artists = [];
    const bandsMap = new Map(); // Mapeia bandas para artistas que pertencem a elas

    lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        const artistParts = cleanLine.split('-');
        if (artistParts.length < 2) return;

        const artistName = artistParts[0].trim();
        const bandsText = artistParts[1].trim();
        const bands = bandsText.split(',').map(band => band.trim());

        // Adiciona o artista ao array de artistas
        const artist = {
            name: artistName,
            bands: bands
        };
        artists.push(artist);

        // Mapeia cada banda para os artistas que fazem parte dela
        bands.forEach(band => {
            if (!bandsMap.has(band)) {
                bandsMap.set(band, []);
            }
            bandsMap.get(band).push(artistName);
        });
    });

    // Adiciona as conexões com base nas bandas em comum
    artists.forEach(artist => {
        artist.connections = [];

        // Para cada banda do artista
        artist.bands.forEach(band => {
            // Pega todos os outros artistas dessa banda
            const bandmates = bandsMap.get(band).filter(name => name !== artist.name);

            // Adiciona conexões não duplicadas
            bandmates.forEach(bandmate => {
                if (!artist.connections.some(conn => conn.name === bandmate)) {
                    const commonBands = artists
                        .find(a => a.name === bandmate)?.bands
                        .filter(b => artist.bands.includes(b)) || [];

                    artist.connections.push({
                        name: bandmate,
                        commonBands: commonBands
                    });
                }
            });
        });
    });

    return artists;
}

// Função para inicializar a visualização
async function initializeVisualization() {
    // Carregar e processar os dados do arquivo
    await loadArtistsData();

    // Configurar manipuladores de eventos
    const searchInput = document.getElementById('search-input');
    const autocompleteList = document.getElementById('autocomplete-list');
    const searchButton = document.getElementById('search-button');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        if (query) {
            updateAutocompleteList(query, autocompleteList);
        } else {
            autocompleteList.classList.add('hidden');
            autocompleteList.innerHTML = '';
        }
    });

    autocompleteList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            searchInput.value = event.target.textContent;
            autocompleteList.classList.add('hidden');
            searchArtist(event.target.textContent);
        }
    });

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchArtist(query);
        }
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchArtist(query);
            }
        }
    });
}

function updateAutocompleteList(query, listElement) {
    const filteredArtists = allArtistNames.filter(name =>
        name.toLowerCase().startsWith(query.toLowerCase())
    );

    listElement.innerHTML = '';
    if (filteredArtists.length > 0) {
        filteredArtists.forEach(artistName => {
            const listItem = document.createElement('li');
            listItem.textContent = artistName;
            listElement.appendChild(listItem);
        });
        listElement.classList.remove('hidden');
    } else {
        listElement.classList.add('hidden');
    }
}

// Função para buscar artista
function searchArtist(query) {
    // Busca case-insensitive e parcial
    const results = artistsData.filter(artist =>
        artist.name.toLowerCase() === query.toLowerCase()
    );

    if (results.length > 0) {
        // Exibe o primeiro resultado da busca (deveria ser único com busca exata)
        displayArtistNetwork(results[0]);
    } else {
        showNoResults();
    }
}

// Função para exibir a rede de conexões de um artista
function displayArtistNetwork(artist) {
    // Esconde mensagem inicial e de "sem resultados"
    document.getElementById('initial-message').classList.add('hidden');
    document.getElementById('no-results').classList.add('hidden');

    // Exibe informações do artista
    const artistInfo = document.getElementById('artist-info');
    artistInfo.classList.remove('hidden');

    document.getElementById('artist-name').textContent = artist.name;

    const artistBands = document.getElementById('artist-bands');
    artistBands.innerHTML = `<strong>Bandas:</strong> ${artist.bands.join(', ')}`;

    const connectionsList = document.getElementById('artist-connections');
    connectionsList.innerHTML = '';

    artist.connections.forEach(connection => {
        const li = document.createElement('li');
        li.textContent = `${connection.name} (Bandas em comum: ${connection.commonBands.join(', ')})`;
        li.addEventListener('click', () => {
            const connectedArtist = artistsData.find(a => a.name === connection.name);
            if (connectedArtist) {
                displayArtistNetwork(connectedArtist);
            }
        });
        connectionsList.appendChild(li);
    });

    // Cria a visualização da rede
    createNetworkVisualization(artist);
}

// Função para gerar cores para as bandas
function getBandColors() {
    // Lista de cores para as diferentes bandas
    return [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFBE0B",
        "#FB5607", "#8338EC", "#3A86FF", "#FF006E",
        "#A5E6BA", "#FFCFD2", "#F8D49F", "#B5D99C"
    ];
}

// Função para criar a visualização da rede utilizando D3.js
function createNetworkVisualization(centralArtist) {
    // Limpa a visualização anterior se existir
    d3.select("#network-visualization").selectAll("*").remove();

    const svg = d3.select("#network-visualization");
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    // Cria os dados para o grafo
    const nodes = [
        { id: centralArtist.name, group: 1, artist: centralArtist }
    ];

    const links = [];

    // Adiciona as conexões como nós e links
    centralArtist.connections.forEach(connection => {
        const connectedArtist = artistsData.find(a => a.name === connection.name);

        nodes.push({
            id: connection.name,
            group: 2,
            artist: connectedArtist
        });

        links.push({
            source: centralArtist.name,
            target: connection.name,
            value: connection.commonBands.length,
            commonBands: connection.commonBands
        });
    });

    // Coletando todas as bandas únicas para colorir as conexões
    const allBands = new Set();
    links.forEach(link => {
        link.commonBands.forEach(band => allBands.add(band));
    });
    const bandsList = Array.from(allBands);

    const bandColors = getBandColors();
    const bandColorMap = {};
    bandsList.forEach((band, i) => {
        bandColorMap[band] = bandColors[i % bandColors.length];
    });

    // Definir gradientes para links com várias bandas em comum
    const defs = svg.append("defs");

    links.forEach((link, i) => {
        // Criar ID único para o gradiente
        const gradientId = `link-gradient-${i}`;

        // Se houver mais de uma banda em comum, criar gradiente
        if (link.commonBands.length > 1) {
            const gradient = defs.append("linearGradient")
                .attr("id", gradientId)
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", "100%")
                .attr("y2", 0);

            // Adicionar stops para cada banda
            link.commonBands.forEach((band, j) => {
                gradient.append("stop")
                    .attr("offset", `${j * (100 / (link.commonBands.length - 1))}%`)
                    .attr("stop-color", bandColorMap[band]);
            });

            // Especificar que este link usa o gradiente
            link.gradient = gradientId;
        } else if (link.commonBands.length === 1) {
            // Se houver apenas uma banda, usar sua cor diretamente
            link.color = bandColorMap[link.commonBands[0]];
        } else {
            // Sem bandas em comum (não deve acontecer)
            link.color = "#999";
        }
    });

    // Adicionar legenda de cores
    const legendSize = 15;
    const legendSpacing = 5;
    const legendX = 20;
    const legendY = 20;

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${legendX}, ${legendY})`);

    const legendItems = legend.selectAll(".legend-item")
        .data(bandsList)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * (legendSize + legendSpacing)})`);

    legendItems.append("rect")
        .attr("width", legendSize)
        .attr("height", legendSize)
        .attr("fill", d => bandColorMap[d]);

    legendItems.append("text")
        .attr("x", legendSize + legendSpacing)
        .attr("y", legendSize - 2)
        .attr("font-size", "12px")
        .attr("fill", "#555")
        .text(d => d);

    // Cria a simulação da força
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Grupo para links
    const linkGroup = svg.append("g").attr("class", "links");

    // Cria os links (linhas)
    const link = linkGroup.selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", d => d.gradient ? `url(#${d.gradient})` : d.color || "#ccc")
        .attr("stroke-width", d => Math.max(2, Math.sqrt(d.value) * 3));

    // Cria tooltip para mostrar bandas em comum nos links
    link.append("title")
        .text(d => `Bandas em comum: ${d.commonBands.join(", ")}`);

    // Cria os nós (círculos)
    const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter().append("g")
        .attr("class", d => d.id === centralArtist.name ? "node selected" : "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Adiciona círculos aos nós
    node.append("circle")
        .attr("r", d => d.id === centralArtist.name ? 15 : 10)
        .attr("fill", d => d.id === centralArtist.name ? "#00bcd4" : "#5a67d8")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .append("title")
        .text(d => `${d.id}\nBandas: ${d.artist.bands.join(", ")}`);

    // Adiciona texto aos nós
    node.append("text")
        .attr("dx", 15)
        .attr("dy", ".35em")
        .attr("fill", "#333")
        .attr("stroke", "none")
        .attr("paint-order", "fill")
        .attr("font-size", "12px")
        .attr("font-weight", "500")
        .text(d => d.id);

    // Adiciona interação de clique nos nós
    node.on("click", (event, d) => {
        if (d.id !== centralArtist.name) {
            displayArtistNetwork(d.artist);
        }
    });

    // Função de atualização da simulação
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => {
                // Limitar a posição dentro dos limites do SVG com margem
                const margin = 50;
                const x = Math.max(margin, Math.min(width - margin, d.x));
                const y = Math.max(margin, Math.min(height - margin, d.y));
                return `translate(${x},${y})`;
            });
    });

    // Funções para o arrastar
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Salva a rede atual para referência
    currentNetwork = { simulation, nodes, links };
}

// Função para mostrar mensagem quando nenhum resultado é encontrado
function showNoResults() {
    document.getElementById('initial-message').classList.add('hidden');
    document.getElementById('artist-info').classList.add('hidden');
    document.getElementById('no-results').classList.remove('hidden');

    // Limpa a visualização
    d3.select("#network-visualization").selectAll("*").remove();
}

// Inicializa a aplicação quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', initializeVisualization);