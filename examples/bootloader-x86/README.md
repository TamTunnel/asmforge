# Simple x86 Bootloader

A minimal bootloader that runs on bare metal - no operating system required!

## What Is This?

When you turn on a computer, the BIOS loads the first 512 bytes from the boot device and executes it. This is the "boot sector" or "bootloader". This example creates a simple bootloader that:

1. Displays a welcome message
2. Waits for a keypress
3. Reboots the computer

## Prerequisites

- NASM assembler
- QEMU system emulator

```bash
# Ubuntu/Debian
sudo apt install nasm qemu-system-x86

# macOS
brew install nasm qemu
```

## Building and Running

```bash
chmod +x build.sh
./build.sh
```

This will:

1. Assemble the boot sector
2. Verify it's exactly 512 bytes
3. Check for the boot signature (0xAA55)
4. Launch QEMU to test it

## How It Works

### Boot Sector Requirements

- **Size**: Exactly 512 bytes
- **Signature**: Last two bytes must be `0x55 0xAA`
- **Load Address**: BIOS loads it at `0x7C00`
- **Mode**: Starts in 16-bit real mode

### Code Structure

```nasm
[BITS 16]       ; Generate 16-bit code
[ORG 0x7C00]    ; Tell NASM our load address

start:
    ; Your code here

times 510-($-$$) db 0   ; Pad to 510 bytes
dw 0xAA55               ; Boot signature
```

### BIOS Interrupts Used

| Interrupt           | Function       | Description     |
| ------------------- | -------------- | --------------- |
| `int 0x10, ah=0x00` | Set video mode | Clear screen    |
| `int 0x10, ah=0x0E` | Teletype       | Print character |
| `int 0x16, ah=0x00` | Wait for key   | Keyboard input  |

## Debugging with QEMU + GDB

1. Start QEMU with GDB server:

    ```bash
    qemu-system-x86_64 -fda boot.bin -s -S
    ```

2. In another terminal, start GDB:

    ```bash
    gdb -ex "target remote localhost:1234" \
        -ex "set architecture i8086" \
        -ex "break *0x7c00"
    ```

3. Type `c` to continue and hit the breakpoint

## Exercises

1. **Change colors** - Modify BL register in print_string
2. **Add more text** - Create new messages
3. **Read sectors** - Use `int 0x13` to load more code
4. **Switch to 32-bit** - Enter protected mode

## Going Further

This bootloader just prints text. A real bootloader would:

1. Load a kernel from disk
2. Set up the GDT (Global Descriptor Table)
3. Switch to protected mode (32-bit) or long mode (64-bit)
4. Jump to the kernel

See resources like the OSDev Wiki for more information.
