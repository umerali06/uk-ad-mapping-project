# UK Anaerobic Digestion Mapping Application

A comprehensive geospatial web application for UK Anaerobic Digestion (AD) site selection, planning, and analysis.

## 🚀 Features

### Core Mapping & Visualization
- Interactive Map Interface with MapLibre GL JS
- Multi-Layer Support for AD plants, boundaries, and infrastructure
- Responsive Design with glassmorphism UI elements
- Real-time Updates and dynamic layer management

### Advanced Site Analysis
- Multi-Criteria Decision Analysis (MCDA) for site suitability
- WebWorker Integration for background processing
- Advanced Filtering with configurable constraints
- Performance Optimization with intelligent caching

### Analytics & Reporting
- Comprehensive Reports and data visualization
- Interactive Charts powered by Chart.js
- Custom Templates and export options
- Performance Dashboard for monitoring

### Collaboration Tools
- Shared Workspaces for team collaboration
- User Annotations and map marking
- Workspace Management system
- User ID System for team coordination

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), MapLibre GL JS, Chart.js
- **Build Tool**: Vite
- **Performance**: WebWorkers for background processing
- **Architecture**: Modular component-based design

## 📁 Project Structure

```
uk-ad-mapping-app/
├── src/
│   ├── components/           # Core application components
│   ├── workers/              # WebWorker implementations
│   ├── data/                 # Data files and configurations
│   ├── styles/               # CSS styling and themes
│   └── main.js               # Application entry point
├── index.html                # Main HTML structure
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone and navigate**
   ```bash
   git clone <repository-url>
   cd uk-ad-mapping-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## 🔧 Usage

### Basic Navigation
- **Sidebar**: Toggle map layers and access features
- **Info Panel**: View detailed information and site analysis
- **Search**: Find locations and sites
- **Map Controls**: Standard navigation and layer management

### Site Analysis
1. Use Site Finder for suitability analysis
2. Apply advanced filters for specific criteria
3. View detailed results and scores
4. Focus map on selected sites

### Analytics & Reports
- Access from sidebar under "Analytics & Reports"
- Choose from various report templates
- Export data in multiple formats
- Monitor performance metrics

## 🚨 Troubleshooting

### Common Issues
- **WebWorker Errors**: Workers use custom algorithms, not external libraries
- **Performance Issues**: Check WebWorker status in Performance Dashboard
- **Map Loading**: Verify network connectivity and layer configurations

## 📄 License

MIT License - see LICENSE file for details.

---

**Built for sustainable energy infrastructure planning**
