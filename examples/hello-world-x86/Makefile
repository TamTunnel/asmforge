# Hello World x86-64 Example

NASM=nasm
LD=ld

all: hello

main.o: main.asm
	$(NASM) -f elf64 main.asm -o main.o

hello: main.o
	$(LD) main.o -o hello

run: hello
	./hello

clean:
	rm -f main.o hello

.PHONY: all run clean
