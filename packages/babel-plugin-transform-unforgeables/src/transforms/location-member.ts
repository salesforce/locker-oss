import type { NodePath, types as BabelTypes } from '@babel/core';
import { partial } from 'match-json';

import { Builder } from '../builder';
import { isDoubleOrTripleEquals, isNodeEquals } from '../util';

export const locationMemberTransform = () =>
    // Used to replace the pattern:
    // NODE.location
    Builder.create(
        `
            (NODE === GLOBAL_THIS || NODE === DOCUMENT) ? LOCATION : EXPRESSION_OBJECT.EXPRESSION_PROPERTY
        `,
        {
            name: 'locationMemberTransform',
            globals: { DOCUMENT: 'document', GLOBAL_THIS: 'globalThis', LOCATION: 'location' },
            validator(this: typeof Builder, path: NodePath<BabelTypes.MemberExpression>): boolean {
                const { node: memberExpr } = path;
                const { object } = memberExpr;
                const conditionalExpr = path.parent as BabelTypes.ConditionalExpression;
                const logicalExpr = conditionalExpr.test as BabelTypes.LogicalExpression;
                return (
                    // First, a light schema check.
                    partial(
                        conditionalExpr,
                        // JSON schema representing the expanded expression:
                        // (NODE === GLOBAL_THIS || NODE === DOCUMENT) ? LOCATION : NODE.location
                        {
                            type: 'ConditionalExpression',
                            alternate: (node: BabelTypes.Node) => node === memberExpr,
                            consequent: {
                                type: 'Identifier',
                                name: (name: string) => this.isGlobalReplacement('location', name),
                            },
                            test: {
                                type: 'LogicalExpression',
                                operator: '||',
                                left: {
                                    type: 'BinaryExpression',
                                    operator: isDoubleOrTripleEquals,
                                    left: {
                                        type: object.type,
                                    },
                                    right: {
                                        type: 'Identifier',
                                        name: (name: string) =>
                                            this.isGlobalReplacement('globalThis', name),
                                    },
                                },
                                right: {
                                    type: 'BinaryExpression',
                                    operator: isDoubleOrTripleEquals,
                                    left: {
                                        type: object.type,
                                    },
                                    right: {
                                        type: 'Identifier',
                                        name: (name: string) =>
                                            this.isGlobalReplacement('document', name),
                                    },
                                },
                            },
                        }
                    ) &&
                    // Then, a deep comparison:
                    // (NODE === GLOBAL_THIS || NODE === DOCUMENT) ? LOCATION : NODE.location
                    //  ^-----------------------^-------------------------------^
                    isNodeEquals(
                        (logicalExpr.left as BabelTypes.BinaryExpression).left,
                        (logicalExpr.right as BabelTypes.BinaryExpression).left,
                        object
                    )
                );
            },
        }
    );
