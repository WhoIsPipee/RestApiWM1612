import { Router } from "express";

const router = Router();

router.get("/users", (req, res) => {
    res.send("Get all users");
});


router.get("/users/:id", (req, res) => {
    const { id } = req.params
    res.send("Get user" + id);
});


router.post("/users", (req, res) => {
    res.send("Create user");
});


router.delete("/users/:id", (req, res) => {
    const { id } = req.params
    res.send("delete users" + id);
});


router.put("/users/:id", (req, res) => {
    const { id } = req.params
    res.send("update users" + id);
});





export default router;