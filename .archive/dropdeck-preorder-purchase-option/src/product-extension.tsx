import {reactExtension} from '@shopify/ui-extensions-react/admin';
import PurchaseOptionsActionExtension from './purchase-options-extension-action';

export default reactExtension('admin.product-purchase-option.action.render', async () => (
  <PurchaseOptionsActionExtension
    extension="admin.product-purchase-option.action.render"
    context="product"
  />
));