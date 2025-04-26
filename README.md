# MetalLoom - Metal Artists Web

MetalLoom is an interactive web application that visualizes the network of metal artists and their band connections. Users can search for an artist, view their associated bands, explore connections with other artists based on shared bands, and click on bands to see their members. The application uses D3.js for network visualization and provides an intuitive interface for exploring the metal music scene.


[View Image](https://i.ibb.co/1tRV455Z/Metal-Loom.jpg)

## Features

- **Artist Search**: Search for metal artists with autocomplete suggestions.
- **Network Visualization**: Displays a force-directed graph showing the selected artist and their connections to other artists via shared bands.
- **Band Information**: Click on a band (in the artist's info or legend) to view all its members.
- **Interactive Interface**: Click on connected artists or band members to explore their networks.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Demo

[Live Demo](https://chrysthianchrisley.github.io/MetalLoom.github.io/)

## Installation

To run MetalLoom locally, follow these steps:

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, etc.)
- A local server (e.g., Python's `http.server`, Node.js `http-server`, or VS Code Live Server) to serve the files, as the app uses `fetch` to load data.

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ChrysthianChrisley/MetalLoom.git
   cd MetalLoom
   ```

2. **Set Up the Data File**:
   - Create or [Download](https://github.com/ChrysthianChrisley/MetalLoom.github.io/blob/main/artists.txt)  a file named `artists.txt` in the root directory.
   - Format the file as described in the [Data Format](#data-format) section.

3. **Serve the Application**:
   - Use a local server to serve the files. For example, with Python:
     ```bash
     python -m http.server 8000
     ```
   - Or with Node.js `http-server`:
     ```bash
     npx http-server
     ```

4. **Access the Application**:
   - Open your browser and navigate to `http://localhost:8000` (or the port provided by your server).

## Usage

1. **Search for an Artist**:
   - Type an artist's name in the search bar. Autocomplete suggestions will appear as you type.
   - Press Enter or click the search button to view the artist's network.

2. **Explore the Network**:
   - The central node represents the selected artist, with connected nodes showing other artists who share bands.
   - Hover over links to see the common bands between artists.
   - Click on a connected artist to view their network.

3. **View Band Members**:
   - In the artist's info panel, click on a band name to see all its members.
   - In the visualization, click on a band in the legend to display its members.
   - Click on a member's name to explore their network.

## Data Format

The application reads artist data from a file named `artists.txt`. The file should follow this format:

```
Artist1 - Band1, Band2;
Artist2 - Band1, Band3;
Artist3 - Band2, Band4;
```

- Each artist entry is separated by a semicolon (`;`).
- An artist's name is followed by a hyphen (`-`), then a comma-separated list of bands they are part of.
- Example:
  ```
  Dave Mustaine - Megadeth, Metallica;
  James Hetfield - Metallica;
  Lars Ulrich - Metallica;
  Chuck Schuldiner - Death, Control Denied;
  ```

## Project Structure

```
MetalLoom/
├── artists.txt         # Data file with artist and band information
├── index.html          # Main HTML file
├── script.js           # JavaScript logic (data parsing, D3.js visualization, event handling)
├── style.css           # CSS styles for the application
└── README.md           # This file
```

## Dependencies

- **D3.js** (v7.8.5): Included via CDN for network visualization.
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
  ```

No additional installations are required, as all dependencies are loaded via CDN.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure your code follows the existing style and includes appropriate tests or documentation.

## Issues

If you encounter bugs or have feature requests, please open an issue on the [GitHub Issues page](https://github.com/ChrysthianChrisley/MetalLoom/issues).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [D3.js](https://d3js.org/) for data visualization.
- Inspired by the vibrant metal music community.

---

Feel free to star ⭐ this repository if you find it useful!
