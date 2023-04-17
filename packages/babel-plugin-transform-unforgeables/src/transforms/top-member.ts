import type { NodePath } from '@babel/core';
import type * as BabelTypes from '@babel/types';
import { partial } from 'match-json';

import { Builder } from '../builder';
import { isDoubleOrTripleEquals, isNodeEquals } from '../util';

export const topMemberTransform = () =>
    // Used to replace the pattern:
    // NODE.top
    Builder.create(
        `
            NODE === GLOBAL_THIS ? TOP : EXPRESSION
        `,
        {
            name: 'topMemberTransform',
            globals: { GLOBAL_THIS: 'globalThis', TOP: 'top' },
            validator(this: typeof Builder, path: NodePath<BabelTypes.MemberExpression>): boolean {
                const { node: memberExpr } = path;
                const { object } = memberExpr;
                const conditionalExpr = path.parent as BabelTypes.ConditionalExpression;
                const binaryEpr = conditionalExpr.test as BabelTypes.BinaryExpression;
                return (
                    // First, a light schema check.
                    partial(
                        conditionalExpr,
                        // JSON schema representing the expanded expression:
                        // NODE === GLOBAL_THIS ? TOP : NODE.top
                        {
                            type: 'ConditionalExpression',
                            alternate: (node: BabelTypes.Node) => node === memberExpr,
                            consequent: {
                                type: 'Identifier',
                                name: (name: string) => this.isGlobalReplacement('top', name),
                            },
                            test: {
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
                        }
                    ) &&
                    // Then, a deep comparison:
                    // NODE === GLOBAL_THIS ? TOP : NODE.top
                    // ^----------------------------^
                    isNodeEquals(binaryEpr.left, memberExpr.object)
                );
            },
        }
    );
