#!/bin/bash
# Build and run the bootloader

set -e

echo "=== Assembling bootloader ==="
nasm -f bin boot.asm -o boot.bin

echo "=== Checking boot sector size ==="
SIZE=$(stat -f%z boot.bin 2>/dev/null || stat -c%s boot.bin 2>/dev/null)
if [ "$SIZE" -eq 512 ]; then
    echo "✓ Boot sector is exactly 512 bytes"
else
    echo "✗ Error: Boot sector is $SIZE bytes (expected 512)"
    exit 1
fi

echo "=== Verifying boot signature ==="
SIGNATURE=$(xxd -p -s 510 -l 2 boot.bin)
if [ "$SIGNATURE" = "55aa" ]; then
    echo "✓ Boot signature 0xAA55 found"
else
    echo "✗ Error: Invalid boot signature: $SIGNATURE"
    exit 1
fi

echo ""
echo "=== Starting QEMU ==="
echo "(Close the QEMU window to exit)"
echo ""

qemu-system-x86_64 \
    -drive file=boot.bin,format=raw,index=0,if=floppy \
    -boot a \
    -m 32M
