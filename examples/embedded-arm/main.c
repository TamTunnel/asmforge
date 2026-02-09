/* Minimal main.c for ARM Cortex-M
 * 
 * This is a simple C file that the startup code calls.
 * In a real application, you would initialize peripherals here.
 */

#include <stdint.h>

/* Memory-mapped GPIO (example for STM32F103) */
#define RCC_APB2ENR   (*(volatile uint32_t*)0x40021018)
#define GPIOC_CRH     (*(volatile uint32_t*)0x40011004)
#define GPIOC_ODR     (*(volatile uint32_t*)0x4001100C)

/* Simple delay loop */
void delay(volatile uint32_t count) {
    while (count--) {
        __asm__("nop");
    }
}

/* Main function - called by startup.s */
int main(void) {
    /* Enable GPIOC clock (for LED on PC13, common on Blue Pill) */
    RCC_APB2ENR |= (1 << 4);  /* IOPCEN bit */
    
    /* Configure PC13 as output (push-pull, 2MHz) */
    GPIOC_CRH &= ~(0xF << 20);  /* Clear CNF13 and MODE13 */
    GPIOC_CRH |= (0x2 << 20);   /* MODE13 = 10 (2MHz output) */

    /* Blink LED forever */
    while (1) {
        GPIOC_ODR ^= (1 << 13);  /* Toggle PC13 */
        delay(500000);
    }

    return 0;  /* Never reached */
}
