// @ts-check
require('reflect-metadata');
const { Container } = require('@theia/core/shared/inversify');
const {
    FrontendApplicationConfigProvider,
} = require('@theia/core/lib/browser/frontend-application-config-provider');

FrontendApplicationConfigProvider.set({
    applicationName: 'AsmForge IDE',
    defaultTheme: {
        light: 'light',
        dark: 'dark',
    },
    defaultIconTheme: 'theia-file-icons',
    electron: {
        windowOptions: {},
        showWindowEarly: true,
        splashScreenOptions: {},
        uriScheme: 'theia',
    },
    defaultLocale: '',
    validatePreferencesSchema: true,
    reloadOnReconnect: false,
    uriScheme: 'theia',
    warnOnPotentiallyInsecureHostPattern: false,
    preferences: {
        'workbench.colorTheme': 'dark',
        'editor.fontSize': 14,
        'editor.fontFamily':
            "'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Consolas', monospace",
        'editor.fontLigatures': true,
        'editor.tabSize': 4,
        'editor.insertSpaces': false,
        'editor.minimap.enabled': true,
        'editor.minimap.renderCharacters': false,
        'editor.renderWhitespace': 'selection',
        'editor.cursorStyle': 'block',
        'editor.cursorBlinking': 'smooth',
        'editor.lineNumbers': 'on',
        'editor.rulers': [80, 120],
        'editor.wordWrap': 'off',
        'terminal.integrated.fontFamily': "'JetBrains Mono', 'Fira Code', monospace",
        'terminal.integrated.fontSize': 13,
        'workbench.iconTheme': 'theia-file-icons',
        'window.menuBarVisibility': 'visible',
        'workbench.colorCustomizations': {
            'editor.background': '#0d1117',
            'editor.foreground': '#c9d1d9',
            'editorLineNumber.foreground': '#6e7681',
            'editorLineNumber.activeForeground': '#f0883e',
            'editor.selectionBackground': '#264f78',
            'editor.lineHighlightBackground': '#161b22',
            'activityBar.background': '#0d1117',
            'activityBar.foreground': '#f0883e',
            'sideBar.background': '#0d1117',
            'sideBar.foreground': '#c9d1d9',
            'sideBarSectionHeader.background': '#161b22',
            'titleBar.activeBackground': '#0d1117',
            'titleBar.activeForeground': '#f0883e',
            'statusBar.background': '#0d1117',
            'statusBar.foreground': '#8b949e',
            'terminal.background': '#0d1117',
            'terminal.foreground': '#c9d1d9',
            'panel.background': '#0d1117',
        },
    },
});

self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
        return './editor.worker.js';
    },
};

function load(container, jsModule) {
    return Promise.resolve(jsModule).then((containerModule) =>
        container.load(containerModule.default)
    );
}

async function preload(container) {
    try {
        await load(container, require('@theia/core/lib/browser/preload/preload-module'));
        const { Preloader } = require('@theia/core/lib/browser/preload/preloader');
        const preloader = container.get(Preloader);
        await preloader.initialize();
    } catch (reason) {
        console.error('Failed to run preload scripts.');
        if (reason) {
            console.error(reason);
        }
    }
}

module.exports = (async () => {
    const {
        messagingFrontendModule,
    } = require('@theia/core/lib/browser/messaging/messaging-frontend-module');
    const container = new Container();
    container.load(messagingFrontendModule);

    await preload(container);

    const { MonacoInit } = require('@theia/monaco/lib/browser/monaco-init');
    const { FrontendApplication } = require('@theia/core/lib/browser');
    const {
        frontendApplicationModule,
    } = require('@theia/core/lib/browser/frontend-application-module');
    const { loggerFrontendModule } = require('@theia/core/lib/browser/logger-frontend-module');

    container.load(frontendApplicationModule);
    undefined;

    container.load(loggerFrontendModule);

    try {
        await load(container, require('@theia/core/lib/browser/i18n/i18n-frontend-module'));
        await load(container, require('@theia/core/lib/browser/menu/browser-menu-module'));
        await load(container, require('@theia/core/lib/browser/window/browser-window-module'));
        await load(container, require('@theia/core/lib/browser/keyboard/browser-keyboard-module'));
        await load(container, require('@theia/core/lib/browser/request/browser-request-module'));
        await load(
            container,
            require('@theia/variable-resolver/lib/browser/variable-resolver-frontend-module')
        );
        await load(container, require('@theia/editor/lib/browser/editor-frontend-module'));
        await load(container, require('@theia/filesystem/lib/browser/filesystem-frontend-module'));
        await load(
            container,
            require('@theia/filesystem/lib/browser/download/file-download-frontend-module')
        );
        await load(
            container,
            require('@theia/filesystem/lib/browser/file-dialog/file-dialog-module')
        );
        await load(container, require('@theia/workspace/lib/browser/workspace-frontend-module'));
        await load(
            container,
            require('@theia/markers/lib/browser/problem/problem-frontend-module')
        );
        await load(container, require('@theia/messages/lib/browser/messages-frontend-module'));
        await load(
            container,
            require('@theia/outline-view/lib/browser/outline-view-frontend-module')
        );
        await load(container, require('@theia/monaco/lib/browser/monaco-frontend-module'));
        await load(container, require('@theia/navigator/lib/browser/navigator-frontend-module'));
        await load(container, require('@theia/output/lib/browser/output-frontend-module'));
        await load(
            container,
            require('@theia/userstorage/lib/browser/user-storage-frontend-module')
        );
        await load(container, require('@theia/preferences/lib/browser/preference-frontend-module'));
        await load(container, require('@theia/process/lib/common/process-common-module'));
        await load(
            container,
            require('@theia/search-in-workspace/lib/browser/search-in-workspace-frontend-module')
        );
        await load(
            container,
            require('@theia/file-search/lib/browser/file-search-frontend-module')
        );
        await load(container, require('@theia/terminal/lib/browser/terminal-frontend-module'));
        await load(container, require('@theia/console/lib/browser/console-frontend-module'));
        await load(container, require('@theia/task/lib/browser/task-frontend-module'));
        await load(container, require('@theia/test/lib/browser/view/test-view-frontend-module'));
        await load(container, require('@theia/debug/lib/browser/debug-frontend-module'));
        await load(
            container,
            require('@theia/callhierarchy/lib/browser/callhierarchy-frontend-module')
        );
        await load(container, require('@theia/scm/lib/browser/scm-frontend-module'));

        MonacoInit.init(container);
        await start();
    } catch (reason) {
        console.error('Failed to start the frontend application.');
        if (reason) {
            console.error(reason);
        }
    }

    function start() {
        (window['theia'] = window['theia'] || {}).container = container;
        return container.get(FrontendApplication).start();
    }
})();
