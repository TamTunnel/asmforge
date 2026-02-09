; Sample x86-64 assembly program (NASM syntax)
; Demonstrates syntax highlighting for AsmForge IDE

section .data
    message db "Hello from AsmForge IDE!", 10, 0
    msg_len equ $ - message
    
    ; Numeric constants - various formats
    hex_val dd 0xDEADBEEF
    bin_val db 10101010b
    oct_val dw 755o
    dec_val dq 1234567890

section .bss
    buffer resb 256
    counter resq 1

section .text
    global _start
    extern printf

_start:
    ; Function prologue
    push rbp
    mov rbp, rsp
    sub rsp, 32

    ; Write system call (syscall number 1)
    mov rax, 1              ; sys_write
    mov rdi, 1              ; stdout file descriptor
    lea rsi, [message]      ; pointer to message
    mov rdx, msg_len        ; message length
    syscall

    ; Demonstrate various instruction types
    
    ; Arithmetic operations
    mov eax, 100
    add eax, 50
    sub eax, 25
    imul eax, 2
    
    ; Bitwise operations
    and eax, 0xFF
    or eax, 0x80
    xor eax, eax
    shl eax, 4
    shr eax, 2
    
    ; Comparison and conditional jumps
    cmp eax, 0
    je .is_zero
    jne .not_zero
    jg .greater
    jl .less
    
.is_zero:
    nop
    jmp .continue
    
.not_zero:
    nop
    jmp .continue
    
.greater:
    nop
    jmp .continue
    
.less:
    nop
    
.continue:
    ; Loop example
    mov rcx, 10
.loop_start:
    ; Loop body
    dec rcx
    jnz .loop_start

    ; SSE/AVX operations
    movaps xmm0, [buffer]
    addps xmm0, xmm1
    mulps xmm0, xmm2
    movaps [buffer], xmm0
    
    ; AVX-512 example
    vmovdqa64 zmm0, [buffer]
    vpaddd zmm0, zmm0, zmm1
    
    ; String operations
    lea rsi, [message]
    lea rdi, [buffer]
    mov rcx, msg_len
    rep movsb
    
    ; Function call (System V ABI)
    mov rdi, message        ; 1st argument
    xor eax, eax            ; no vector args
    call printf
    
    ; Function epilogue
    mov rsp, rbp
    pop rbp

    ; Exit system call (syscall number 60)
    mov rax, 60             ; sys_exit
    xor rdi, rdi            ; exit code 0
    syscall

; Subroutine example
my_function:
    push rbp
    mov rbp, rsp
    
    ; Function body
    mov rax, rdi
    add rax, rsi
    
    pop rbp
    ret
