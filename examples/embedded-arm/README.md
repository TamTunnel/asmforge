# Embedded ARM Cortex-M Example

An embedded systems example targeting ARM Cortex-M microcontrollers. This demonstrates bare-metal programming with a startup file, linker script, and minimal C code.

## What's Included

| File        | Purpose                                 |
| ----------- | --------------------------------------- |
| `startup.s` | Assembly startup code with vector table |
| `main.c`    | Minimal C application (LED blink)       |
| `linker.ld` | Memory layout and section placement     |
| `Makefile`  | Build configuration                     |

## Prerequisites

Install the ARM embedded toolchain:

```bash
# Ubuntu/Debian
sudo apt install gcc-arm-none-eabi

# macOS
brew install arm-none-eabi-gcc

# Download from ARM
# https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain
```

## Building

```bash
make
```

This produces:

- `firmware.elf` - ELF file for debugging
- `firmware.bin` - Raw binary for flashing

## Testing with QEMU

QEMU doesn't perfectly emulate STM32, but you can test basic execution:

```bash
make qemu
```

Then connect GDB:

```bash
arm-none-eabi-gdb firmware.elf -ex "target remote localhost:1234"
```

## Code Walkthrough

### Vector Table (startup.s)

```asm
.section .vector_table, "a"
    .word _stack_top       /* Initial SP */
    .word Reset_Handler    /* Entry point */
    .word NMI_Handler
    ...
```

The Cortex-M boots by reading the first two words:

1. Initial stack pointer value
2. Address of reset handler

### Initialization Sequence

1. **Set stack pointer** (hardware does this automatically)
2. **Copy .data section** from Flash to RAM
3. **Zero .bss section**
4. **Call main()**

### Linker Script

The linker script defines:

- Flash at 0x08000000 (64KB)
- RAM at 0x20000000 (20KB)
- Stack at top of RAM
- Symbol names for startup code

## Debugging in AsmForge

1. Build with debug info: `make CFLAGS+="-g"`
2. Create a debug configuration for QEMU ARM
3. Set breakpoints in startup.s or main.c
4. Step through initialization

## Real Hardware

To flash to an STM32:

```bash
# Using OpenOCD
openocd -f interface/stlink.cfg -f target/stm32f1x.cfg \
    -c "program firmware.elf verify reset exit"

# Using ST-Link
st-flash write firmware.bin 0x08000000
```

## Exercises

1. **Add an interrupt** - Implement SysTick_Handler
2. **Use more peripherals** - UART, SPI, I2C
3. **Optimize startup** - Unroll copy loops
4. **Add fault handlers** - Print debug info on crash

## Architecture Notes

ARM Cortex-M uses Thumb-2 instruction set:

- 16-bit and 32-bit instructions
- All code in Thumb mode (no ARM mode switching)
- Hardware-managed exception handling
- Built-in vector table fetch

Common registers:
| Register | Purpose |
|----------|---------|
| R0-R3 | Arguments/return values |
| R4-R11 | Callee-saved |
| R12 | Scratch |
| SP (R13) | Stack pointer |
| LR (R14) | Link register |
| PC (R15) | Program counter |
