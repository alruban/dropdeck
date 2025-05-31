import { type LoaderFunctionArgs } from "@remix-run/node";
import path from "path";

export async function loader({ params }: LoaderFunctionArgs) {
  const filePath = params["*"];
  if (!filePath) {
    throw new Response("File path not provided", { status: 400 });
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, "");

  // Serve files from the public/downloads directory
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/downloads/${safePath}`,
    },
  });
}
