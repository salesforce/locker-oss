import type { NodePath } from '@babel/core';
import { types as t } from '@babel/core';
import type { PublicReplacements } from '@babel/template';

type BuilderFunction = (replacements: Replacements) => ReturnType<typeof t.parenthesizedExpression>;
export interface BuilderClassConstructor {
    new (code: string, options?: BuilderOptions): BuilderClass;
    create(code: string, options?: BuilderOptions): BuilderClass;
}
export interface BuilderClass extends BuilderFunction {
    meta: BuilderMeta;
    _state: BuilderPluginState;
    _validator: BuilderValidator;
    getGlobalReplacement: (name: string) => Identifier | undefined;
    isGlobalReplacement: (globalName: string, idName: string) => boolean;
    isTransformed: BuilderValidator;
    setState: (state: BuilderPluginState) => void;
}
export type BuilderMeta = {
    globals: Record<string, string>;
};
export interface BuilderOptions {
    globals?: Record<string, string>;
    name?: string;
    validator?: BuilderValidator;
}
export type BuilderPluginState = {
    getGlobalReplacement: (globalName: string) => Identifier | undefined;
    isGlobalReplacement(globalName: string, idName: string): boolean;
};
export type BuilderValidator = (path: NodePath<any>) => boolean;
export type Identifier = ReturnType<typeof t.identifier>;
export type PrivatePluginState = {
    globals: {
        injected: Set<string>;
        toIds: Map<string, Identifier[]>;
        toReplacement: Map<string, Identifier>;
    };
    getAllBindingNames: () => Set<string>;
};
export type Replacements = PublicReplacements & { [key: string]: any };
