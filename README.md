# NOVA Assembly IDE

<div align="center">

![NOVA Logo](docs/assets/nova-logo.png)

**Neural Optimization Virtual Assistant for Assembly**

_"Cursor for Assembly" - An AI-powered IDE for low-level programming_

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Eclipse Theia](https://img.shields.io/badge/Eclipse%20Theia-1.55.0-purple.svg)](https://theia-ide.org/)

</div>

---

## Overview

NOVA is an AI-powered Assembly language IDE built on **Eclipse Theia**, specifically designed for:

- 🔧 **Embedded Systems Developers**
- 📟 **Firmware Engineers**
- 🖥️ **OS Developers**
- 🔐 **Security Researchers**

### Key Features

| Feature                        | Description                                      |
| ------------------------------ | ------------------------------------------------ |
| **Multi-Architecture Support** | x86/x64, ARM/AArch64, RISC-V                     |
| **Assembler Integration**      | NASM, GAS, MASM, FASM                            |
| **AI-Powered Assistance**      | Code explanation, optimization, bug detection    |
| **Visual Debugging**           | Register viewer, memory visualizer, stack frames |
| **Language Server**            | Hover info, auto-complete, go-to-definition      |

---

## Architecture

```
NOVA/
├── browser-app/         # Web-based IDE application
├── electron-app/        # Desktop IDE application
├── packages/
│   ├── nova-core/       # Core UI and services
│   ├── nova-assembly-lsp/  # Assembly language server
│   ├── nova-debug/      # GDB debug adapter
│   └── nova-ai/         # AI assistant integration
├── configs/             # Build configurations
└── docs/                # Documentation
```

### Technology Stack

| Layer         | Technology                     |
| ------------- | ------------------------------ |
| **Framework** | Eclipse Theia 1.55.0           |
| **Editor**    | Monaco                         |
| **Language**  | TypeScript                     |
| **Runtime**   | Node.js 20+                    |
| **AI**        | Claude 3.5 (via Anthropic SDK) |
| **LSP**       | asm-lsp (Rust)                 |
| **Debug**     | GDB via Debug Adapter Protocol |

---

## Getting Started

### Prerequisites

- **Node.js** 20.0.0 or higher
- **npm** 10.0.0 or higher
- **Git**

Optional (for full functionality):

- **NASM** - Intel syntax assembler
- **GCC/GAS** - GNU Assembler
- **GDB** - Debugger
- **asm-lsp** - Assembly Language Server

### Installation

```bash
# Clone the repository
git clone https://github.com/nova-assembly-ide/nova.git
cd NOVA

# Install dependencies
npm install

# Build all packages
npm run build
```

### Running the IDE

#### Browser Mode (Development)

```bash
npm run start:browser
```

Open http://localhost:3000 in your browser.

#### Desktop Mode (Electron)

```bash
npm run start:electron
```

---

## Development

### Project Structure

```
packages/
├── nova-core/           # Core extension
│   ├── src/browser/     # Frontend components
│   └── package.json
├── nova-assembly-lsp/   # Language server client
│   ├── src/browser/     # Frontend LSP client
│   ├── src/node/        # Backend LSP server
│   └── package.json
├── nova-debug/          # Debug adapter
│   ├── src/browser/     # Debug UI
│   ├── src/node/        # GDB adapter
│   └── package.json
└── nova-ai/             # AI integration
    ├── src/browser/     # Chat UI
    ├── src/node/        # AI service
    └── package.json
```

### Commands

| Command                  | Description                 |
| ------------------------ | --------------------------- |
| `npm install`            | Install all dependencies    |
| `npm run build`          | Build all packages          |
| `npm run watch`          | Build and watch for changes |
| `npm run start:browser`  | Start browser IDE           |
| `npm run start:electron` | Start desktop IDE           |
| `npm run lint`           | Run ESLint                  |
| `npm run lint:fix`       | Fix linting issues          |
| `npm run clean`          | Clean build artifacts       |

### Creating a New Extension

1. Create a new directory in `packages/`:

   ```bash
   mkdir -p packages/nova-myext/src/browser
   ```

2. Add `package.json` with `theia-extension` keyword:

   ```json
   {
     "name": "@nova/nova-myext",
     "keywords": ["theia-extension"],
     "theiaExtensions": [{ "frontend": "lib/browser/myext-frontend-module" }]
   }
   ```

3. Create the frontend module:

   ```typescript
   import { ContainerModule } from "@theia/core/shared/inversify";

   export default new ContainerModule((bind) => {
     // Register your services here
   });
   ```

4. Add the dependency to `browser-app/package.json`:
   ```json
   "@nova/nova-myext": "*"
   ```

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# AI Configuration
ANTHROPIC_API_KEY=your-api-key
AI_MODEL=claude-3-sonnet-20240229

# Debug Configuration
GDB_PATH=/usr/bin/gdb
NASM_PATH=/usr/bin/nasm

# LSP Configuration
ASM_LSP_PATH=/usr/local/bin/asm-lsp
```

### Supported File Extensions

| Extension          | Language               |
| ------------------ | ---------------------- |
| `.asm`, `.s`, `.S` | Assembly (auto-detect) |
| `.nasm`            | NASM syntax            |
| `.gas`             | GAS/AT&T syntax        |
| `.inc`             | Assembly include file  |

---

## Roadmap

### Phase 1: Foundation ✅

- [x] Project structure
- [x] Theia integration
- [ ] Basic syntax highlighting
- [ ] Build system (NASM/GAS)

### Phase 2: Debugging

- [ ] GDB integration
- [ ] Register viewer
- [ ] Memory visualizer
- [ ] Stack view

### Phase 3: AI Integration

- [ ] MCP server
- [ ] Chat interface
- [ ] Code explanation
- [ ] Optimization suggestions

### Phase 4: Multi-Architecture

- [ ] ARM support
- [ ] RISC-V support
- [ ] Architecture switching

### Phase 5: Polish

- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Distribution packages

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Eclipse Theia](https://theia-ide.org/) - The IDE framework
- [asm-lsp](https://github.com/bergercookie/asm-lsp) - Assembly language server
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Anthropic Claude](https://www.anthropic.com/) - AI assistance

---

<div align="center">

**Built with ❤️ for low-level programmers**

</div>
