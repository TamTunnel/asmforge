// @ts-check

require('@theia/core/shared/reflect-metadata');

// Workaround for https://github.com/electron/electron/issues/9225. Chrome has an issue where
// in certain locales (e.g. PL), image metrics are wrongly computed. We explicitly set the
// LC_NUMERIC to prevent this from happening (selects the numeric formatting category of the
// C locale, http://en.cppreference.com/w/cpp/locale/LC_categories).
if (process.env.LC_ALL) {
    process.env.LC_ALL = 'C';
}
process.env.LC_NUMERIC = 'C';

(async () => {
    // Useful for Electron/NW.js apps as GUI apps on macOS doesn't inherit the `$PATH` define
    // in your dotfiles (.bashrc/.bash_profile/.zshrc/etc).
    // https://github.com/electron/electron/issues/550#issuecomment-162037357
    // https://github.com/eclipse-theia/theia/pull/3534#issuecomment-439689082
    (await require('@theia/core/electron-shared/fix-path')).default();

    const { resolve } = require('path');
    const theiaAppProjectPath = resolve(__dirname, '..', '..');
    process.env.THEIA_APP_PROJECT_PATH = theiaAppProjectPath;
    const { default: electronMainApplicationModule } = require('@theia/core/lib/electron-main/electron-main-application-module');
    const { ElectronMainApplication, ElectronMainApplicationGlobals } = require('@theia/core/lib/electron-main/electron-main-application');
    const { Container } = require('@theia/core/shared/inversify');
    const { app } = require('electron');

    const config = {
    "applicationName": "AsmForge IDE",
    "defaultTheme": {
        "light": "light",
        "dark": "dark"
    },
    "defaultIconTheme": "theia-file-icons",
    "electron": {
        "windowOptions": {},
        "showWindowEarly": true,
        "splashScreenOptions": {},
        "uriScheme": "theia"
    },
    "defaultLocale": "",
    "validatePreferencesSchema": true,
    "reloadOnReconnect": false,
    "uriScheme": "theia",
    "splashLogo": "resources/asmforge-splash.svg",
    "preferences": {
        "workbench.colorTheme": "dark",
        "editor.fontSize": 14,
        "editor.fontFamily": "'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Consolas', monospace",
        "editor.fontLigatures": true,
        "editor.tabSize": 4,
        "editor.insertSpaces": false,
        "editor.minimap.enabled": true,
        "editor.cursorStyle": "block",
        "editor.rulers": [
            80,
            120
        ],
        "terminal.integrated.fontFamily": "'JetBrains Mono', 'Fira Code', monospace",
        "terminal.integrated.fontSize": 13,
        "workbench.iconTheme": "theia-file-icons",
        "workbench.colorCustomizations": {
            "editor.background": "#0d1117",
            "editor.foreground": "#c9d1d9",
            "editorLineNumber.foreground": "#6e7681",
            "editorLineNumber.activeForeground": "#f0883e",
            "editor.selectionBackground": "#264f78",
            "editor.lineHighlightBackground": "#161b22",
            "activityBar.background": "#0d1117",
            "activityBar.foreground": "#f0883e",
            "sideBar.background": "#0d1117",
            "sideBar.foreground": "#c9d1d9",
            "sideBarSectionHeader.background": "#161b22",
            "titleBar.activeBackground": "#0d1117",
            "titleBar.activeForeground": "#f0883e",
            "statusBar.background": "#0d1117",
            "statusBar.foreground": "#8b949e",
            "terminal.background": "#0d1117",
            "terminal.foreground": "#c9d1d9",
            "panel.background": "#0d1117"
        }
    }
};
    const isSingleInstance = true;

    if (isSingleInstance && !app.requestSingleInstanceLock(process.argv)) {
        // There is another instance running, exit now. The other instance will request focus.
        app.quit();
        return;
    }

    const container = new Container();
    container.load(electronMainApplicationModule);
    container.bind(ElectronMainApplicationGlobals).toConstantValue({
        THEIA_APP_PROJECT_PATH: theiaAppProjectPath,
        THEIA_BACKEND_MAIN_PATH: resolve(__dirname, 'main.js'),
        THEIA_FRONTEND_HTML_PATH: resolve(__dirname, '..', '..', 'lib', 'frontend', 'index.html'),
        THEIA_SECONDARY_WINDOW_HTML_PATH: resolve(__dirname, '..', '..', 'lib', 'frontend', 'secondary-window.html')
    });

    function load(raw) {
        return Promise.resolve(raw.default).then(module =>
            container.load(module)
        );
    }

    async function start() {
        const application = container.get(ElectronMainApplication);
        await application.start(config);
    }

    try {
        await load(require('@theia/filesystem/lib/electron-main/electron-main-module'));
        await start();
    } catch (reason) {
        if (typeof reason !== 'number') {
            console.error('Failed to start the electron application.');
            if (reason) {
                console.error(reason);
            }
        }
        app.quit();
    };
})();
