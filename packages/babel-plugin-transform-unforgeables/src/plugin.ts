import type { NodePath, types as BabelTypes } from '@babel/core';

import { initState } from './state';
import { locationAssignTransform } from './transforms/location-assign';
import { locationConcatTransform } from './transforms/location-concat';
import { locationMemberTransform } from './transforms/location-member';
import { locationMemberAssignTransform } from './transforms/location-member-assign';
import { locationMemberConcatTransform } from './transforms/location-member-concat';
import { topMemberTransform } from './transforms/top-member';
import {
    isAssignOrConcat,
    isGlobalIdentifier,
    isLeftOfAssignment,
    isLocationIdentifier,
    isLocationProperty,
    isTopProperty,
    isWithinUpdateExpression,
} from './util';

export function transformUnforgeables() {
    const locationAssignTransformBuilder = locationAssignTransform();
    const locationConcatTransformBuilder = locationConcatTransform();
    const locationMemberTransformBuilder = locationMemberTransform();
    const locationMemberAssignTransformBuilder = locationMemberAssignTransform();
    const locationMemberConcatTransformBuilder = locationMemberConcatTransform();
    const topMemberTransformBuilder = topMemberTransform();
    return {
        name: 'babel-plugin-transform-unforgeables',
        visitor: {
            // Program() { ... } is shorthand for Program: { enter() { ... } }
            // and is visited first.
            Program(path: NodePath<BabelTypes.Program>) {
                initState(path.scope, [
                    locationAssignTransformBuilder,
                    locationConcatTransformBuilder,
                    locationMemberTransformBuilder,
                    locationMemberAssignTransformBuilder,
                    locationMemberConcatTransformBuilder,
                    topMemberTransformBuilder,
                ]);
            },
            Identifier(path: NodePath<BabelTypes.Node>) {
                // Only transform `location = value` and `location += value`.
                if (
                    isLocationIdentifier(path) &&
                    isLeftOfAssignment(path) &&
                    isGlobalIdentifier(path)
                ) {
                    const parent = path.parent as BabelTypes.AssignmentExpression;
                    const { operator } = parent;
                    if (isAssignOrConcat(operator)) {
                        const builder =
                            operator === '='
                                ? locationAssignTransformBuilder
                                : locationConcatTransformBuilder;
                        const parentPath = path.parentPath!;
                        // Both transform variations have the same placeholder
                        // replacements.
                        parentPath.replaceWith(builder({ VALUE: parent.right }));
                        parentPath.skip();
                    }
                }
            },
            // MemberExpression() { ... } visits children before parents, e.g.
            // `document.defaultView.top` before `document.defaultView`.
            MemberExpression(path: NodePath<BabelTypes.MemberExpression>) {
                const { node } = path;
                if (isLocationProperty(path)) {
                    const objectPath = path.get('object');
                    // Skip transforming location in members like `window.top.location`
                    // letting the transform to `window.top` carry it.
                    if (isTopProperty(objectPath)) {
                        return;
                    }
                    const alternatePath = objectPath.isConditionalExpression()
                        ? objectPath.get('alternate')
                        : undefined;
                    // Skip re-transforming location in members like
                    // `(window === GLOBAL_THIS ? TOP : window.top).location`.
                    if (
                        alternatePath &&
                        isTopProperty(alternatePath) &&
                        topMemberTransformBuilder.isTransformed(alternatePath)
                    ) {
                        return;
                    }
                    if (isLeftOfAssignment(path)) {
                        const parent = path.parent as BabelTypes.AssignmentExpression;
                        const { operator } = parent;
                        // Only transform `NODE.location = value` and `NODE.location += value`.
                        if (isAssignOrConcat(operator)) {
                            const builder =
                                operator === '='
                                    ? locationMemberAssignTransformBuilder
                                    : locationMemberConcatTransformBuilder;
                            const { parentPath } = path;
                            // Skip re-transforming location.
                            if (!builder.isTransformed(parentPath)) {
                                // Both transform variations have the same
                                // placeholder replacements.
                                parentPath.replaceWith(
                                    builder({
                                        EXPRESSION: parent,
                                        NODE: node.object,
                                        VALUE: parent.right,
                                    })
                                );
                                parentPath.skip();
                            }
                        }
                    } else if (
                        // Skip transforming `++NODE.location` and `NODE.location++`.
                        !isWithinUpdateExpression(path) &&
                        // Skip re-transforming location.
                        !locationMemberTransformBuilder.isTransformed(path)
                    ) {
                        path.replaceWith(
                            locationMemberTransformBuilder({
                                EXPRESSION: node,
                                NODE: node.object,
                            })
                        );
                        path.skip();
                    }
                } else if (
                    isTopProperty(path) &&
                    // Unlike location, we skip transforming assignments to
                    // top because it's essentially a no-op.
                    !isLeftOfAssignment(path) &&
                    // Skip transforming `++NODE.top` and `NODE.top++`.
                    !isWithinUpdateExpression(path)
                ) {
                    let currPath;
                    let nextPath = path;
                    do {
                        currPath = nextPath;
                        currPath.skip();
                        // Walk into nested top member expressions like
                        // window.top.top -> window.top -> window
                        nextPath = currPath.get('object') as NodePath<any>;
                    } while (isTopProperty(nextPath));
                    // Skip re-transforming top.
                    if (!topMemberTransformBuilder.isTransformed(path)) {
                        path.replaceWith(
                            topMemberTransformBuilder({
                                EXPRESSION: node,
                                NODE: currPath.node.object,
                            })
                        );
                        path.skip();
                    }
                }
            },
        },
    };
}
