import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import orders from "./orders.tsx";
import challans from "./challans.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-155272a3/health", (c) => {
  return c.json({ status: "ok" });
});

// KV store endpoints
app.get("/make-server-155272a3/kv", async (c) => {
  try {
    const key = c.req.query("key");
    if (!key) {
      return c.json({ error: "Key is required" }, 400);
    }
    const value = await kv.get(key);
    return c.json({ value });
  } catch (error) {
    console.error("Error in GET /kv:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-155272a3/kv", async (c) => {
  try {
    const body = await c.req.json();
    const { key, value } = body;
    if (!key) {
      return c.json({ error: "Key is required" }, 400);
    }
    await kv.set(key, value);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error in POST /kv:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete("/make-server-155272a3/kv", async (c) => {
  try {
    const key = c.req.query("key");
    if (!key) {
      return c.json({ error: "Key is required" }, 400);
    }
    await kv.del(key);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /kv:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Mount orders routes
app.route("/make-server-155272a3/orders", orders);

// Mount challans routes
app.route("/make-server-155272a3/challans", challans);

Deno.serve(app.fetch);