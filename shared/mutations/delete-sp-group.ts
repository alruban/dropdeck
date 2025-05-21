type DeleteSPGroupResponse = {
  data: {
    sellingPlanGroupDelete: {
      deletedSellingPlanGroupId: string;
      userErrors: [];
    };
  };
  extensions: {
    cost: {
      requestedQueryCost: 10;
      actualQueryCost: 10;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
};

const DELETE_SP_GROUP_MUTATION = `#graphql
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

const deleteSPGroupVariables = (sellingPlanGroupId: string) => ({
  variables: {
    id: sellingPlanGroupId,
  },
});

export { DELETE_SP_GROUP_MUTATION, deleteSPGroupVariables };
