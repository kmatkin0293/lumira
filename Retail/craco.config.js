module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Silence named-export-from-default warnings from ThoughtSpot SDK
      if (!webpackConfig.module) webpackConfig.module = {};
      if (!webpackConfig.module.parser) webpackConfig.module.parser = {};
      webpackConfig.module.parser.javascript = {
        ...(webpackConfig.module.parser.javascript || {}),
        exportsPresence: 'warn',
      };

      // Suppress the warnings from appearing in the build output / browser overlay
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        /Should not import the named export/,
        /ESLintWebpackPlugin/,
      ];

      return webpackConfig;
    },
  },
};
