import type { NodePath } from '@babel/core';
import type * as BabelTypes from '@babel/types';
import { partial } from 'match-json';

import { Builder } from '../builder';
import { isDoubleOrTripleEquals, isNodeEquals } from '../util';

export const locationMemberConcatTransform = () =>
    // Used to replace the pattern:
    // NODE.location += VALUE
    Builder.create(
        `
            (NODE === GLOBAL_THIS || NODE === DOCUMENT) ? LOCATION.assign(LOCATION.href + VALUE) : EXPRESSION
        `,
        {
            name: 'locationMemberConcatTransform',
            globals: { DOCUMENT: 'document', GLOBAL_THIS: 'globalThis', LOCATION: 'location' },
            validator(
                this: typeof Builder,
                path: NodePath<BabelTypes.AssignmentExpression>
            ): boolean {
                const { node: assignmentExpr } = path;
                const { object } = assignmentExpr.left as BabelTypes.MemberExpression;
                const conditionalExpr = path.parent as BabelTypes.ConditionalExpression;
                const callExpr = conditionalExpr.consequent as BabelTypes.CallExpression;
                const logicalExpr = conditionalExpr.test as BabelTypes.LogicalExpression;
                return (
                    // First, a light schema check.
                    partial(
                        conditionalExpr,
                        // JSON schema representing the expanded expression:
                        // (NODE === GLOBAL_THIS || NODE === DOCUMENT) ? LOCATION.assign(LOCATION.href + VALUE) : NODE.location += VALUE
                        {
                            type: 'ConditionalExpression',
                            alternate: (altNode: BabelTypes.Node) => altNode === assignmentExpr,
                            consequent: {
                                type: 'CallExpression',
                                arguments: (args: BabelTypes.Node[]) =>
                                    args.length === 1 &&
                                    partial(args, [
                                        {
                                            type: 'BinaryExpression',
                                            operator: '+',
                                            left: {
                                                type: 'MemberExpression',
                                                object: {
                                                    type: 'Identifier',
                                                    name: (name: string) =>
                                                        this.isGlobalReplacement('location', name),
                                                },
                                                property: {
                                                    type: 'Identifier',
                                                    name: 'href',
                                                },
                                            },
                                            right: {
                                                type: assignmentExpr.right.type,
                                            },
                                        },
                                    ]),
                                callee: {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: (name: string) =>
                                            this.isGlobalReplacement('location', name),
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'assign',
                                    },
                                },
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
                    // Then, a hopefully less deep generated comparison:
                    // (NODE === GLOBAL_THIS || NODE === DOCUMENT) ? LOCATION.assign(LOCATION.href + VALUE) : NODE.location += VALUE
                    //                                                                               ^_________________________^
                    isNodeEquals(
                        (callExpr.arguments[0] as BabelTypes.BinaryExpression).right,
                        assignmentExpr.right
                    ) &&
                    // Finally, a deep comparison:
                    // (NODE === GLOBAL_THIS || NODE === DOCUMENT) ? LOCATION.assign(LOCATION.href + VALUE) : NODE.location += VALUE
                    //  ^-----------------------^-------------------------------------------------------------^
                    isNodeEquals(
                        (logicalExpr.left as BabelTypes.BinaryExpression).left,
                        (logicalExpr.right as BabelTypes.BinaryExpression).left,
                        object
                    )
                );
            },
        }
    );
