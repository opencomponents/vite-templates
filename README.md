# OpenComponents Vite Templates

Home for the new vite-based [OpenComponents](https://opencomponents.github.io) templates. This monorepo contains templates and tools for building OpenComponents (OC) micro frontends using modern JavaScript frameworks and Vite.

## Quick Start

Create a new OpenComponent using the interactive CLI:

```bash
npm create oc@latest
```

Or specify the component name and template directly:

```bash
npm create oc@latest my-component --template react
```

## Requirements

- Node.js version 20 or higher
- npm or yarn package manager

## Available Templates

The `create-oc` CLI supports the following templates:

### 🍦 Vanilla JavaScript (ES6)

**Template ID:** `es6`

A lightweight template using vanilla JavaScript with TypeScript support. Perfect for simple components without framework overhead.

**Features:**

- TypeScript support
- Minimal dependencies
- Fast build times
- OC server development mode

### ⚛️ React

**Template ID:** `react`

Full-featured React template with modern development tools and testing setup.

**Features:**

- React 18.3.1 with TypeScript
- ESLint configuration
- Vitest for testing
- React Testing Library
- Hot module replacement
- Production-ready build configuration

### 🟦 Solid

**Template ID:** `solid`

Template using SolidJS for high-performance reactive components.

**Features:**

- SolidJS framework
- TypeScript support
- Reactive state management
- Small bundle size

### 🔮 Preact

**Template ID:** `preact`

Lightweight alternative to React with the same API but smaller footprint.

**Features:**

- Preact framework
- React-compatible API
- Smaller bundle size
- TypeScript support

### 💚 Vue

**Template ID:** `vue`

Vue.js template for building components with the Vue ecosystem.

**Features:**

- Vue 3 Composition API
- TypeScript support
- Single File Components
- Vite configuration

### 🧡 Svelte

**Template ID:** `svelte`

Svelte template for compile-time optimized components.

**Features:**

- Svelte framework
- Compile-time optimization
- TypeScript support
- Minimal runtime

### 🌳 Elm

**Template ID:** `elm`

Functional programming template using the Elm language.

**Features:**

- Elm language support
- Functional programming paradigm
- Strong type system
- No runtime exceptions

### 🚧 ESM (Beta)

**Template ID:** `esm`

Experimental template using ES modules with modern JavaScript features.

**Features:**

- Native ES modules
- Modern JavaScript
- Experimental features
- Beta status

## Template Structure

Each generated component follows a consistent structure:

```
my-component/
├── package.json          # Component configuration and dependencies
├── src/
│   ├── server.ts        # Server-side data fetching logic
│   ├── App.tsx          # Main component (React example)
│   └── styles.css       # Component styles
├── public/              # Static assets
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite build configuration
```

### Key Files

- **`src/server.ts`**: Contains the server-side logic for data fetching and processing
- **`src/App.tsx`** (or equivalent): The main component template file
- **`package.json`**: Includes OC-specific configuration in the `oc` field
- **`public/`**: Static assets that will be served alongside the component

## Development Workflow

After creating a component:

1. **Install dependencies:**

   ```bash
   cd my-component
   npm install
   ```

2. **Start development server:**

   ```bash
   npm start
   # or
   npm run dev
   ```

3. **Build for production:**

   ```bash
   npm run build
   ```

4. **Run tests** (where available):
   ```bash
   npm test
   ```

## OpenComponents Configuration

Each template includes an `oc` configuration in `package.json`:

```json
{
  "oc": {
    "files": {
      "data": "src/server.ts",
      "template": {
        "src": "src/App.tsx",
        "type": "oc-template-react"
      },
      "static": ["public"]
    }
  }
}
```

- **`data`**: Server-side data fetching logic
- **`template.src`**: Main component file
- **`template.type`**: Template renderer type
- **`static`**: Static asset directories

## Template Packages

This monorepo includes the following template renderer packages:

| Template    | Package                                              | Version                                                                                                       |
| ----------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ES6/Vanilla | [`oc-template-es6`](/packages/oc-template-es6)       | [![npm version](https://badge.fury.io/js/oc-template-es6.svg)](http://badge.fury.io/js/oc-template-es6)       |
| React       | [`oc-template-react`](/packages/oc-template-react)   | [![npm version](https://badge.fury.io/js/oc-template-react.svg)](http://badge.fury.io/js/oc-template-react)   |
| Preact      | [`oc-template-preact`](/packages/oc-template-preact) | [![npm version](https://badge.fury.io/js/oc-template-preact.svg)](http://badge.fury.io/js/oc-template-preact) |
| Solid       | [`oc-template-solid`](/packages/oc-template-solid)   | [![npm version](https://badge.fury.io/js/oc-template-solid.svg)](http://badge.fury.io/js/oc-template-solid)   |
| Vue         | [`oc-template-vue`](/packages/oc-template-vue)       | [![npm version](https://badge.fury.io/js/oc-template-vue.svg)](http://badge.fury.io/js/oc-template-vue)       |
| Svelte      | [`oc-template-svelte`](/packages/oc-template-svelte) | [![npm version](https://badge.fury.io/js/oc-template-svelte.svg)](http://badge.fury.io/js/oc-template-svelte) |
| Elm         | [`oc-template-elm`](/packages/oc-template-elm)       | [![npm version](https://badge.fury.io/js/oc-template-elm.svg)](http://badge.fury.io/js/oc-template-elm)       |
| ESM         | [`oc-template-esm`](/packages/oc-template-esm)       | [![npm version](https://badge.fury.io/js/oc-template-esm.svg)](http://badge.fury.io/js/oc-template-esm)       |

## Supporting Packages

| Package                                          | Description                          | Version                                                                                                   |
| ------------------------------------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| [`create-oc`](/packages/create-oc)               | CLI tool for scaffolding components  | [![npm version](https://badge.fury.io/js/create-oc.svg)](http://badge.fury.io/js/create-oc)               |
| [`oc-server`](/packages/oc-server)               | Development server for OC components | [![npm version](https://badge.fury.io/js/oc-server.svg)](http://badge.fury.io/js/oc-server)               |
| [`oc-vite`](/packages/oc-vite)                   | Vite integration for OpenComponents  | [![npm version](https://badge.fury.io/js/oc-vite.svg)](http://badge.fury.io/js/oc-vite)                   |
| [`oc-vite-compiler`](/packages/oc-vite-compiler) | Vite-based compiler for OC templates | [![npm version](https://badge.fury.io/js/oc-vite-compiler.svg)](http://badge.fury.io/js/oc-vite-compiler) |

## External Dependencies

Templates are configured to load framework dependencies from CDN in production:

- **React**: Loaded from unpkg.com with global `React` and `ReactDOM`
- **Vue**: Loaded from unpkg.com with global `Vue`
- **Solid**: Bundled with the component
- **Other frameworks**: Various CDN configurations

This approach reduces bundle sizes and allows for better caching across components.

## Contributing

This is a monorepo managed with Turbo. To contribute:

1. Clone the repository
2. Install dependencies: `npm install`
3. Make your changes
4. Test across templates
5. Submit a pull request

## Learn More

- [OpenComponents Documentation](https://opencomponents.github.io)
- [OpenComponents GitHub](https://github.com/opencomponents/oc)
- [Vite Documentation](https://vitejs.dev)

## License

MIT
