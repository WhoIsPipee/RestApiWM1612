INSERT INTO persona (
    rut, 
    nombre, 
    apellido, 
    genero, 
    numero_telefono, 
    correo, 
    tipo_residente_id
) 
VALUES (
    '15.555.666-7',       -- rut
    'Carlos',             -- nombre
    'Santana',            -- apellido
    'Masculino',          -- genero
    '987654321',          -- numero_telefono
    'carlos@email.com',   -- correo
    1                     -- tipo_residente_id (Debe existir en la otra tabla)
);