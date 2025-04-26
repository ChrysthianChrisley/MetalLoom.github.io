// Structure to store artist data and their connections
let artistsData = [];
let currentNetwork = null;
let allArtistNames = []; // Array to store all artist names

// Function to load data from the artists.txt file
async function loadArtistsData() {
    try {
        const response = await fetch('artists.txt');
        if (!response.ok) {
            throw new Error(`Error loading file: ${response.status}`);
        }
        const dataText = await response.text();
        artistsData = parseArtistsData(dataText);
        allArtistNames = artistsData.map(artist => artist.name).sort(); // Load and sort names
    } catch (error) {
        console.error("Could not load artist data:", error);
        // Here you can add logic to handle the error,
        // such as displaying a message to the user.
    }
}

// Function to parse the data from the text file
function parseArtistsData(dataText) {
    const lines = dataText.trim().split(';').filter(line => line.trim() !== '');

    const artists = [];
    const bandsMap = new Map(); // Maps bands to the artists who belong to them

    lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        const artistParts = cleanLine.split('-');
        if (artistParts.length < 2) return;

        const artistName = artistParts[0].trim();
        const bandsText = artistParts[1].trim();
        const bands = bandsText.split(',').map(band => band.trim());

        // Add the artist to the artists array
        const artist = {
            name: artistName,
            bands: bands
        };
        artists.push(artist);

        // Map each band to the artists that are part of it
        bands.forEach(band => {
            if (!bandsMap.has(band)) {
                bandsMap.set(band, []);
            }
            bandsMap.get(band).push(artistName);
        });
    });

    // Add connections based on common bands
    artists.forEach(artist => {
        artist.connections = [];

        // For each band of the artist
        artist.bands.forEach(band => {
            // Get all other artists in this band
            const bandmates = bandsMap.get(band).filter(name => name !== artist.name);

            // Add non-duplicate connections
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

// Function to initialize the visualization
async function initializeVisualization() {
    // Load and process data from the file
    await loadArtistsData();

    // Set up event listeners
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

// Function to search for an artist
function searchArtist(query) {
    // Case-insensitive and partial search
    const results = artistsData.filter(artist =>
        artist.name.toLowerCase() === query.toLowerCase()
    );

    if (results.length > 0) {
        // Display the first search result (should be unique with exact match)
        displayArtistNetwork(results[0]);
    } else {
        showNoResults();
    }
}

// Function to display the network of connections for an artist
function displayArtistNetwork(artist) {
    // Hide initial and "no results" messages
    document.getElementById('initial-message').classList.add('hidden');
    document.getElementById('no-results').classList.add('hidden');

    // Display artist information
    const artistInfo = document.getElementById('artist-info');
    artistInfo.classList.remove('hidden');

    document.getElementById('artist-name').textContent = artist.name;

    const artistBands = document.getElementById('artist-bands');
    artistBands.innerHTML = `<strong>Bands:</strong> ${artist.bands.join(', ')}`;

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

    // Create the network visualization
    createNetworkVisualization(artist);
}

// Function to generate colors for the bands
function getBandColors() {
    // List of colors for different bands (light and modern)
    return [
        "#a7c957", // Light Green
        "#f2e9e4", // Off-White
        "#ffc857", // Light Yellow
        "#8ac926", // Bright Green
        "#e9c46a", // Mustard Yellow
        "#00adb5", // Teal
        "#9a8c98", // Dusty Purple
        "#f94144", // Coral
        "#577590", // Slate Blue
        "#43aa8b", // Sea Green
        "#90be6d", // Lime Green
        "#f8961e"  // Orange
    ];
}

// Function to create the network visualization using D3.js
function createNetworkVisualization(centralArtist) {
    // Clear the previous visualization if it exists
    d3.select("#network-visualization").selectAll("*").remove();

    const svg = d3.select("#network-visualization");
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    // Create the data for the graph
    const nodes = [
        { id: centralArtist.name, group: 1, artist: centralArtist }
    ];

    const links = [];

    // Add connections as nodes and links
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

    // Collecting all unique bands to color the connections
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

    // Define gradients for links with multiple common bands
    const defs = svg.append("defs");

    links.forEach((link, i) => {
        // Create a unique ID for the gradient
        const gradientId = `link-gradient-${i}`;

        // If there is more than one common band, create a gradient
        if (link.commonBands.length > 1) {
            const gradient = defs.append("linearGradient")
                .attr("id", gradientId)
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", "100%")
                .attr("y2", 0);

            // Add stops for each band
            link.commonBands.forEach((band, j) => {
                gradient.append("stop")
                    .attr("offset", `${j * (100 / (link.commonBands.length - 1))}%`)
                    .attr("stop-color", bandColorMap[band]);
            });

            // Specify that this link uses the gradient
            link.gradient = gradientId;
        } else if (link.commonBands.length === 1) {
            // If there is only one band, use its color directly
            link.color = bandColorMap[link.commonBands[0]];
        } else {
            // No common bands (should not happen)
            link.color = "#ddd"; // Light grey
        }
    });

    // Add color legend
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
        .attr("transform", (d, i) => `translate(0, ${i * (legendSize + legendSpacing)})`);

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

    // Create the force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Group for links
    const linkGroup = svg.append("g").attr("class", "links");

    // Create the links (lines)
    const link = linkGroup.selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", d => d.gradient ? `url(#${d.gradient})` : d.color || "#ccc")
        .attr("stroke-width", d => Math.max(1.5, Math.sqrt(d.value) * 2));

    // Create tooltip to show common bands on links
    link.append("title")
        .text(d => `Common Bands: ${d.commonBands.join(", ")}`);

    // Create the nodes (circles)
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

    // Add circles to the nodes
    node.append("circle")
        .attr("r", d => d.id === centralArtist.name ? 12 : 8)
        .attr("fill", d => d.id === centralArtist.name ? "#00bcd4" : "#64b5f6") // Lighter blues
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .append("title")
        .text(d => `${d.id}\nBands: ${d.artist.bands.join(", ")}`);

    // Add text to the nodes
    node.append("text")
        .attr("dx", 10)
        .attr("dy", ".35em")
        .attr("fill", "#555")
        .attr("stroke", "none")
        .attr("paint-order", "fill")
        .attr("font-size", "10px")
        .attr("font-weight", "400")
        .text(d => d.id);

    // Add click interaction to nodes
    node.on("click", (event, d) => {
        if (d.id !== centralArtist.name) {
            displayArtistNetwork(d.artist);
        }
    });

    // Function to update the simulation on each tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => {
                // Limit the position within the SVG bounds with a margin
                const margin = 40;
                const x = Math.max(margin, Math.min(width - margin, d.x));
                const y = Math.max(margin, Math.min(height - margin, d.y));
                return `translate(${x},${y})`;
            });
    });

    // Drag functions
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

    // Save the current network for reference
    currentNetwork = { simulation, nodes, links };
}

// Function to show message when no results are found
function showNoResults() {
    document.getElementById('initial-message').classList.add('hidden');
    document.getElementById('artist-info').classList.add('hidden');
    document.getElementById('no-results').classList.remove('hidden');

    // Clear the visualization
    d3.select("#network-visualization").selectAll("*").remove();
}

// Initialize the application when the document is ready
document.addEventListener('DOMContentLoaded', initializeVisualization);