/**
 * AsmForge IDE - Webpack Configuration
 * Performance optimizations for lazy loading and faster startup
 */
// @ts-check
const configs = require('./gen-webpack.config.js');
const nodeConfig = require('./gen-webpack.node.config.js');

// =============================================
// Performance Optimizations
// =============================================

// Apply optimizations to the main browser config
const browserConfig = configs[0];

// Enable aggressive code splitting for lazy loading
browserConfig.optimization = {
    ...browserConfig.optimization,
    splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
            // Vendor chunks for better caching
            theia: {
                test: /[\\/]node_modules[\\/]@theia[\\/]/,
                name: 'theia-core',
                priority: 10,
                reuseExistingChunk: true,
            },
            monaco: {
                test: /[\\/]node_modules[\\/]monaco-/,
                name: 'monaco-editor',
                priority: 20,
                reuseExistingChunk: true,
            },
            // AsmForge extensions - lazy loaded
            asmforge: {
                test: /[\\/]packages[\\/](nova-ai|toolchain|memory-viewer|register-viewer)[\\/]/,
                name: 'asmforge-extensions',
                priority: 5,
                chunks: 'async', // Only include in async chunks
            },
            // Common vendor code
            vendors: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                    // Get the package name
                    const packageName =
                        module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1] ||
                        'vendors';
                    return `npm.${packageName.replace('@', '')}`;
                },
                priority: -10,
                reuseExistingChunk: true,
            },
        },
    },
    // Runtime chunk for better caching
    runtimeChunk: 'single',
    // Module IDs for deterministic builds
    moduleIds: 'deterministic',
};

// Configure module resolution for faster builds
browserConfig.resolve = {
    ...browserConfig.resolve,
    // Limit extensions to speed up resolution
    extensions: ['.ts', '.tsx', '.js', '.json'],
    // Symlinks slow down resolution
    symlinks: false,
};

// =============================================
// Production Optimizations
// =============================================
if (process.env.NODE_ENV === 'production') {
    browserConfig.performance = {
        hints: 'warning',
        maxAssetSize: 512000, // 500KB
        maxEntrypointSize: 512000, // 500KB
    };
}

// =============================================
// Development Optimizations
// =============================================
if (process.env.NODE_ENV !== 'production') {
    // Faster source maps for development
    browserConfig.devtool = 'eval-cheap-module-source-map';

    // Cache for faster rebuilds
    browserConfig.cache = {
        type: 'filesystem',
        buildDependencies: {
            config: [__filename],
        },
    };
}

module.exports = [...configs, nodeConfig.config];
