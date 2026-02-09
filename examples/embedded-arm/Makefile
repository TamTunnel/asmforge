# ARM Cortex-M Embedded Example

ARM_PREFIX = arm-none-eabi-
AS = $(ARM_PREFIX)as
CC = $(ARM_PREFIX)gcc
LD = $(ARM_PREFIX)ld
OBJCOPY = $(ARM_PREFIX)objcopy
SIZE = $(ARM_PREFIX)size

CPU = cortex-m3
ASFLAGS = -mcpu=$(CPU) -mthumb
CFLAGS = -mcpu=$(CPU) -mthumb -Os -ffreestanding -nostdlib
LDFLAGS = -T linker.ld -nostdlib

all: firmware.bin

startup.o: startup.s
	$(AS) $(ASFLAGS) startup.s -o startup.o

main.o: main.c
	$(CC) $(CFLAGS) -c main.c -o main.o

firmware.elf: startup.o main.o linker.ld
	$(LD) $(LDFLAGS) startup.o main.o -o firmware.elf
	$(SIZE) firmware.elf

firmware.bin: firmware.elf
	$(OBJCOPY) -O binary firmware.elf firmware.bin

qemu: firmware.elf
	qemu-system-arm -M lm3s6965evb -kernel firmware.elf -nographic -S -s

clean:
	rm -f *.o *.elf *.bin

.PHONY: all qemu clean
