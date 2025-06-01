export const action = async ({ request }: { request: Request }) => {
  // No customer data is stored by this app. Nothing to delete.
  return new Response("OK", { status: 200 });
};
