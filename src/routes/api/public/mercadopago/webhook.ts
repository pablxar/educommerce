import { createFileRoute } from "@tanstack/react-router";

// Mercado Pago notifications. We never trust the body: the payment is re-fetched
// from Mercado Pago with our private token before any order is updated.
export const Route = createFileRoute("/api/public/mercadopago/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        let body: { type?: string; action?: string; data?: { id?: string | number } } = {};
        try { body = await request.json(); } catch { /* query-only notification */ }
        const type = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
        const id = String(body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
        if (type === "payment" && /^\d{1,20}$/.test(id)) {
          const { handlePaymentNotification } = await import("@/lib/checkout.server");
          await handlePaymentNotification(id);
        }
        return new Response("ok");
      },
    },
  },
});
