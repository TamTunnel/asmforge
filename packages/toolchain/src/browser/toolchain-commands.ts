/**
 * Toolchain - Commands
 */

import { Command } from '@theia/core/lib/common';

export const ASSEMBLE_FILE: Command = {
    id: 'toolchain.assembleFile',
    label: 'Assemble Current File',
    category: 'Assembly',
};

export const ASSEMBLE_AND_LINK: Command = {
    id: 'toolchain.assembleAndLink',
    label: 'Assemble and Link',
    category: 'Assembly',
};

export const GENERATE_LISTING: Command = {
    id: 'toolchain.generateListing',
    label: 'Generate Listing File',
    category: 'Assembly',
};

export const SET_ASSEMBLER: Command = {
    id: 'toolchain.setAssembler',
    label: 'Set Default Assembler',
    category: 'Assembly',
};

export const DETECT_ASSEMBLER: Command = {
    id: 'toolchain.detectAssembler',
    label: 'Detect Assembler from Syntax',
    category: 'Assembly',
};

export const CHECK_TOOLCHAIN: Command = {
    id: 'toolchain.checkToolchain',
    label: 'Check Installed Toolchain',
    category: 'Assembly',
};
