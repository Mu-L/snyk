import chalk from 'chalk';

import {runTest} from './run-test';
import * as detect from '../detect';
import * as pm from '../package-managers';

export function test(root, options) {
  try {
    // if (options.all) {
    //   for (packageManagerFileCombo of detect.detectPackageManagers(root, options)) {
    //     const optionsObj = clone(options);
    //     optionsObj.files? = packageManagerFileCombo.files;
    //     optionsObj.packageManager = packageManagerFileCombo.packageManager
    //
    //   }
    // }
    const packageManager = detect.detectPackageManager(root, options);
    options.packageManager = packageManager;
    return run(root, options)
      .then((results) => {
        for (const res of results) {
          if (!res.packageManager) {
            res.packageManager = packageManager;
          }
        }
        if (results.length === 1) {
          // Return only one result if only one found as this is the default usecase
          return results[0];
        }
        // For gradle and yarnWorkspaces we may be returning more than one result
        return results;
      });
  } catch (error) {
    return Promise.reject(chalk.red.bold(error));
  }
}

function run(root, options) {
  const packageManager = options.packageManager;
  if (!(options.docker || pm.SUPPORTED_PACKAGE_MANAGER_NAME[packageManager])) {
    throw new Error('Unsupported package manager: ' + packageManager);
  }
  return runTest(packageManager, root, options);
}