import { Path } from '@angular-devkit/core';

export interface HelloWorldOptions {
  /**
   * The name to greet. Also used as the generated file name.
   */
  name: string;
  /**
   * The path to create the file in.
   */
  path?: string | Path;
  /**
   * The language of the generated file (ts/js).
   */
  language?: 'ts' | 'js';
  /**
   * The source root path.
   */
  sourceRoot?: string;
}
