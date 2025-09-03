# UK Anaerobic Digestion Mapping Application

## Overview
A comprehensive geospatial mapping application for anaerobic digestion site selection and planning across the UK. This application provides interactive mapping capabilities with multiple data layers including boundaries, AD plants, manure volumes, environmental constraints, and infrastructure data.

## Project Architecture
- **Frontend Framework**: Vite + Vanilla JavaScript
- **Mapping Library**: MapLibre GL JS v4.7.1
- **Styling**: Tailwind CSS with custom components
- **Data Processing**: Papa Parse, TopoJSON, Turf.js
- **Search**: Fuse.js for fuzzy searching
- **Charts**: Chart.js for data visualization

## Current State
✅ **Project successfully configured for Replit environment**
- Development server running on port 5000
- Vite configured with proper host settings (0.0.0.0) and allowedHosts
- All dependencies installed and working
- Deployment configuration set for production

## Recent Changes (September 03, 2025)
- Updated `vite.config.js` to use port 5000 and host 0.0.0.0 for Replit compatibility
- Configured `allowedHosts: 'all'` to work with Replit's proxy system
- Set up workflow to run `npm run dev` with web preview
- Configured deployment settings for autoscale production deployment

## Key Features
- **Interactive Map**: MapLibre GL-based mapping with multiple layers
- **Layer Management**: Organized layer groups for boundaries, AD plants, environmental data
- **Site Finder**: Advanced algorithm for identifying suitable AD plant locations
- **Search Functionality**: Fuzzy search across AD plant data
- **Data Analysis**: Spatial analysis using Turf.js
- **Performance Monitoring**: Built-in performance tracking
- **Responsive UI**: Modern design with collapsible sidebar and info panels

## Development
- **Dev Server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build` 
- **Preview**: `npm run preview`
- **Linting**: `npm run lint` / `npm run lint:fix`
- **Formatting**: `npm run format`

## File Structure
```
├── src/
│   ├── components/          # Modular JavaScript components
│   ├── styles/             # CSS modules (base, components, map, etc.)
│   ├── utils/              # Utility functions and error handling
│   ├── workers/            # Web workers for data processing
│   └── main.js            # Application entry point
├── index.html             # Main HTML file
└── vite.config.js         # Vite configuration
```

## Data Layers
- **Boundaries**: LAD Districts (361), LPA Authorities (379)
- **AD Plants**: AD Facilities (2,000+)
- **Manure Volumes**: Beef, Dairy, Broilers, Layers, Pigs, Sheep data
- **Environmental**: AONB, SSSI, NVZ, Flood Zones, ALC Grades
- **Infrastructure**: DNO Regions, Water Companies, Brownfield Sites, NTS Pipelines, Roads
- **Land Registry**: Freehold Properties

## Production Deployment
Configured for Replit's autoscale deployment:
- Build command: `npm run build`
- Run command: `npm run preview`
- Deployment target: autoscale (suitable for stateless web applications)