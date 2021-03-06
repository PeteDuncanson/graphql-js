/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import * as Kind from '../kinds';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { parse } from '../parser';
import { Source } from '../source';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Parser', () => {
  it('parse provides useful errors', () => {

    expect(
      () => parse(
`{ ...MissingOn }
fragment MissingOn Type
`)
    ).to.throw('Syntax Error GraphQL (2:20) Expected "on", found Name "Type"');

    expect(
      () => parse('{ field: {} }')
    ).to.throw('Syntax Error GraphQL (1:10) Expected Name, found {');

    expect(
      () => parse('notanoperation Foo { field }')
    ).to.throw('Syntax Error GraphQL (1:1) Unexpected Name "notanoperation"');

    expect(
      () => parse('...')
    ).to.throw('Syntax Error GraphQL (1:1) Unexpected ...');

  });

  it('parse provides useful error when using source', () => {
    expect(
      () => parse(new Source('query', 'MyQuery.graphql'))
    ).to.throw('Syntax Error MyQuery.graphql (1:6) Expected Name, found EOF');
  });

  it('parses variable inline values', () => {
    expect(
      () => parse('{ field(complex: { a: { b: [ $var ] } }) }')
    ).to.not.throw();
  });

  it('parses constant default values', () => {
    expect(
      () => parse('query Foo($x: Complex = { a: { b: [ $var ] } }) { field }')
    ).to.throw('Syntax Error GraphQL (1:37) Unexpected $');
  });

  it('duplicate keys in input object is syntax error', () => {
    expect(
      () => parse('{ field(arg: { a: 1, a: 2 }) }')
    ).to.throw('Syntax Error GraphQL (1:22) Duplicate input object field a.');
  });

  var kitchenSink = readFileSync(
    join(__dirname, '/kitchen-sink.graphql'),
    { encoding: 'utf8' }
  );

  it('parses kitchen sink', () => {

    expect(() => {
      try {
        parse(kitchenSink);
      } catch (e) {
        console.log(e.stack);
        throw e;
      }
    }).to.not.throw();

  });

  it('parse creates ast', () => {

    var source = new Source(`{
  node(id: 4) {
    id,
    name
  }
}
`);
    var result = parse(source);

    expect(result).to.deep.equal(
      { kind: Kind.DOCUMENT,
        loc: { start: 0, end: 41, source },
        definitions:
         [ { kind: Kind.OPERATION_DEFINITION,
             loc: { start: 0, end: 40, source },
             operation: 'query',
             name: null,
             variableDefinitions: null,
             directives: [],
             selectionSet:
              { kind: Kind.SELECTION_SET,
                loc: { start: 0, end: 40, source },
                selections:
                 [ { kind: Kind.FIELD,
                     loc: { start: 4, end: 38, source },
                     alias: null,
                     name:
                      { kind: Kind.NAME,
                        loc: { start: 4, end: 8, source },
                        value: 'node' },
                     arguments:
                      [ { kind: Kind.ARGUMENT,
                          name:
                           { kind: Kind.NAME,
                             loc: { start: 9, end: 11, source },
                             value: 'id' },
                          value:
                           { kind: Kind.INT,
                             loc: { start: 13, end: 14, source },
                             value: '4' },
                          loc: { start: 9, end: 14, source } } ],
                     directives: [],
                     selectionSet:
                      { kind: Kind.SELECTION_SET,
                        loc: { start: 16, end: 38, source },
                        selections:
                         [ { kind: Kind.FIELD,
                             loc: { start: 22, end: 24, source },
                             alias: null,
                             name:
                              { kind: Kind.NAME,
                                loc: { start: 22, end: 24, source },
                                value: 'id' },
                             arguments: [],
                             directives: [],
                             selectionSet: null },
                           { kind: Kind.FIELD,
                             loc: { start: 30, end: 34, source },
                             alias: null,
                             name:
                              { kind: Kind.NAME,
                                loc: { start: 30, end: 34, source },
                                value: 'name' },
                             arguments: [],
                             directives: [],
                             selectionSet: null } ] } } ] } } ] }
    );
  });
});
