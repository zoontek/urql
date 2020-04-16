import {
  NamedTypeNode,
  NameNode,
  SelectionNode,
  SelectionSetNode,
  InlineFragmentNode,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLNonNull,
  GraphQLList,
  FieldNode,
  FragmentDefinitionNode,
  Kind,
} from 'graphql';

const SYMBOL_TO_STRING_TAG =
  typeof Symbol === 'function' ? Symbol.toStringTag : '@@toStringTag';

export type SelectionSet = ReadonlyArray<SelectionNode>;

/** Returns the name of a given node */
export const getName = (node: { name: NameNode }): string => node.name.value;

export const getFragmentTypeName = (node: FragmentDefinitionNode): string =>
  node.typeCondition.name.value;

/** Returns either the field's name or the field's alias */
export const getFieldAlias = (node: FieldNode): string =>
  node.alias ? node.alias.value : getName(node);

/** Returns the SelectionSet for a given inline or defined fragment node */
export const getSelectionSet = (node: {
  selectionSet?: SelectionSetNode;
}): SelectionSet => (node.selectionSet ? node.selectionSet.selections : []);

export const getTypeCondition = ({
  typeCondition,
}: {
  typeCondition?: NamedTypeNode;
}): string | null => (typeCondition ? getName(typeCondition) : null);

export const isFieldNode = (node: SelectionNode): node is FieldNode =>
  node.kind === Kind.FIELD;

export const isInlineFragment = (
  node: SelectionNode
): node is InlineFragmentNode => node.kind === Kind.INLINE_FRAGMENT;

function instanceOf<T>(tag: string): (x: any) => x is T {
  return (x: any): x is T => {
    return typeof x === 'object' && x && x[SYMBOL_TO_STRING_TAG] === tag;
  };
}

export const isObjectType = instanceOf<GraphQLObjectType>('GraphQLObjectType');
export const isInterfaceType = instanceOf<GraphQLInterfaceType>(
  'GraphQLInterfaceType'
);
export const isUnionType = instanceOf<GraphQLUnionType>('GraphQLUnionType');
export const isNonNullType = instanceOf<GraphQLNonNull<any>>('GraphQLNonNull');
export const isListType = instanceOf<GraphQLList<any>>('GraphQLList');
