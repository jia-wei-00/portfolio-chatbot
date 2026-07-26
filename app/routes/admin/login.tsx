import { createRoute } from "honox/factory";

// Cloudflare Access owns the login flow before the application is reached.
export default createRoute((c) => c.redirect("/admin"));
