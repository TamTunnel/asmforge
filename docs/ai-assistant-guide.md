# AI Assistant Guide

The Nova AI Assistant helps you write, understand, and debug assembly code. This guide shows you how to get the best results.

## Opening the Assistant

- Click the **Nova AI** icon in the right sidebar
- Or use the command palette: **Nova AI: Open Chat**

## Effective Prompting

### Be Specific About Architecture

❌ Vague: "How do I print a string?"

✅ Better: "How do I print a string in x86-64 Linux using syscalls?"

### Provide Context

❌ Vague: "Why doesn't this work?"

✅ Better: "This NASM code gives 'invalid combination of opcode and operands' on line 10. What's wrong?"

```nasm
mov [rax], 42  ; line 10
```

### Ask for Examples

✅ "Show me an example of a switch statement in ARM assembly"

✅ "Give me a template for a function prologue in x86-64"

## Common Use Cases

### 1. Explain Instructions

| Query                             | What You Get                      |
| --------------------------------- | --------------------------------- |
| "Explain LEA vs MOV"              | Detailed comparison with examples |
| "What does CPSR do in ARM?"       | Register explanation              |
| "List RISC-V atomic instructions" | Instruction reference             |

### 2. Convert Code

| Query                          | Result                             |
| ------------------------------ | ---------------------------------- |
| "Convert this C to x86-64"     | Assembly translation with comments |
| "Translate this ARM to RISC-V" | Cross-architecture conversion      |

### 3. Debug Help

| Query                             | Assistance                |
| --------------------------------- | ------------------------- |
| "I'm getting SIGSEGV at 0x401234" | Possible causes and fixes |
| "Why is my loop infinite?"        | Logic analysis            |
| "Stack corruption diagnosis"      | Debugging strategies      |

### 4. Optimization

| Query                    | Suggestions               |
| ------------------------ | ------------------------- |
| "Optimize this for size" | Code size reduction       |
| "Make this loop faster"  | Performance improvements  |
| "SIMD version of this?"  | Vectorization suggestions |

## Example Conversation

**You:** I need to read a file in x86-64 Linux assembly. How do I do it?

**Nova:** To read a file in x86-64 Linux:

1. **Open the file** with `open` syscall (2)
2. **Read contents** with `read` syscall (0)
3. **Close the file** with `close` syscall (3)

Here's a template:

```nasm
; Open file
mov rax, 2              ; syscall: open
mov rdi, filename       ; path
mov rsi, 0              ; O_RDONLY
syscall
mov [fd], rax           ; save file descriptor

; Read file
mov rax, 0              ; syscall: read
mov rdi, [fd]           ; file descriptor
mov rsi, buffer         ; buffer address
mov rdx, buffer_size    ; bytes to read
syscall
```

**You:** What if the file doesn't exist?

**Nova:** Check `rax` after `open`. If negative, it's an error:

```nasm
syscall
test rax, rax
js .file_error        ; Jump if negative (error)
```

Common errors: -2 (ENOENT - file not found), -13 (EACCES - permission denied).

## Context Awareness

The assistant remembers context within a conversation:

1. **Architecture context** - Set once, applies to follow-ups
2. **Code context** - Reference previous code blocks
3. **Problem context** - Build on previous explanations

**Tip:** Start with "I'm working on x86-64 Linux" to set context.

## Commands

| Command                | Action                         |
| ---------------------- | ------------------------------ |
| **Explain selection**  | Right-click selected code      |
| **Optimize selection** | Request optimization           |
| **Convert to**         | Cross-architecture translation |

## Best Practices

1. **One question at a time** - More focused answers
2. **Paste error messages** - Include full error text
3. **Show your code** - Context helps diagnosis
4. **Specify constraints** - "without using SSE", "size optimized"
5. **Ask follow-ups** - Dig deeper when needed

## Limitations

- May not know the latest assembler versions
- Generated code should be tested
- Complex optimizations may need manual refinement
- Architecture-specific details vary by target

## ASMA-Tune (Coming Soon)

Future versions will support ASMA-Tune, a specialized model fine-tuned for assembly language. Configure in:

**Settings → Nova AI → Model Selection**
