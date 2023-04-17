import type { NodePath } from '@babel/core';
import type * as BabelTypesNamespace from '@babel/types';
export declare function topLocationTransform(): {
    visitor: {
        MemberExpression(path: NodePath<BabelTypesNamespace.MemberExpression>): void;
        AssignmentExpression(path: NodePath<BabelTypesNamespace.AssignmentExpression>): void;
    };
};
//# sourceMappingURL=index.d.ts.map