export const PREORDER_METAOBJECT_ENTRY_BY_HANDLE_QUERY = `
  query($handle: MetaobjectHandleInput!) {
    metaobjectByHandle(handle: $handle) {
      handle
      types
    }
  }
`; 