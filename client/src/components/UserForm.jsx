import { useState, useEffect } from "react";

function UserForm() {
  // 1. ESTADOS
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    telefono: "",
    tipo_residente_id: "",
    deptoId: "",
    estId: "",
    bodegaId: ""
  });

  // 2. LISTAS
  const [deptos, setDeptos] = useState([]);
  const [estacionamientos, setEstacionamientos] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [tipos, setTipos] = useState([]);

  // 3. CARGA INICIAL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resDeptos, resEst, resBod, resTipos] = await Promise.all([
          fetch("http://localhost:4000/assets/departamentos/free"),
          fetch("http://localhost:4000/assets/estacionamientos/free"),
          fetch("http://localhost:4000/assets/bodegas/free"),
          fetch("http://localhost:4000/assets/tipos-residente")
        ]);

        setDeptos(await resDeptos.json());
        setEstacionamientos(await resEst.json());
        setBodegas(await resBod.json());
        setTipos(await resTipos.json());
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  // 4. MANEJADOR
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 5. ENVIAR
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSend = {
        ...formData,
        deptoId: formData.deptoId || null,
        estId: formData.estId || null,
        bodegaId: formData.bodegaId || null
    };

    try {
      const response = await fetch("http://localhost:4000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        alert("¡Usuario creado exitosamente!");
        window.location.reload(); 
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xl border border-gray-100">
      <div className="border-b pb-4 mb-6">
        <h3 className="text-2xl font-bold text-gray-800 text-center">
          📝 Registrar Nuevo Residente
        </h3>
        <p className="text-center text-gray-500 text-sm mt-1">
          Complete la información personal y asigne las propiedades.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* GRUPO 1: Datos Personales (Nombre y Apellido juntos) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              name="nombre" 
              placeholder="Ej: Juan" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              name="apellido" 
              placeholder="Ej: Pérez" 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        {/* GRUPO 2: RUT y Correo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
            <input 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              name="rut" 
              placeholder="12.345.678-9" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              name="correo" 
              type="email" 
              placeholder="nombre@ejemplo.com" 
              onChange={handleChange} 
            />
          </div>
        </div>

        {/* GRUPO 3: Tipo de Residente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Residente</label>
          <select 
            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
            name="tipo_residente_id" 
            onChange={handleChange} 
            required
          >
            <option value="">-- Seleccione una opción --</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre_tipo}</option>
            ))}
          </select>
        </div>

        {/* SEPARADOR VISUAL */}
        <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Asignación de Propiedades</h4>
            
            {/* GRUPO 4: Propiedades (3 columnas) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Departamento */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Departamento</label>
                    <select 
                        className="w-full p-2 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" 
                        name="deptoId" 
                        onChange={handleChange}
                    >
                        <option value="">-- Ninguno --</option>
                        {deptos.map((d) => (
                        <option key={d.id} value={d.id}>Torre {d.torre_id} - {d.numero_departamento}</option>
                        ))}
                    </select>
                </div>

                {/* Estacionamiento */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Estacionamiento</label>
                    <select 
                        className="w-full p-2 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" 
                        name="estId" 
                        onChange={handleChange}
                    >
                        <option value="">-- Ninguno --</option>
                        {estacionamientos.map((e) => (
                        <option key={e.id} value={e.id}>N° {e.numero_estacionamiento}</option>
                        ))}
                    </select>
                </div>

                {/* Bodega */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Bodega</label>
                    <select 
                        className="w-full p-2 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" 
                        name="bodegaId" 
                        onChange={handleChange}
                    >
                        <option value="">-- Ninguno --</option>
                        {bodegas.map((b) => (
                        <option key={b.id} value={b.id}>Bodega {b.numero_bodega}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 active:scale-95 mt-6"
        >
          💾 Guardar Residente
        </button>
      </form>
    </div>
  );
}

export default UserForm;