const DELETE_SP_GROUP_MUTATION = `
  #graphql
  mutation sellingPlanGroupDelete($id: ID!) {
    sellingPlanGroupDelete(id: $id) {
      deletedSellingPlanGroupId
      userErrors {
        field
        message
      }
    }
  }
`;

const deleteSPGroupVariables = (
  sellingPlanGroupId: string,
) => ({
  id: sellingPlanGroupId,
});

export { DELETE_SP_GROUP_MUTATION, deleteSPGroupVariables };