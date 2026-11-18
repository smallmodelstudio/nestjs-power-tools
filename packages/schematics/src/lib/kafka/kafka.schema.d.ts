import { Path } from '@angular-devkit/core';

export interface KafkaOptions {
  /**
   * The name of the Kafka feature. Used for file names, class names and the client token.
   */
  name: string;
  /**
   * The path to create the Kafka files in.
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
   * Internal. UPPER_SNAKE_CASE form of the name, used for the client token.
   */
  tokenName?: string;
  /**
   * Internal. Import extension for relative imports ('.js' for ESM projects).
   */
  importExtension?: string;
}
