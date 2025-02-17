import express from "express";
import {routerResource} from "../resource/resource.route";


const router = express.Router();

router.use("/resources", routerResource);


export default router;
