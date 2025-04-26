// Structure to store artist data and their connections
let artistsData = [];
let currentNetwork = null;
let allArtistNames = [];
let allBandNames = [];
let dataLoaded = false; // Flag para indicar carregamento de dados

async function loadArtistsData() {
    try {
        const response = await fetch('artists.json');
        if (!response.ok) {
            throw new Error(`Error loading file: ${response.status}`);
        }
        artistsData = await response.json();
        artistsData = parseArtistsData(artistsData);
        allArtistNames = artistsData.map(artist => artist.name).sort();
        allBandNames = [...new Set(artistsData.flatMap(artist => artist.bands))].sort();
        dataLoaded = true; // Marca dados como carregados
        console.log('Loaded artists:', allArtistNames, 'bands:', allBandNames); // Depuração
        return artistsData;
    } catch (error) {
        console.error("Could not load artist data:", error);
        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.textContent = "Failed to load artist data. Please check the console for details.";
            noResults.classList.remove('hidden');
        }
        return [];
    }
}

function parseArtistsData(data) {
    if (!Array.isArray(data)) {
        console.error("Invalid artists data format");
        return [];
    }

    const artists = [];
    const bandsMap = new Map();

    data.forEach(artist => {
        if (!artist.name || !Array.isArray(artist.bands)) {
            console.warn(`Skipping invalid artist: ${JSON.stringify(artist)}`);
            return;
        }
        artists.push({ name: artist.name, bands: artist.bands });

        artist.bands.forEach(band => {
            if (!bandsMap.has(band)) {
                bandsMap.set(band, []);
            }
            bandsMap.get(band).push(artist.name);
        });
    });

    artists.forEach(artist => {
        artist.connections = [];
        artist.bands.forEach(band => {
            const bandmates = bandsMap.get(band).filter(name => name !== artist.name);
            bandmates.forEach(bandmate => {
                if (!artist.connections.some(conn => conn.name === bandmate)) {
                    const commonBands = artists
                        .find(a => a.name === bandmate)?.bands
                        .filter(b => artist.bands.includes(b)) || [];
                    artist.connections.push({
                        name: bandmate,
                        commonBands
                    });
                }
            });
        });
    });

    return artists;
}

async function initializeVisualization() {
    await loadArtistsData();

    const searchInput = document.getElementById('search-input');
    const autocompleteList = document.getElementById('autocomplete-list');
    const searchButton = document.getElementById('search-button');

    if (!searchInput || !autocompleteList || !searchButton) {
        console.error("Required DOM elements are missing");
        return;
    }

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().slice(0, 100);
        if (query && dataLoaded) {
            updateAutocompleteList(query, autocompleteList);
        } else {
            autocompleteList.classList.add('hidden');
            autocompleteList.innerHTML = '';
            if (!dataLoaded) {
                console.warn("Data not loaded yet, cannot show autocomplete");
            }
        }
    });

    autocompleteList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const type = event.target.dataset.type;
            const name = event.target.dataset.name;
            console.log('Autocomplete clicked:', { type, name }); // Depuração
            if (type && name && dataLoaded) {
                searchInput.value = name;
                autocompleteList.classList.add('hidden');
                search(name, type);
            } else {
                console.error('Invalid autocomplete item or data not loaded:', { type, name, dataLoaded });
            }
        }
    });

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query && dataLoaded) {
            const artistResults = artistsData.filter(artist =>
                artist.name.toLowerCase() === query.toLowerCase()
            );
            const bandMatch = allBandNames.find(band =>
                band.toLowerCase() === query.toLowerCase()
            );
            console.log('Search button:', { query, artistResults, bandMatch }); // Depuração
            if (artistResults.length > 0) {
                search(query, 'artist');
            } else if (bandMatch) {
                search(bandMatch, 'band');
            } else {
                showNoResults();
            }
        } else {
            console.warn("Search button clicked but data not loaded or query empty:", { query, dataLoaded });
        }
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query && dataLoaded) {
                const artistResults = artistsData.filter(artist =>
                    artist.name.toLowerCase() === query.toLowerCase()
                );
                const bandMatch = allBandNames.find(band =>
                    band.toLowerCase() === query.toLowerCase()
                );
                console.log('Enter key:', { query, artistResults, bandMatch }); // Depuração
                if (artistResults.length > 0) {
                    search(query, 'artist');
                } else if (bandMatch) {
                    search(bandMatch, 'band');
                } else {
                    showNoResults();
                }
            } else {
                console.warn("Enter key pressed but data not loaded or query empty:", { query, dataLoaded });
            }
        }
    });
}

function updateAutocompleteList(query, listElement) {
    const filteredArtists = allArtistNames.filter(name =>
        name.toLowerCase().startsWith(query.toLowerCase())
    );
    const filteredBands = allBandNames.filter(name =>
        name.toLowerCase().startsWith(query.toLowerCase())
    );

    listElement.innerHTML = '';
    const combinedResults = [
        ...filteredArtists.map(name => ({ type: 'artist', name })),
        ...filteredBands.map(name => ({ type: 'band', name }))
    ];

    console.log('Autocomplete results:', combinedResults); // Depuração
    if (combinedResults.length > 0) {
        combinedResults.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item.type === 'band' ? `[Band] ${item.name}` : item.name;
            listItem.setAttribute('data-type', item.type);
            listItem.setAttribute('data-name', item.name);
            listElement.appendChild(listItem);
        });
        listElement.classList.remove('hidden');
    } else {
        listElement.classList.add('hidden');
    }
}

function search(query, type) {
    console.log('Search called:', { query, type, dataLoaded }); // Depuração
    if (!dataLoaded) {
        console.error("Cannot search: data not loaded yet");
        showNoResults();
        return;
    }
    if (type === 'artist') {
        const results = artistsData.filter(artist =>
            artist.name.toLowerCase() === query.toLowerCase()
        );
        if (results.length > 0) {
            displayArtistNetwork(results[0]);
        } else {
            showNoResults();
        }
    } else if (type === 'band') {
        displayBandMembers(query);
    } else {
        showNoResults();
    }
}

function displayArtistNetwork(artist) {
    console.log('Displaying artist network for:', artist.name); // Depuração
    document.getElementById('initial-message').classList.add('hidden');
    document.getElementById('no-results').classList.add('hidden');
    document.getElementById('band-members').classList.add('hidden');

    const artistInfo = document.getElementById('artist-info');
    artistInfo.classList.remove('hidden');

    document.getElementById('artist-name').textContent = artist.name;

    const artistBands = document.getElementById('artist-bands');
    artistBands.innerHTML = '<strong>Bands:</strong> ';
    artist.bands.forEach((band, index) => {
        const bandSpan = document.createElement('span');
        bandSpan.textContent = band + (index < artist.bands.length - 1 ? ', ' : '');
        bandSpan.className = 'band-link';
        bandSpan.style.cursor = 'pointer';
        bandSpan.style.color = '#4c51bf';
        bandSpan.style.textDecoration = 'underline';
        bandSpan.addEventListener('click', () => displayBandMembers(band));
        artistBands.appendChild(bandSpan);
    });

    const connectionsList = document.getElementById('artist-connections');
    connectionsList.innerHTML = '';

    artist.connections.forEach(connection => {
        const li = document.createElement('li');
        li.textContent = `${connection.name} (Common Bands: ${connection.commonBands.join(', ')})`;
        li.addEventListener('click', () => {
            const connectedArtist = artistsData.find(a => a.name === connection.name);
            if (connectedArtist) {
                displayArtistNetwork(connectedArtist);
            }
        });
        connectionsList.appendChild(li);
    });

    document.getElementById('band-members-list').innerHTML = '';

    createNetworkVisualization(artist);
}

function getBandColors() {
    return [
        "#a7c957", "#f2e9e4", "#ffc857", "#8ac926", "#e9c46a",
        "#00adb5", "#9a8c98", "#f94144", "#577590", "#43aa8b",
        "#90be6d", "#f8961e"
    ];
}

function createNetworkVisualization(centralArtist) {
    console.log('Creating visualization for:', centralArtist.name); // Depuração
    d3.select("#network-visualization").selectAll("*").remove();

    const svg = d3.select("#network-visualization");
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    const nodes = [{ id: centralArtist.name, group: 1, artist: centralArtist }];
    const links = [];

    centralArtist.connections.forEach(connection => {
        const connectedArtist = artistsData.find(a => a.name === connection.name);
        nodes.push({ id: connection.name, group: 2, artist: connectedArtist });
        links.push({
            source: centralArtist.name,
            target: connection.name,
            value: connection.commonBands.length,
            commonBands: connection.commonBands
        });
    });

    const allBands = new Set();
    links.forEach(link => link.commonBands.forEach(band => allBands.add(band)));
    const bandsList = Array.from(allBands);

    const bandColors = getBandColors();
    const bandColorMap = {};
    bandsList.forEach((band, i) => {
        bandColorMap[band] = bandColors[i % bandColors.length];
    });

    const defs = svg.append("defs");
    links.forEach((link, i) => {
        const gradientId = `link-gradient-${i}`;
        if (link.commonBands.length > 1) {
            const gradient = defs.append("linearGradient")
                .attr("id", gradientId)
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", "100%")
                .attr("y2", 0);
            link.commonBands.forEach((band, j) => {
                gradient.append("stop")
                    .attr("offset", `${j * (100 / (link.commonBands.length - 1))}%`)
                    .attr("stop-color", bandColorMap[band]);
            });
            link.gradient = gradientId;
        } else if (link.commonBands.length === 1) {
            link.color = bandColorMap[link.commonBands[0]];
        } else {
            link.color = "#ddd";
        }
    });

    const legendSize = 12;
    const legendSpacing = 4;
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
        .attr("transform", (d, i) => `translate(0, ${i * (legendSize + legendSpacing)})`)
        .style("cursor", "pointer")
        .on("click", (event, d) => displayBandMembers(d));

    legendItems.append("rect")
        .attr("width", legendSize)
        .attr("height", legendSize)
        .attr("fill", d => bandColorMap[d]);

    legendItems.append("text")
        .attr("x", legendSize + legendSpacing)
        .attr("y", legendSize - 2)
        .attr("font-size", "10px")
        .attr("fill", "#777")
        .text(d => d);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const linkGroup = svg.append("g").attr("class", "links");
    const link = linkGroup.selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", d => d.gradient ? `url(#${d.gradient})` : d.color || "#ccc")
        .attr("stroke-width", d => Math.max(1.5, Math.sqrt(d.value) * 2));

    link.append("title")
        .text(d => `Common Bands: ${d.commonBands.join(", ")}`);

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

    node.append("circle")
        .attr("r", d => d.id === centralArtist.name ? 12 : 8)
        .attr("fill", d => d.id === centralArtist.name ? "#00bcd4" : "#64b5f6")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .append("title")
        .text(d => `${d.id}\nBands: ${d.artist.bands.join(", ")}`);

    node.append("text")
        .attr("dx", 10)
        .attr("dy", ".35em")
        .attr("fill", "#555")
        .attr("stroke", "none")
        .attr("paint-order", "fill")
        .attr("font-size", "10px")
        .attr("font-weight", "400")
        .text(d => d.id);

    node.on("click", (event, d) => {
        if (d.id !== centralArtist.name) {
            displayArtistNetwork(d.artist);
        }
    });

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => {
                const margin = 40;
                const x = Math.max(margin, Math.min(width - margin, d.x));
                const y = Math.max(margin, Math.min(height - margin, d.y));
                return `translate(${x},${y})`;
            });
    });

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

    currentNetwork = { simulation, nodes, links };
}

function displayBandMembers(bandName) {
    console.log('displayBandMembers called for:', bandName, 'with artistsData:', artistsData.length); // Depuração
    const members = artistsData.filter(artist => artist.bands.includes(bandName));
    const bandMembersDiv = document.getElementById('band-members');
    const bandNameSpan = document.getElementById('band-name');
    const membersList = document.getElementById('band-members-list');

    if (!bandMembersDiv || !bandNameSpan || !membersList) {
        console.error("Band members DOM elements are missing");
        return;
    }

    // Limpar interface
    document.getElementById('initial-message').classList.add('hidden');
    document.getElementById('no-results').classList.add('hidden');
    document.getElementById('artist-info').classList.add('hidden');
    d3.select("#network-visualization").selectAll("*").remove();

    bandNameSpan.textContent = bandName;
    membersList.innerHTML = '';

    console.log('Members found:', members); // Depuração
    if (members.length > 0) {
        members.forEach(member => {
            const li = document.createElement('li');
            li.textContent = member.name;
            li.addEventListener('click', () => {
                displayArtistNetwork(member);
            });
            membersList.appendChild(li);
        });
        bandMembersDiv.classList.remove('hidden');
    } else {
        membersList.innerHTML = '<li>No members found for this band.</li>';
        bandMembersDiv.classList.remove('hidden');
    }
}

function showNoResults() {
    document.getElementById('initial-message').classList.add('hidden');
    document.getElementById('artist-info').classList.add('hidden');
    document.getElementById('band-members').classList.add('hidden');
    document.getElementById('no-results').classList.remove('hidden');

    d3.select("#network-visualization").selectAll("*").remove();
}

document.addEventListener('DOMContentLoaded', initializeVisualization);