// Sample ARM64 (AArch64) assembly program
// Demonstrates syntax highlighting for AsmForge IDE

.data
    message:    .asciz "Hello from AsmForge IDE!\n"
    msg_len = . - message
    
    // Various data types
    byte_val:   .byte 0x42
    half_val:   .hword 0x1234
    word_val:   .word 0xDEADBEEF
    quad_val:   .quad 0x123456789ABCDEF0

.bss
    .align 4
    buffer:     .space 256

.text
.global _start
.type _start, %function

_start:
    // Function prologue
    stp x29, x30, [sp, #-16]!
    mov x29, sp

    // Write system call
    mov x8, #64             // sys_write
    mov x0, #1              // stdout
    ldr x1, =message        // message pointer
    mov x2, #msg_len        // length
    svc #0

    // Demonstrate various instruction types
    
    // Data movement
    mov x0, #100
    mov w1, #50
    movz x2, #0x1234
    movk x2, #0x5678, lsl #16
    
    // Arithmetic operations
    add x0, x0, x1
    sub x0, x0, #25
    mul x0, x0, x2
    sdiv x3, x0, x1
    
    // Logical operations
    and x0, x0, #0xFF
    orr x0, x0, #0x80
    eor x0, x0, x0
    lsl x0, x0, #4
    lsr x0, x0, #2
    
    // Comparison and conditional branches
    cmp x0, #0
    beq .Lis_zero
    bne .Lnot_zero
    bgt .Lgreater
    blt .Lless
    
.Lis_zero:
    nop
    b .Lcontinue
    
.Lnot_zero:
    nop
    b .Lcontinue
    
.Lgreater:
    nop
    b .Lcontinue
    
.Lless:
    nop
    
.Lcontinue:
    // Loop example
    mov x9, #10
.Lloop_start:
    // Loop body
    subs x9, x9, #1
    bne .Lloop_start

    // Load/Store operations
    ldr x0, [x1]           // Load from memory
    ldr x0, [x1, #8]       // Load with offset
    ldr x0, [x1, x2]       // Load with register offset
    ldr x0, [x1, x2, lsl #3]  // Load with scaled offset
    ldp x0, x1, [sp]       // Load pair
    
    str x0, [x1]           // Store to memory
    stp x0, x1, [sp, #-16]! // Store pair with pre-index
    
    // NEON/SIMD operations
    ld1 {v0.4s}, [x0]      // Load 4 single-precision floats
    fadd v0.4s, v0.4s, v1.4s
    fmul v0.4s, v0.4s, v2.4s
    st1 {v0.4s}, [x0]
    
    // Floating point
    fmov d0, #1.0
    fadd d0, d0, d1
    fmul d0, d0, d2
    fcmp d0, #0.0
    
    // Conditional select
    csel x0, x1, x2, eq
    cset x0, ne
    
    // Bit manipulation
    clz x0, x1             // Count leading zeros
    rbit x0, x1            // Reverse bits
    rev x0, x1             // Reverse bytes

    // Function epilogue
    ldp x29, x30, [sp], #16
    
    // Exit system call
    mov x8, #93             // sys_exit
    mov x0, #0              // exit code 0
    svc #0

// Subroutine example
.type my_function, %function
my_function:
    stp x29, x30, [sp, #-16]!
    mov x29, sp
    
    // Function body
    add x0, x0, x1
    
    ldp x29, x30, [sp], #16
    ret
.size my_function, . - my_function
