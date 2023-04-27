import type { NodePath, types as BabelTypes } from '@babel/core';
import { types as t } from '@babel/core';
import type { Binding, Scope } from '@babel/traverse';

import type { BuilderClass, BuilderPluginState, Identifier, PrivatePluginState } from './types';
import { generateUid, getAllBindingNames as _getAllBindingNames } from './util';

function collectGlobalAliases({ bindings }: Scope, { globals: { toIds } }: PrivatePluginState) {
    // Scan top-level bindings for possible global alias assignments to allow
    // for our builder's replacement values.
    const bindingNames = Object.keys(bindings);
    for (let i = 0, { length } = bindingNames; i < length; i += 1) {
        const {
            identifier: id,
            path: {
                node: { init: initNode },
            },
        } = bindings[bindingNames[i]] as Binding & {
            path: NodePath<BabelTypes.VariableDeclarator>;
        };
        if (t.isIdentifier(initNode)) {
            const { name } = initNode;
            const ids = toIds.get(name);
            // istanbul ignore else: currently unreachable via tests
            if (ids) {
                const shadowIndex = bindingNames.indexOf(name);
                const shadowPos =
                    shadowIndex === -1
                        ? Infinity
                        : bindings[bindingNames[shadowIndex]].identifier.start!;
                // Treat as a global alias if it is not shadowed by an earlier
                // top-level identifier.
                if (id.start! < shadowPos) {
                    ids.push(id);
                }
            }
        }
    }
}

function createBuilderPluginState(
    programScope: Scope,
    { globals: { injected, toIds, toReplacement } }: PrivatePluginState
): BuilderPluginState {
    // The builder plugin state is limited to methods that interact with the
    // private plugin state without exposing raw data to builders.
    return {
        getGlobalReplacement(globalName: string): Identifier | undefined {
            const id = toReplacement.get(globalName);
            // istanbul ignore else: currently unreachable via tests
            if (id) {
                const { name: idName } = id;
                if (idName !== globalName && !injected.has(idName)) {
                    // Lazily inject on retrieval of replacement value to inject
                    // only when needed.
                    injected.add(idName);
                    programScope.push({
                        id,
                        init: t.identifier(globalName),
                    });
                }
            }
            return id;
        },
        isGlobalReplacement(globalName: string, idName: string): boolean {
            // Perform the quick check first.
            if (idName === globalName) {
                return true;
            }
            const ids = toIds.get(globalName);
            return ids
                ? // Iterate over identifiers for a match.
                  ids.some(({ name }) => name === idName)
                : /* istanbul ignore next: currently unreachable via tests */ false;
        },
    };
}

function resolveGlobalReplacements(
    { meta: { globals: fromPlaceholder } }: BuilderClass,
    { getAllBindingNames, globals: { toIds, toReplacement } }: PrivatePluginState
) {
    Object.values(fromPlaceholder).forEach((globalName) => {
        let ids = toIds.get(globalName);
        if (ids === undefined) {
            ids = [t.identifier(globalName)];
            toIds.set(globalName, ids);
        }
        let id = toReplacement.get(globalName);
        if (id) {
            return;
        }
        const uid = generateUid(getAllBindingNames(), globalName);
        if (globalName === uid) {
            // Use the default identifier at index 0.
            id = ids[0];
        } else {
            id = t.identifier(uid);
            // Replace the default identifier at index 0.
            ids[0] = id;
        }
        toReplacement.set(globalName, id);
    });
}

export function initState(programScope: Scope, builders: BuilderClass[]) {
    let allBindingNames: Set<string> | undefined;
    const privateState = {
        globals: {
            injected: new Set(),
            toIds: new Map(),
            toReplacement: new Map(),
        },
        getAllBindingNames(): Set<string> {
            if (allBindingNames === undefined) {
                allBindingNames = _getAllBindingNames(programScope);
            }
            return allBindingNames;
        },
    } as PrivatePluginState;
    for (let i = 0, { length } = builders; i < length; i += 1) {
        const builder = builders[i];
        builder.setState(createBuilderPluginState(programScope, privateState));
        resolveGlobalReplacements(builder, privateState);
    }
    collectGlobalAliases(programScope, privateState);
}
