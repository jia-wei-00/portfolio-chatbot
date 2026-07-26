import { Hono } from "hono";
import { IAuthMiddleware } from "@/types/middlewares/auth";

const whatsapp = new Hono<IAuthMiddleware>();

whatsapp.get("/email", (c) => {
  const { jwtClaims } = c.var.supabaseContext;
  return c.json({ email: jwtClaims?.email });
});

export default whatsapp;
