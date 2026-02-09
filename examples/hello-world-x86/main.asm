; Hello World in x86-64 Linux
; A minimal program that prints "Hello, World!" and exits
;
; Build: nasm -f elf64 main.asm -o main.o
; Link:  ld main.o -o hello
; Run:   ./hello

section .data
    ; The message to print
    message db "Hello, World!", 10      ; 10 = newline character
    msg_len equ $ - message             ; Calculate length at assembly time

section .text
    global _start

; Program entry point
_start:
    ; =============================================
    ; Write "Hello, World!" to stdout
    ; syscall: write(fd, buf, count)
    ; =============================================
    mov rax, 1              ; syscall number: write = 1
    mov rdi, 1              ; file descriptor: stdout = 1
    mov rsi, message        ; pointer to buffer
    mov rdx, msg_len        ; number of bytes to write
    syscall                 ; invoke the kernel

    ; =============================================
    ; Exit the program
    ; syscall: exit(code)
    ; =============================================
    mov rax, 60             ; syscall number: exit = 60
    xor rdi, rdi            ; exit code: 0 (success)
    syscall                 ; invoke the kernel

; Note: We never reach here because exit() doesn't return
