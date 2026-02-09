# Hello World - x86-64 Linux

A minimal "Hello, World!" program in x86-64 assembly for Linux.

## Prerequisites

- NASM (Netwide Assembler)
- GNU ld (linker)
- Linux or WSL

```bash
# Ubuntu/Debian
sudo apt install nasm

# macOS (cross-compile only)
brew install nasm
```

## Building

### Using Make

```bash
make
```

### Manually

```bash
nasm -f elf64 main.asm -o main.o
ld main.o -o hello
```

## Running

```bash
./hello
```

Output:

```
Hello, World!
```

## Code Explanation

### Data Section

```nasm
section .data
    message db "Hello, World!", 10
    msg_len equ $ - message
```

- `db` (define bytes) creates the string
- `10` is the ASCII newline character
- `$` is the current address, so `$ - message` calculates the length

### System Calls

Linux x86-64 uses these registers for syscalls:

| Register | Purpose        |
| -------- | -------------- |
| RAX      | Syscall number |
| RDI      | Argument 1     |
| RSI      | Argument 2     |
| RDX      | Argument 3     |

The `write` syscall (1) takes:

1. File descriptor (1 = stdout)
2. Buffer pointer
3. Byte count

The `exit` syscall (60) takes:

1. Exit code (0 = success)

## Exercises

1. **Change the message** - Modify the string and rebuild
2. **Print twice** - Call write twice before exiting
3. **Exit with error** - Change exit code to 1
4. **Count characters** - Calculate and print the message length

## Debug Tips

In AsmForge IDE:

1. Set a breakpoint on `_start`
2. Press F5 to start debugging
3. Watch RAX change with each syscall
4. Check RSI points to your message
