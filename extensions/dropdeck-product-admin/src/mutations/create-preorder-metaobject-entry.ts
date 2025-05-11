export const CREATE_PREORDER_METAOBJECT_ENTRY_QUERY = `
  mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject {
        handle
        type
        fields {
          key
          value
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`; 