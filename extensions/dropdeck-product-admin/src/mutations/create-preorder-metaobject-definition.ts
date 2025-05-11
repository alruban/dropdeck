export const PREORDER_METAOBJECT_DEFINITION_CREATE_MUTATION = `
  mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition {
        name
        type
        fieldDefinitions {
          name
          key
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

export const PREORDER_METAOBJECT_DEFINITION_CREATE_VARIABLES = {
  definition: {
    name: "Dropdeck Preorder",
    type: "dropdeck_preorder",
    fieldDefinitions: [
      {
        name: "Release Date",
        key: "release_date",
        type: "date"
      },
      {
        name: "Units Available",
        key: "units_available",
        type: "number_integer"
      }
    ]
  }
}