/Users/batman/Downloads/ReplitExport-JonExume/Riise-Map-Admin/artifacts/api-server/src/routes/index.ts
import { Router, type IRouter } from "express";
import healthRouter from "./health";
import learnersRouter from "./learners";
import programsRouter from "./programs";
import pathwaysRouter from "./pathways";
import fundingSourcesRouter from "./funding-sources";

const router: IRouter = Router();

router.use(healthRouter);
router.use(learnersRouter);
router.use(programsRouter);
router.use(pathwaysRouter);
router.use(fundingSourcesRouter);

export default router;