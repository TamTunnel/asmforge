/* Linker Script for ARM Cortex-M (Generic)
 * 
 * Adjust FLASH and RAM sizes for your specific MCU
 * This example is for STM32F103C8 (64KB Flash, 20KB RAM)
 */

MEMORY
{
    FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 64K
    RAM   (rwx) : ORIGIN = 0x20000000, LENGTH = 20K
}

/* Stack starts at top of RAM */
_stack_top = ORIGIN(RAM) + LENGTH(RAM);

SECTIONS
{
    /* Vector table must be first */
    .vector_table :
    {
        KEEP(*(.vector_table))
    } > FLASH

    /* Code and read-only data */
    .text :
    {
        *(.text*)
        *(.rodata*)
        _text_end = .;
    } > FLASH

    /* Initialized data - stored in FLASH, copied to RAM */
    _data_load = LOADADDR(.data);
    .data :
    {
        _data_start = .;
        *(.data*)
        _data_end = .;
    } > RAM AT > FLASH

    /* Uninitialized data - zeroed at startup */
    .bss :
    {
        _bss_start = .;
        *(.bss*)
        *(COMMON)
        _bss_end = .;
    } > RAM

    /* Heap (optional, for malloc) */
    .heap :
    {
        _heap_start = .;
        . = . + 1K;  /* 1KB heap */
        _heap_end = .;
    } > RAM
}
