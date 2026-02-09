; Simple x86 Bootloader
; Displays a message when the computer boots
;
; Build: nasm -f bin boot.asm -o boot.bin
; Run:   qemu-system-x86_64 -fda boot.bin
;
; This is a 512-byte boot sector that runs in 16-bit real mode

[BITS 16]           ; 16-bit real mode
[ORG 0x7C00]        ; BIOS loads us at this address

; =============================================
; Entry Point
; =============================================
start:
    ; Setup segment registers
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00      ; Stack grows down from 0x7C00

    ; Clear screen
    call clear_screen

    ; Print welcome message
    mov si, msg_welcome
    call print_string

    ; Print OS name
    mov si, msg_os
    call print_string

    ; Wait for keypress
    mov si, msg_press_key
    call print_string
    
    xor ax, ax
    int 0x16            ; BIOS: Wait for key

    ; Reboot (jump to BIOS reset vector)
    jmp 0xFFFF:0x0000

; =============================================
; Clear Screen
; =============================================
clear_screen:
    mov ah, 0x00        ; Set video mode
    mov al, 0x03        ; 80x25 text mode
    int 0x10            ; BIOS video interrupt
    ret

; =============================================
; Print Null-Terminated String
; Input: SI = pointer to string
; =============================================
print_string:
    push ax
    push bx
    mov ah, 0x0E        ; Teletype output
    mov bh, 0x00        ; Page number
    mov bl, 0x07        ; Light gray color
.loop:
    lodsb               ; Load byte from [SI] into AL, increment SI
    test al, al         ; Check for null terminator
    jz .done
    int 0x10            ; BIOS: Print character
    jmp .loop
.done:
    pop bx
    pop ax
    ret

; =============================================
; Data
; =============================================
msg_welcome:    db "================================", 13, 10
                db "  AsmForge Bootloader Example   ", 13, 10
                db "================================", 13, 10, 13, 10, 0

msg_os:         db "  This is a bare-metal program", 13, 10
                db "  running without an OS!", 13, 10, 13, 10, 0

msg_press_key:  db "  Press any key to reboot...", 13, 10, 0

; =============================================
; Boot Sector Signature
; =============================================
times 510-($-$$) db 0   ; Pad with zeros
dw 0xAA55               ; Boot signature (required)
