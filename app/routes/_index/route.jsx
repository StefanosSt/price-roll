import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function Index() {
  const { showForm } = useLoaderData();

  return (
    <div>
      {showForm && (
        <Form method="post" action="/auth/login">
          <label>
            <span>Shop domain</span>
            <input type="text" name="shop" />
            <span>e.g: my-shop-domain.myshopify.com</span>
          </label>
          <button type="submit">Log in</button>
        </Form>
      )}
    </div>
  );
}
