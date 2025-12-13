import { Router } from "express";
import { pool } from "../db.js";


const router = Router();

router.get("/users", async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM persona')
    res.json(rows)

});


router.get("/users/:id", async (req, res) => {
    const { id } = req.params
    const { rows } = await pool.query(`SELECT * FROM persona WHERE id = ${id}`)

    if (rows.length === 0) {
        return res.status(404).json({ message: "User not found" })
    }


    res.json(rows); //minuto 34:09
});


router.post("/users", (req, res) => {
    res.send("Create user");
});


router.delete("/users/:id", async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Inicio de transacción

        // 1. MANTENER (Desvincular) DEPARTAMENTOS
        // Quitamos la persona, el depto queda vacío pero mantiene su torre
        await client.query('UPDATE departamento SET persona_id = NULL WHERE persona_id = $1', [id]);

        // 2. MANTENER (Desvincular) BODEGAS
        await client.query('UPDATE bodega SET persona_id = NULL WHERE persona_id = $1', [id]);

        // 3. MANTENER (Desvincular) ESTACIONAMIENTOS
        await client.query('UPDATE estacionamiento SET persona_id = NULL WHERE persona_id = $1', [id]);

        // 4. ELIMINAR VEHÍCULOS
        // El auto es propiedad privada, se elimina de la base de datos
        await client.query('DELETE FROM vehiculo WHERE persona_id = $1', [id]);

        // 5. ELIMINAR PERSONA
        // Al borrar la persona, desaparece su asociación con 'tipo_residente' automáticamente
        const result = await client.query('DELETE FROM persona WHERE id = $1', [id]);

        await client.query('COMMIT'); // Guardar cambios

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({
            message: `Usuario ${id} eliminado. Vehículos eliminados. Depto, Bodega y Estacionamiento liberados.`
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Cancelar si hay error
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});


router.put("/users/:id", (req, res) => {
    const { id } = req.params
    res.send("update users" + id);
});





export default router;