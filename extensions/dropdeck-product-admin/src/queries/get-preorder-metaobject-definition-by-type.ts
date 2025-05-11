export const PREORDER_METAOBJECT_DEFINITION_BY_TYPE_QUERY = `
  query($type: String!) {
    metaobjectDefinitionByType(type: $type) {
      type
    }
  }
`; 