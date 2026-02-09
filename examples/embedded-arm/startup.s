/* ARM Cortex-M Startup Code
 * Minimal startup for ARM Cortex-M microcontrollers
 * 
 * This file initializes the microcontroller and calls main()
 *
 * Build: arm-none-eabi-as startup.s -o startup.o
 * Link:  arm-none-eabi-ld -T linker.ld startup.o main.o -o firmware.elf
 */

    .syntax unified
    .cpu cortex-m3
    .thumb

/* Vector Table - Must be at address 0x00000000 */
    .section .vector_table, "a"
    .word _stack_top           /* Initial stack pointer */
    .word Reset_Handler        /* Reset handler */
    .word NMI_Handler          /* NMI handler */
    .word HardFault_Handler    /* Hard fault handler */
    .word MemManage_Handler    /* MPU fault handler */
    .word BusFault_Handler     /* Bus fault handler */
    .word UsageFault_Handler   /* Usage fault handler */
    .word 0                    /* Reserved */
    .word 0                    /* Reserved */
    .word 0                    /* Reserved */
    .word 0                    /* Reserved */
    .word SVC_Handler          /* SVCall handler */
    .word DebugMon_Handler     /* Debug monitor handler */
    .word 0                    /* Reserved */
    .word PendSV_Handler       /* PendSV handler */
    .word SysTick_Handler      /* SysTick handler */

/* ============================================= */
/* Reset Handler - Entry Point                  */
/* ============================================= */
    .section .text
    .thumb_func
    .global Reset_Handler
    .type Reset_Handler, %function
Reset_Handler:
    /* Initialize stack pointer (already done by hardware) */
    ldr r0, =_stack_top
    mov sp, r0

    /* Copy .data section from FLASH to RAM */
    ldr r0, =_data_start       /* Destination: RAM start */
    ldr r1, =_data_load        /* Source: FLASH location */
    ldr r2, =_data_end         /* End address */
    
copy_data:
    cmp r0, r2
    bge zero_bss
    ldr r3, [r1], #4           /* Load word, increment source */
    str r3, [r0], #4           /* Store word, increment dest */
    b copy_data

    /* Zero out .bss section */
zero_bss:
    ldr r0, =_bss_start
    ldr r1, =_bss_end
    mov r2, #0

zero_loop:
    cmp r0, r1
    bge call_main
    str r2, [r0], #4
    b zero_loop

    /* Call main() */
call_main:
    bl main

    /* If main returns, loop forever */
halt:
    wfi                        /* Wait for interrupt (low power) */
    b halt

/* ============================================= */
/* Default Interrupt Handlers (infinite loops)  */
/* ============================================= */
    .thumb_func
    .weak NMI_Handler
NMI_Handler:
    b .

    .thumb_func
    .weak HardFault_Handler
HardFault_Handler:
    b .

    .thumb_func
    .weak MemManage_Handler
MemManage_Handler:
    b .

    .thumb_func
    .weak BusFault_Handler
BusFault_Handler:
    b .

    .thumb_func
    .weak UsageFault_Handler
UsageFault_Handler:
    b .

    .thumb_func
    .weak SVC_Handler
SVC_Handler:
    b .

    .thumb_func
    .weak DebugMon_Handler
DebugMon_Handler:
    b .

    .thumb_func
    .weak PendSV_Handler
PendSV_Handler:
    b .

    .thumb_func
    .weak SysTick_Handler
SysTick_Handler:
    b .

    .end
