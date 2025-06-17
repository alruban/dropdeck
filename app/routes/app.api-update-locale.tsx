import { type ActionFunctionArgs, data } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!session) return data({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const locale = formData.get("locale") as string;
  if (!locale) return data({ error: "Locale is required" }, { status: 400 });

  try {
    await prisma.session.update({
      where: { id: session.id },
      data: { locale },
    });

    return data({ success: true });
  } catch (error) {
    console.error("Error updating locale:", error);
    return data({ error: "Failed to update locale" }, { status: 500 });
  }
};
