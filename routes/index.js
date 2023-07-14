var express = require("express");
var router = express.Router();
const mainController = require("../controllers/index");

const regular_handler = (params, req, res, next) => {
  return res.status(params?.code).send(params);
};

router.get("/perms", mainController.getPermissions);

router.post("/sign-in", mainController.signIn);
router.post("/sign-up", mainController.signUp);
router.post("/delete-admin", mainController.deleteAdmin);
router.post("/create-user", mainController.createUser);
router.patch("/edit-user/:id", mainController.editUser);
router.delete("/delete-user/:id", mainController.deleteUser);
router.get("/get-users", mainController.getUsers);
router.get("/download-pdf-doc", mainController.downloadPdf);

module.exports = router;
