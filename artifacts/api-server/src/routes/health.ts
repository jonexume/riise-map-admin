import { Router, type IRouter } from "express";
import { healthStatus } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = healthStatus.parse({ status: "ok" });
  res.json(data);
});

export default router;
