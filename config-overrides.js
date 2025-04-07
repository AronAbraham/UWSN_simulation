const webpack = require('webpack');

module.exports = function override(config, env) {
  // Filter out the source-map-loader rule for MediaPipe
  config.module.rules = config.module.rules.map(rule => {
    if (rule.oneOf) {
      rule.oneOf = rule.oneOf.map(oneOfRule => {
        if (oneOfRule.enforce === 'pre' && oneOfRule.loader && oneOfRule.loader.includes('source-map-loader')) {
          const newRule = { ...oneOfRule };
          newRule.exclude = /node_modules\/@mediapipe|three-mesh-bvh/;
          return newRule;
        }
        return oneOfRule;
      });
    }
    return rule;
  });

  // Add webpack plugins to resolve BatchedMesh issue
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve?.fallback,
    }
  };

  // Add webpack plugins to fix the missing BatchedMesh
  if (!config.plugins) {
    config.plugins = [];
  }

  // Add NormalModuleReplacementPlugin for three-mesh-bvh
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /three-mesh-bvh[\/\\]src[\/\\]utils[\/\\]ExtensionUtilities\.js$/,
      (resource) => {
        resource.request = require.resolve('./src/patches/ExtensionUtilities.js');
      }
    )
  );

  // Also add the string-replace-loader as a backup method
  config.module.rules.push({
    test: /[\\/]node_modules[\\/]three-mesh-bvh[\\/].*\.js$/,
    loader: require.resolve('string-replace-loader'),
    options: {
      search: /import\s*{[^}]*BatchedMesh[^}]*}\s*from\s*['"]three['"]/g,
      replace: (match) => match.replace('BatchedMesh', '/* BatchedMesh */'),
    }
  });

  return config;
}; 