const path = require('path');
const PROXY_PATH = __dirname;

module.exports.withOutside = function withOutside(metroConfig) {
  return {
    ...metroConfig,

    resolver: {
      ...metroConfig.resolver,

      resolveRequest: (context, moduleName, platform) => {
        if (moduleName === 'react-native') {
          const originPath = context.originModulePath || '';
          const isViewProxy = originPath.includes('react-native-outside');

          if (!isViewProxy) {
            return {
              type: 'sourceFile',
              filePath: path.join(PROXY_PATH, 'view-proxy.js'),
            };
          }
        }

        if (metroConfig?.resolver?.resolveRequest) {
          return metroConfig.resolver.resolveRequest(context, moduleName, platform);
        }

        return context.resolveRequest(context, moduleName, platform);
      },
    },

    watchFolders: [...(metroConfig.watchFolders || []), PROXY_PATH],
  };
};
