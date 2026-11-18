import { Path } from '@angular-devkit/core';

export interface PinoOptions {
  /**
   * The name of the Pino logging feature. Used for file names and class names.
   */
  name: string;
  /**
   * The path to create the Pino files in.
   */
  path?: string | Path;
  /**
   * Generate the files in the target path without a folder named after the feature.
   */
  flat?: boolean;
  /**
   * The language of the generated files (ts).
   */
  language?: 'ts';
  /**
   * Add the dependencies to package.json without scheduling an install.
   */
  skipInstall?: boolean;
  /**
   * The source root path.
   */
  sourceRoot?: string;
  /**
   * Internal. PascalCase form of the name, used for class names.
   */
  className?: string;
  /**
   * Internal. Import extension for relative imports ('.js' for ESM projects).
   */
  importExtension?: string;
}
