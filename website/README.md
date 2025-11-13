# Web LLM Executor Arena - Website

This is the visualization website for the Web LLM Executor Arena project, built with Astro, TailwindCSS, and Apache ECharts.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📁 Project Structure

```
website/
├── src/
│   ├── components/        # Reusable components
│   │   ├── PerformanceChart.astro      # Bar chart for overview
│   │   └── PercentilesChart.astro      # Line chart with percentiles
│   ├── layouts/          # Page layouts
│   │   └── Layout.astro  # Main layout with nav & footer
│   ├── lib/              # Utilities
│   │   └── data.ts       # Data loading functions
│   └── pages/            # Routes (file-based routing)
│       ├── index.astro        # Home page
│       ├── comparison.astro   # Detailed comparison
│       ├── runtimes.astro     # Runtime details
│       └── about.astro        # About page
├── public/              # Static assets
├── astro.config.mjs     # Astro configuration
├── tailwind.config.mjs  # TailwindCSS configuration
└── package.json
```

## 🎨 Features

### Data Visualization
- **Apache ECharts** for interactive, responsive charts
- Performance overview with multi-metric bar charts
- Percentile distribution with line charts
- Statistical analysis (mean, median, P50/P90/P95/P99)

### Pages
- **Home**: Summary statistics and top performers
- **Comparison**: Detailed charts and percentile analysis
- **Runtimes**: In-depth information about each runtime
- **About**: Project methodology and technology stack

### Design
- **Responsive**: Mobile-first design with TailwindCSS
- **Accessible**: Semantic HTML and ARIA labels
- **Fast**: Static site generation with Astro
- **Modern**: Clean, professional UI with gradient accents

## 📊 Data Loading

The website loads data from `../results/processed/`:
- `aggregated.json` - Detailed statistics per runtime
- `comparison.json` - Quick comparison table
- `summary.json` - High-level overview

If data files are not found, sample data is used for development.

## 🔧 Configuration

### Astro Configuration (`astro.config.mjs`)
- TailwindCSS integration
- Site URL configuration
- Build output settings

### TailwindCSS (`tailwind.config.mjs`)
- Custom color palette (primary blue)
- Content paths for purging
- Extended theme utilities

## 📦 Dependencies

### Core
- **astro** - Static site generator
- **@astrojs/tailwind** - TailwindCSS integration
- **echarts** - Apache ECharts visualization library
- **tailwindcss** - Utility-first CSS framework

### Development
- **@astrojs/check** - Type checking
- **typescript** - Type safety

## 🌐 Deployment

The website is built as a static site and can be deployed to any static hosting service:

```bash
# Build static site
pnpm build

# Output directory: dist/
```

Deployment options:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🎯 Development

### Adding New Charts

1. Create a new component in `src/components/`
2. Import and use Apache ECharts
3. Make it responsive with window resize handler
4. Add to relevant page

### Adding New Pages

1. Create new `.astro` file in `src/pages/`
2. Use `Layout.astro` for consistent structure
3. Update navigation in `Layout.astro`
4. Import data from `src/lib/data.ts`

### Customizing Styles

1. Edit `tailwind.config.mjs` for theme changes
2. Use TailwindCSS utility classes in components
3. Custom CSS in component `<style>` blocks if needed

## 📈 Performance

- Static site generation for optimal loading speed
- Lazy loading for ECharts library
- Optimized images and assets
- Minimal JavaScript footprint

## 🔍 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

MIT License - See LICENSE file for details
