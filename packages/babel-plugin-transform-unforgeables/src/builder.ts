import type { NodePath } from '@babel/core';
import { template as templateBuilder, types as t } from '@babel/core';
import type * as BabelTypes from '@babel/types';

import type {
    BuilderClass,
    BuilderClassConstructor,
    BuilderMeta,
    BuilderOptions,
    BuilderPluginState,
    BuilderValidator,
    Identifier,
    Replacements,
} from './types';
import { alwaysFalse } from './util';

export const Builder = class Builder {
    // eslint-disable-next-line no-underscore-dangle
    /* istanbul ignore next: currently unreachable via tests */ get _state() {
        // @ts-ignore: Property does not exist error.
        throw new Error(`Builder ${JSON.stringify(this.name)} state not set.`);
    }

    // eslint-disable-next-line no-underscore-dangle
    set _state(value: BuilderPluginState) {
        // Convert from an accessor to a data property.
        Reflect.defineProperty(this, '_state', {
            value,
            writable: true,
        });
    }

    // @ts-ignore: Prevent property has no initializer error.
    _validator: BuilderValidator;

    // @ts-ignore: Prevent property has no initializer error.
    meta: BuilderMeta;

    // Having a "create" method allows us to have a return type of `BuilderClass`
    // instead of `Builder` which is imposed by the constructor.
    static create(code: string, options: BuilderOptions) {
        return new Builder(code, options) as BuilderClass;
    }

    constructor(
        code: string,
        // istanbul ignore next: currently unreachable via tests
        { name = 'unnamed', globals = {}, validator = alwaysFalse }: BuilderOptions = {}
    ) {
        const expression = templateBuilder.expression(code);
        // Use a computed property to dynamically set the builder name without
        // using `Reflect.defineProperty()`.
        const { [name]: builder } = {
            [name]: (publicReplacements: Replacements) =>
                // We manually wrap our expression in parenthesis because
                // `templateBuilder.expression` does not create them for us.
                t.parenthesizedExpression(
                    expression(
                        // Add global placeholder replacement identifiers.
                        Object.entries(builder.meta.globals).reduce(
                            (replacements, { 0: placeholder, 1: globalName }) => {
                                replacements[placeholder] =
                                    builder.getGlobalReplacement(globalName);
                                return replacements;
                            },
                            { ...publicReplacements }
                        ) as Replacements
                    )
                ),
        } as { [key: string]: BuilderClass };
        // eslint-disable-next-line no-underscore-dangle
        builder._validator = validator;
        // Storing metadata on the builder lets us decouple logic for global
        // alias detection and unique identifier injection.
        builder.meta = { globals: { ...globals } };
        Reflect.setPrototypeOf(builder, Builder.prototype);
        // eslint-disable-next-line no-constructor-return
        return builder;
    }

    getGlobalReplacement(this: BuilderClass, globalName: string): Identifier | undefined {
        // eslint-disable-next-line no-underscore-dangle
        return this._state.getGlobalReplacement(globalName);
    }

    isGlobalReplacement(this: BuilderClass, globalName: string, idName: string): boolean {
        // eslint-disable-next-line no-underscore-dangle
        return this._state.isGlobalReplacement(globalName, idName);
    }

    isTransformed(path: NodePath<BabelTypes.Node>): boolean {
        // eslint-disable-next-line no-underscore-dangle
        return this._validator(path);
    }

    setState(state: BuilderPluginState) {
        // eslint-disable-next-line no-underscore-dangle
        this._state = state;
    }
} as BuilderClassConstructor & BuilderClass;

Reflect.setPrototypeOf(Builder.prototype, Function.prototype);
