# AsmForge IDE User Guide

## Introduction

AsmForge is an AI-powered Integrated Development Environment for assembly language programming. Built on Eclipse Theia, it provides professional-grade tools for writing, building, and debugging assembly code across multiple architectures.

## Quick Start

### Opening the IDE

```bash
cd NOVA
npm start
```

Open http://localhost:3000 in your browser.

### Creating Your First File

1. **File → New File** or `Ctrl+N`
2. Save as `hello.asm`
3. Start writing assembly code

## Features Overview

### Syntax Highlighting

Automatic highlighting for:

- **x86/x86-64** (Intel and AT&T syntax)
- **ARM/ARM64**
- **RISC-V**

### Building Programs

| Shortcut    | Action                |
| ----------- | --------------------- |
| **F5**      | Assemble current file |
| **Ctrl+F5** | Assemble and link     |

The IDE auto-detects your assembler (NASM, GAS, LLVM, ARM) based on syntax.

### Output Panel

Build output appears in the **Output** panel:

- ✓ Green checkmarks for success
- ✗ Red X for errors with line numbers

### Error Navigation

Errors appear as:

- Inline underlines in the editor
- Entries in the **Problems** panel
- Click to jump to the error location

## Debugging

### Starting a Debug Session

1. **Debug → Start Debugging** or select from the command palette
2. Choose a launch configuration:
    - Linux Userspace
    - QEMU Bare Metal (x86-64, ARM64, RISC-V)
    - Attach to Process
    - Remote Debugging

### Generate launch.json

Run **Debug → Generate launch.json** to create a `.vscode/launch.json` with debug configurations.

### Debug Features

- **Breakpoints**: Click the gutter to set
- **Step Controls**: Step In, Step Over, Step Out
- **Register View**: See CPU register values
- **Memory View**: Inspect memory contents
- **Disassembly**: View machine code

## AI Assistant

### Opening the Assistant

Use the **Nova AI** panel on the right sidebar.

### Example Queries

- "Explain the MOV instruction"
- "Optimize this loop for performance"
- "Why am I getting a segfault?"
- "Convert this C function to assembly"

See the [AI Assistant Guide](ai-assistant-guide.md) for more tips.

## Settings

Access settings via **File → Preferences → Settings** or `Ctrl+,`

### Key Settings

| Setting                           | Description                         |
| --------------------------------- | ----------------------------------- |
| `asmforge.assembler.default`      | Default assembler (nasm, gas, llvm) |
| `asmforge.assembler.architecture` | Target architecture                 |
| `asmforge.linker.flags`           | Additional linker flags             |
| `asmforge.build.generateListing`  | Generate .lst files                 |

## Keyboard Shortcuts

| Shortcut     | Action             |
| ------------ | ------------------ |
| F5           | Assemble           |
| Ctrl+F5      | Assemble & Link    |
| Ctrl+Shift+P | Command Palette    |
| Ctrl+B       | Toggle Sidebar     |
| F12          | Go to Definition   |
| Ctrl+Space   | Trigger Completion |

## Architecture Support

| Architecture | Assemblers      | Formats      |
| ------------ | --------------- | ------------ |
| x86          | NASM, GAS       | ELF32, COFF  |
| x86-64       | NASM, GAS, LLVM | ELF64, Win64 |
| ARM          | GAS, armasm     | ELF32        |
| ARM64        | GAS             | ELF64        |
| RISC-V       | GAS             | ELF32, ELF64 |

## Troubleshooting

### "Assembler not found"

Install the required assembler:

```bash
# Ubuntu/Debian
sudo apt install nasm gcc binutils

# macOS
brew install nasm
```

### Build fails with no error

Check the Output panel for full assembler output.

### Debug session won't start

Ensure GDB is installed:

```bash
sudo apt install gdb
```
