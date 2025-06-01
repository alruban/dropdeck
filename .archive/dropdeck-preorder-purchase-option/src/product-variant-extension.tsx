import {reactExtension} from '@shopify/ui-extensions-react/admin';
import PurchaseOptionsActionExtension from './purchase-options-extension-action';

export default reactExtension('admin.product-variant-purchase-option.action.render', () => (
  <PurchaseOptionsActionExtension
    extension="admin.product-variant-purchase-option.action.render"
    context="product-variant"
  />
));