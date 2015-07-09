/* @flow */
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

//PETE - This lot is all stored in /Language/Source.cs made no sense having it in a Location file

import type { Source } from './source';

/**
 * Represents a location in a Source.
 */
type SourceLocation = {
  line: number;
  column: number;
}

/**
 * Takes a Source and a UTF-8 character offset, and returns the corresponding
 * line and column as a SourceLocation.
 */
export function getLocation(source: Source, position: number): SourceLocation {
  var line = 1;
  var column = position + 1;
  var lineRegexp = /\r\n|[\n\r\u2028\u2029]/g;
  var match;
  while ((match = lineRegexp.exec(source.body)) && match.index < position) {
    line += 1;
    column = position + 1 - (match.index + match[0].length);
  }
  return { line, column };
}
