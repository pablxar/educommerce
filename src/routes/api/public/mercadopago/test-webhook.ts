import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/mercadopago/test-webhook")({
  server: { handlers: {
    POST: async ({ request }) => {
      const { receiveMercadoPagoTestWebhook } = await import("@/lib/mercadopago-test-webhook.server");
      return receiveMercadoPagoTestWebhook(request);
    },
  } },
});