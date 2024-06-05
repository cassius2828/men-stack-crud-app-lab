const express = require("express");

// express router
const router = express.Router();
// canvas controller export
const canvasesCtrl = require("../controllers/canvases");

///////////////////////////
// Canvas Controllers
///////////////////////////
router.get("/", canvasesCtrl.index);
router.get("/filter/:filterBy", canvasesCtrl.filter);
router.get("/new", canvasesCtrl.new);
router.post("/new", canvasesCtrl.create);
router.get("/:canvasID/edit", canvasesCtrl.showEdit);
router.put("/:canvasID/edit", canvasesCtrl.edit);
router.get("/:canvasID", canvasesCtrl.show);
router.delete("/:canvasID", canvasesCtrl.remove);


module.exports = router;
