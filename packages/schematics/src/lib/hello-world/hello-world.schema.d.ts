import { Path } from '@angular-devkit/core';

export interface HelloWorldOptions {
  /**
   * The name of the class.
   */
  name: string;
  /**
   * The path to create the class.
   */
  path?: string | Path;
  /**
   * Application language.
   */
  language?: string;
  /**
   * The source root path.
   */
  sourceRoot?: string;
  /**
   * Specifies if a spec file is generated.
   */
}
