import {
  BlockStack,
  Text,
  Button,
  useApi
} from '@shopify/ui-extensions-react/admin';
import { TARGET } from '../target';
import { gqlFetch } from '../tools/gql-fetch';
import { CREATE_METAOBJECT_QUERY } from '../queries/create-metaobject';

export default function CreatePreorder() {
  const { data } = useApi(TARGET);
  const productId = data.selected?.[0]?.id;

  const createPreorderMetaobject = async () => {
    gqlFetch({
      query: CREATE_METAOBJECT_QUERY,
      variables: {
        productId: productId,
      },
    }, (data) => {
      console.log(data);
    });
  };

  return (
    <BlockStack>
      <Text>Create a preorder to start selling your product</Text>

      <Button
        variant="primary"
        onClick={createPreorderMetaobject}
      >
        Create preorder
      </Button>
    </BlockStack>
  );
}