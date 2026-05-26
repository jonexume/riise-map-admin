import { Router, type IRouter } from "express";
import healthRouter from "./health";
import learnersRouter from "./learner";
import programsRouter from "./program";
import pathwaysRouter from "./pathway";
import fundingSourcesRouter from "./funding-sources";

const router: IRouter = Router();

router.use(healthRouter);
router.use(learnersRouter);
router.use(programsRouter);
router.use(pathwaysRouter);
router.use(fundingSourcesRouter);

export default router;