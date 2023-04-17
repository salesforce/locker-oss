import type { NodePath, Visitor } from '@babel/core';
import { types as t } from '@babel/core';
// Import `CodeGenerator` alias instead of the default `generate` export for
// interoperability with the .mjs distribution build.
import { CodeGenerator } from '@babel/generator';
import type { Scope } from '@babel/traverse';
import type * as BabelTypes from '@babel/types';

const BABEL_GENERATE_OPTIONS = {
    comments: false,
    compact: true,
    sourceMaps: false,
};

// Based on the pseudo private `_generateUid` from '@babel/traverse':
// https://github.com/babel/babel/blob/v7.21.2/packages/babel-traverse/src/scope/index.ts
// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
function _generateUid(name: string, i: number): string {
    let id = name;
    if (i > 1) {
        id += i;
    }
    return `_${id}`;
}

function generateCode(ast: BabelTypes.Node): string {
    // This lets us deeply compare nodes in a way that ignores extraneous properties,
    // like location and other metadata. This method is performance HEAVY so we
    // try to call it last AFTER performing lighter checks first.
    // @ts-ignore: '@babel/generator' expects a different instance of '@babel/types' Node.
    const gen = new CodeGenerator(ast, BABEL_GENERATE_OPTIONS);
    return gen.generate().code;
}

// istanbul ignore next: currently unreachable via tests
function isNonArrowFunction(path: NodePath<any>): boolean {
    return path.isFunction() && !path.isArrowFunctionExpression();
}

function isUpdateExpression(path: NodePath<any>): boolean {
    return path.isUpdateExpression();
}

function stripUid(name: string): string {
    // This method follows Babel's style of decoration removal.
    // https://github.com/babel/babel/blob/v7.21.2/packages/babel-traverse/src/scope/index.ts#L496-L498
    return name.replace(/^_+/, '').replace(/[0-9]+$/g, '');
}

// istanbul ignore next: currently unreachable via tests
export function alwaysFalse() {
    return false;
}

export function generateUid(cache: Set<string>, name: string): string {
    // This gives our generated unique identifiers the look and feel of those
    // created with Babel's `Scope#generateUid` while letting us use our own
    // backing cache.
    const baseName = stripUid(t.toIdentifier(name));
    let uid = baseName;
    let i = 1;
    while (cache.has(uid)) {
        uid = _generateUid(baseName, i);
        i += 1;
    }
    return uid;
}

export function getAllBindingNames(programScope: Scope): Set<string> {
    // Collect ALL bindings from ALL scopes. This is our simple approach to
    // avoiding variable conflicts when generating unique identifiers.
    const allNames = new Set<string>(Object.keys(programScope.bindings));
    programScope.traverse(programScope.path.node, {
        Scope({ scope: { bindings } }: NodePath<BabelTypes.Node>) {
            const names = Object.keys(bindings);
            for (let i = 0, { length } = names; i < length; i += 1) {
                allNames.add(names[i]);
            }
        },
    } as Visitor);
    return allNames;
}

export function isAssignOrConcat(operator: string): boolean {
    return operator === '=' || operator === '+=';
}

export function isDoubleOrTripleEquals(operator: string): boolean {
    // Minifiers may convert `===` to `==`.
    return operator === '===' || operator === '==';
}

export function isGlobalIdentifier(path: NodePath<BabelTypes.Node>): boolean {
    return (
        path.isIdentifier() &&
        // Globals are not bindings in any scope.
        // Passing `true` for `noGlobals` avoids lookups in `Scope.globals`
        // and `Scope.contextVariables` arrays to only match actual bindings
        // created in a scope.
        !path.scope.hasBinding(path.node.name, /* noGlobals */ true) &&
        // Perform an extra check for an identifier named 'arguments' to ensure
        // it doesn't belong to a function.
        (path.node.name !== 'arguments' ||
            /* istanbul ignore next: currently unreachable via tests */ !path.findParent(
                isNonArrowFunction
            ))
    );
}

export function isNodeEquals(...args: BabelTypes.Node[]): boolean {
    const { length } = args;
    let prev: string | undefined;
    for (let i = 0; i < length; i += 1) {
        if (prev === undefined) {
            prev = generateCode(args[i]);
        } else if (generateCode(args[i]) !== prev) {
            return false;
        }
    }
    return length > 0;
}

export function isLeftOfAssignment(path: NodePath<BabelTypes.Node>): boolean {
    return (
        !!path.parentPath &&
        path.parentPath.isAssignmentExpression() &&
        (path.parent as BabelTypes.AssignmentExpression).left === path.node
    );
}

export function isLocation(path: NodePath<BabelTypes.Node>): boolean {
    const subpath = path.isMemberExpression()
        ? (path.get('property') as NodePath<BabelTypes.Node>)
        : path;
    return subpath.isIdentifier({ name: 'location' });
}

export function isTop(path: NodePath<BabelTypes.Node>): boolean {
    const subpath = path.isMemberExpression()
        ? (path.get('property') as NodePath<BabelTypes.Node>)
        : /* istanbul ignore next: currently unreachable via tests */ path;
    return subpath.isIdentifier({ name: 'top' });
}

export function isWithinUpdateExpression(path: NodePath<any>): boolean {
    return path.findParent(isUpdateExpression) !== null;
}
