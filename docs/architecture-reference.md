# Architecture Reference

Quick reference for assembly language programming across supported architectures.

## x86-64 (AMD64)

### Registers

| 64-bit | 32-bit   | 16-bit   | 8-bit (L/H) | Purpose                   |
| ------ | -------- | -------- | ----------- | ------------------------- |
| RAX    | EAX      | AX       | AL/AH       | Accumulator, return value |
| RBX    | EBX      | BX       | BL/BH       | Base, callee-saved        |
| RCX    | ECX      | CX       | CL/CH       | Counter, arg 4            |
| RDX    | EDX      | DX       | DL/DH       | Data, arg 3               |
| RSI    | ESI      | SI       | SIL         | Source, arg 2             |
| RDI    | EDI      | DI       | DIL         | Dest, arg 1               |
| RSP    | ESP      | SP       | SPL         | Stack pointer             |
| RBP    | EBP      | BP       | BPL         | Base pointer              |
| R8-R15 | R8D-R15D | R8W-R15W | R8B-R15B    | Extra registers           |

### Linux Syscall Convention

```
RAX = syscall number
RDI = arg1, RSI = arg2, RDX = arg3
R10 = arg4, R8 = arg5, R9 = arg6
syscall
RAX = return value
```

### Common Syscalls

| Number | Name  | Arguments         |
| ------ | ----- | ----------------- |
| 0      | read  | fd, buf, count    |
| 1      | write | fd, buf, count    |
| 2      | open  | path, flags, mode |
| 3      | close | fd                |
| 60     | exit  | code              |

### Function Call Convention (System V AMD64 ABI)

- Args: RDI, RSI, RDX, RCX, R8, R9 (then stack)
- Return: RAX (RAX:RDX for 128-bit)
- Caller-saved: RAX, RCX, RDX, RSI, RDI, R8-R11
- Callee-saved: RBX, RBP, R12-R15

---

## ARM64 (AArch64)

### Registers

| Register | Alias   | Purpose                  |
| -------- | ------- | ------------------------ |
| X0-X7    | -       | Arguments/return values  |
| X8       | XR      | Indirect result          |
| X9-X15   | -       | Caller-saved temporaries |
| X16-X17  | IP0/IP1 | Intra-procedure call     |
| X18      | PR      | Platform register        |
| X19-X28  | -       | Callee-saved             |
| X29      | FP      | Frame pointer            |
| X30      | LR      | Link register            |
| SP       | -       | Stack pointer            |
| XZR/WZR  | -       | Zero register            |
| PC       | -       | Program counter          |

### Linux Syscall Convention

```
X8 = syscall number
X0-X5 = args
svc #0
X0 = return value
```

### Common Instructions

| Instruction       | Description        |
| ----------------- | ------------------ |
| `LDR Rd, [Rn]`    | Load from memory   |
| `STR Rd, [Rn]`    | Store to memory    |
| `ADD Rd, Rn, Op2` | Add                |
| `SUB Rd, Rn, Op2` | Subtract           |
| `CMP Rn, Op2`     | Compare            |
| `B label`         | Branch             |
| `BL label`        | Branch with link   |
| `BEQ/BNE/BLT/BGT` | Conditional branch |

---

## RISC-V (RV64)

### Registers

| Register | ABI Name | Purpose             |
| -------- | -------- | ------------------- |
| x0       | zero     | Hardwired zero      |
| x1       | ra       | Return address      |
| x2       | sp       | Stack pointer       |
| x3       | gp       | Global pointer      |
| x4       | tp       | Thread pointer      |
| x5-x7    | t0-t2    | Temporaries         |
| x8       | s0/fp    | Saved/frame pointer |
| x9       | s1       | Saved               |
| x10-x11  | a0-a1    | Args/return         |
| x12-x17  | a2-a7    | Arguments           |
| x18-x27  | s2-s11   | Saved               |
| x28-x31  | t3-t6    | Temporaries         |

### Linux Syscall Convention

```
a7 = syscall number
a0-a5 = args
ecall
a0 = return value
```

### Common Instructions

| Instruction             | Description            |
| ----------------------- | ---------------------- |
| `lw/ld rd, off(rs)`     | Load word/doubleword   |
| `sw/sd rs2, off(rs1)`   | Store word/doubleword  |
| `add rd, rs1, rs2`      | Add                    |
| `addi rd, rs1, imm`     | Add immediate          |
| `beq/bne rs1, rs2, off` | Branch equal/not equal |
| `jal rd, offset`        | Jump and link          |
| `jalr rd, rs, off`      | Jump and link register |

---

## x86 (32-bit)

### Registers

| Register | Purpose             |
| -------- | ------------------- |
| EAX      | Accumulator, return |
| EBX      | Base, callee-saved  |
| ECX      | Counter             |
| EDX      | Data                |
| ESI      | Source              |
| EDI      | Destination         |
| ESP      | Stack pointer       |
| EBP      | Base pointer        |

### Linux Syscall (int 0x80)

```
EAX = syscall number
EBX = arg1, ECX = arg2, EDX = arg3
ESI = arg4, EDI = arg5, EBP = arg6
int 0x80
EAX = return value
```

---

## Output Formats

| Format | Extension | Use Case                 |
| ------ | --------- | ------------------------ |
| ELF32  | .o        | 32-bit Linux objects     |
| ELF64  | .o        | 64-bit Linux objects     |
| Win32  | .obj      | Windows 32-bit           |
| Win64  | .obj      | Windows 64-bit           |
| Mach-O | .o        | macOS                    |
| bin    | .bin      | Raw binary (bootloaders) |

---

## Quick Syntax Comparison

### Move/Load

```nasm
; x86-64 (Intel)
mov rax, 42

; x86-64 (AT&T/GAS)
movq $42, %rax

; ARM64
mov x0, #42

; RISC-V
li a0, 42
```

### Memory Access

```nasm
; x86-64 (Intel)
mov rax, [rbp-8]

; x86-64 (AT&T/GAS)
movq -8(%rbp), %rax

; ARM64
ldr x0, [x29, #-8]

; RISC-V
ld a0, -8(s0)
```
