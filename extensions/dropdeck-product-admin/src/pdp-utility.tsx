import {
  reactExtension,
  AdminBlock,
  useApi
} from '@shopify/ui-extensions-react/admin';
import { useState } from 'react';
import SetPreorder from './components/set-preorder';
import CreatePreorder from './components/create-preorder';
import { TARGET } from './target';

export const isDevelopment = process.env.NODE_ENV === "development";
export default reactExtension(TARGET, () => <App />);

function App() {
  // States
  const [isPreorderCreated, setIsPreorderCreated] = useState(false);

  return (
    <AdminBlock title="Dropdeck">
      {!isPreorderCreated && <CreatePreorder />}
      {isPreorderCreated && <SetPreorder />}
    </AdminBlock>
  );
}