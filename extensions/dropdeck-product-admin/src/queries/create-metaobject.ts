export const CREATE_METAOBJECT_QUERY = `
  mutation CreateMetaobject($type: String!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectCreate(type: $type, fields: $fields) {
      metaobject {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;