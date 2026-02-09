# Tutorial: Hello World in x86-64 Assembly

This tutorial walks you through creating, building, and running a simple "Hello World" program in x86-64 assembly using AsmForge IDE.

## Prerequisites

- AsmForge IDE running
- NASM installed (`nasm --version`)
- Linux or WSL environment

## Step 1: Create the File

1. Open AsmForge IDE
2. **File → New File** (Ctrl+N)
3. Save as `hello.asm`

## Step 2: Write the Code

Copy this code into `hello.asm`:

```nasm
; Hello World in x86-64 Linux
; Uses Linux syscalls for write and exit

section .data
    message db "Hello, World!", 10    ; 10 = newline
    msg_len equ $ - message           ; Calculate length

section .text
    global _start

_start:
    ; syscall: write(1, message, msg_len)
    mov rax, 1          ; syscall number for write
    mov rdi, 1          ; file descriptor 1 = stdout
    mov rsi, message    ; pointer to message
    mov rdx, msg_len    ; message length
    syscall             ; invoke the kernel

    ; syscall: exit(0)
    mov rax, 60         ; syscall number for exit
    xor rdi, rdi        ; exit code 0
    syscall             ; invoke the kernel
```

## Step 3: Build the Program

Press **F5** to assemble.

You should see in the Output panel:

```
=== AsmForge Build ===
File: hello.asm
Detected assembler: nasm (confidence: 80%)
Using assembler: NASM

Assembling...
✓ Assembly successful (15ms)
Output: hello.o
```

## Step 4: Link the Executable

Press **Ctrl+F5** to assemble and link.

Output:

```
✓ Linking successful
Executable: hello
```

## Step 5: Run the Program

Open the integrated terminal (**Terminal → New Terminal**) and run:

```bash
./hello
```

Output:

```
Hello, World!
```

🎉 **Congratulations! You've built your first assembly program!**

---

## Understanding the Code

### Data Section

```nasm
section .data
    message db "Hello, World!", 10
    msg_len equ $ - message
```

- `section .data` - Initialized data segment
- `db` - Define bytes (the string)
- `10` - ASCII linefeed character
- `equ $ - message` - Calculate length at assembly time

### Code Section

```nasm
section .text
    global _start
```

- `section .text` - Executable code segment
- `global _start` - Export entry point for linker

### System Calls

Linux x86-64 uses these registers for syscalls:
| Register | Purpose |
|----------|---------|
| RAX | Syscall number |
| RDI | Argument 1 |
| RSI | Argument 2 |
| RDX | Argument 3 |

The `syscall` instruction invokes the kernel.

## Common Modifications

### Change the Message

```nasm
message db "Your message here!", 10
```

The length is calculated automatically.

### Exit with Error Code

```nasm
mov rdi, 1    ; exit code 1 (error)
```

### Write to stderr

```nasm
mov rdi, 2    ; file descriptor 2 = stderr
```

## Debugging

1. Set a breakpoint on `_start` (click the gutter)
2. **Debug → Start Debugging**
3. Select "Debug Linux Program"
4. Step through the code (F10)
5. Watch registers change in the Register View

## Next Steps

- Try the [Bootloader Example](../examples/bootloader-x86/)
- Read the [Architecture Reference](architecture-reference.md)
- Ask the AI Assistant for optimization tips
