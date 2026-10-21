import { createServerFn } from "@tanstack/react-start";
import { activitySchema } from "./checkout-schema";

export const saveSiteActivity = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => activitySchema.parse(input))
  .handler(async ({ data }) => {
    const { storeSiteActivity } = await import("./site-activity.server");
    return storeSiteActivity(data);
  });