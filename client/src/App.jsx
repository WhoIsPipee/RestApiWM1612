import { useState, useEffect } from "react";

function App() {
  // --- 1. ESTADOS GLOBALES ---
  const [activeTab, setActiveTab] = useState('residentes'); 
  const [users, setUsers] = useState([]);
  const [catalogs, setCatalogs] = useState({ deptos: [], estacionamientos: [], bodegas: [], tipos: [] });
  
  // ESTADO PARA EL BUSCADOR
  const [searchTerm, setSearchTerm] = useState(""); 

  // ESTADOS FORMULARIOS
  const [form, setForm] = useState({
    nombre: "", apellido: "", rut: "", correo: "", telefono: "", tipo_residente_id: "",
    patente: "", marca: "", color: "", deptoId: "", estId: "", bodegaId: ""
  });
  
  const [mode, setMode] = useState('create'); 
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // ESTADOS INVENTARIO
  const [assetForm, setAssetForm] = useState({ numero: "", torre: "" });
  const [assetType, setAssetType] = useState('depto'); 

  // ESTADO MODAL VEHÍCULO
  const [showCarModal, setShowCarModal] = useState(false);
  const [carForm, setCarForm] = useState({ patente: "", marca: "", color: "" });

  // --- 2. CARGA DE DATOS ---
  const fetchAllData = async () => {
    try {
      const resUsers = await fetch("http://localhost:4000/users");
      setUsers(await resUsers.json());

      const [d, e, b, t] = await Promise.all([
        fetch("http://localhost:4000/assets/departamentos/free").then(r => r.json()),
        fetch("http://localhost:4000/assets/estacionamientos/free").then(r => r.json()),
        fetch("http://localhost:4000/assets/bodegas/free").then(r => r.json()),
        fetch("http://localhost:4000/assets/tipos-residente").then(r => r.json())
      ]);
      setCatalogs({ deptos: d, estacionamientos: e, bodegas: b, tipos: t });
    } catch (error) { console.error("Error cargando datos:", error); }
  };

  useEffect(() => { fetchAllData(); }, []);

  // --- 3. LÓGICA DE FILTRADO (BUSCADOR) ---
  const filteredUsers = users.filter((user) => {
    // Convertimos todo a minúsculas para que la búsqueda no distinga mayúsculas
    const term = searchTerm.toLowerCase();
    
    // Buscamos por Nombre, Apellido o RUT
    const matchDatos = 
        user.nombre.toLowerCase().includes(term) || 
        user.apellido.toLowerCase().includes(term) || 
        user.rut.toLowerCase().includes(term);

    // También buscamos si tiene un departamento con ese número (ej: buscas "205")
    const matchDepto = user.departamentos.some(d => d.numero.toLowerCase().includes(term));

    return matchDatos || matchDepto;
  });

  // --- 4. MANEJADORES ---
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    const payload = { ...form, deptoId: form.deptoId || null, estId: form.estId || null, bodegaId: form.bodegaId || null };
    let url = "http://localhost:4000/users";
    let method = "POST";
    let body = JSON.stringify(payload);

    if (mode === 'assign') {
        url = "http://localhost:4000/assign-property";
        body = JSON.stringify({ userId: selectedUserId, deptoId: form.deptoId });
    } else if (mode === 'edit') {
        url = `http://localhost:4000/users/${selectedUserId}`;
        method = "PUT";
    }

    try {
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
        if (res.ok) {
            alert("Guardado exitoso");
            resetForm();
            fetchAllData();
        } else {
            const err = await res.json();
            alert("Error: " + err.message);
        }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar residente? Se liberarán sus propiedades y se borrarán sus autos.")) {
        await fetch(`http://localhost:4000/users/${id}`, { method: "DELETE" });
        fetchAllData();
    }
  };

  const handleCreateAsset = async (e) => {
      e.preventDefault();
      let url = "";
      let body = {};
      if (assetType === 'depto') {
          url = "http://localhost:4000/assets/departamentos";
          body = { numero: assetForm.numero, torre_id: assetForm.torre };
      } else if (assetType === 'est') {
          url = "http://localhost:4000/assets/estacionamientos";
          body = { numero: assetForm.numero };
      } else {
          url = "http://localhost:4000/assets/bodegas";
          body = { numero: assetForm.numero };
      }
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      alert("Creado correctamente en Inventario");
      setAssetForm({ numero: "", torre: "" });
      fetchAllData();
  };

  const handleAddCar = async (e) => {
      e.preventDefault();
      await fetch("http://localhost:4000/users/add-vehicle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: selectedUserId, ...carForm })
      });
      alert("Vehículo agregado");
      setShowCarModal(false);
      setCarForm({ patente: "", marca: "", color: "" });
      fetchAllData();
  };

  // --- HELPERS ---
  const startEditing = (user) => {
    setMode('edit'); setSelectedUserId(user.id);
    const vehiculo = (user.vehiculos && user.vehiculos[0]) || {};
    setForm({
      nombre: user.nombre, apellido: user.apellido, rut: user.rut, correo: user.correo, telefono: user.numero_telefono,
      tipo_residente_id: user.tipo_residente_id, 
      patente: vehiculo.patente || "", marca: vehiculo.marca || "", color: vehiculo.color || "",
      deptoId: "", estId: "", bodegaId: ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startAssigning = (user) => {
    setMode('assign'); setSelectedUserId(user.id);
    setForm({ nombre: user.nombre, apellido: user.apellido, rut:"", correo:"", telefono:"", tipo_residente_id:"", patente:"", marca:"", color:"", deptoId:"", estId:"", bodegaId:"" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setMode('create'); setSelectedUserId(null);
    setForm({ nombre: "", apellido: "", rut: "", correo: "", telefono: "", tipo_residente_id: "", patente: "", marca: "", color: "", deptoId: "", estId: "", bodegaId: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* NAVBAR */}
      <div className="bg-blue-900 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-extrabold hidden md:block">🏢 Condominio</h1>
            <div className="flex gap-2 bg-blue-800 p-1 rounded-lg">
                <button onClick={() => setActiveTab('residentes')} className={`px-6 py-2 rounded-md transition-all ${activeTab === 'residentes' ? 'bg-white text-blue-900 font-bold shadow' : 'text-blue-200 hover:text-white'}`}>👥 Residentes</button>
                <button onClick={() => setActiveTab('inventario')} className={`px-6 py-2 rounded-md transition-all ${activeTab === 'inventario' ? 'bg-white text-blue-900 font-bold shadow' : 'text-blue-200 hover:text-white'}`}>🏗️ Inventario</button>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        
        {/* ================= PESTAÑA RESIDENTES ================= */}
        {activeTab === 'residentes' && (
            <>
                {/* 1. FORMULARIO PRINCIPAL */}
                <div className={`p-6 rounded-xl shadow-lg mb-10 border transition-colors ${mode === 'assign' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-700">
                            {mode === 'create' && <span className="text-blue-600">👤 Nuevo Residente</span>}
                            {mode === 'edit' && <span className="text-orange-600">✏️ Modificar Residente</span>}
                            {mode === 'assign' && <span className="text-green-600">🔑 Asignar Propiedad a: {form.nombre}</span>}
                        </h2>
                        {mode !== 'create' && <button onClick={resetForm} className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Cancelar</button>}
                    </div>

                    <form onSubmit={handleSubmitUser} className="space-y-4">
                        {mode !== 'assign' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" className="input-style" required />
                                <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" className="input-style" required />
                                <input name="rut" value={form.rut} onChange={handleChange} placeholder="RUT" className="input-style" required />
                                <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" className="input-style" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="correo" value={form.correo} onChange={handleChange} placeholder="Correo" className="input-style" />
                                <select name="tipo_residente_id" value={form.tipo_residente_id} onChange={handleChange} className="input-style" required>
                                    <option value="">-- Tipo de Residente --</option>
                                    {catalogs.tipos.map(t => <option key={t.id} value={t.id}>{t.nombre_tipo}</option>)}
                                </select>
                            </div>
                            <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-600 mb-2">🚗 Vehículo Principal</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <input name="patente" value={form.patente} onChange={handleChange} placeholder="Patente" className="input-style" />
                                    <input name="marca" value={form.marca} onChange={handleChange} placeholder="Marca" className="input-style" />
                                    <input name="color" value={form.color} onChange={handleChange} placeholder="Color" className="input-style" />
                                </div>
                            </div>
                        </>
                        )}

                        <div className={`p-4 rounded border ${mode === 'assign' ? 'bg-white border-green-300 shadow-md' : 'bg-blue-50 border-blue-200'}`}>
                            <h3 className={`text-sm font-bold mb-2 ${mode === 'assign' ? 'text-green-600 uppercase' : 'text-blue-500'}`}>
                                {mode === 'assign' ? '👇 Seleccione la Propiedad Adicional:' : '📦 Asignar Propiedad (Inventario)'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select name="deptoId" value={form.deptoId} onChange={handleChange} className="input-style" required={mode === 'assign'}>
                                    <option value="">-- Departamento --</option>
                                    {catalogs.deptos.map(d => <option key={d.id} value={d.id}>Torre {d.torre_id} - {d.numero_departamento}</option>)}
                                </select>
                                <select name="estId" value={form.estId} onChange={handleChange} className="input-style" disabled={mode === 'assign'}> 
                                  <option value="">-- Estacionamiento --</option> 
                                  {catalogs.estacionamientos.map(e => <option key={e.id} value={e.id}>{e.numero_estacionamiento}</option>)}
                                </select>
                                <select name="bodegaId" value={form.bodegaId} onChange={handleChange} className="input-style" disabled={mode === 'assign'}>
                                  <option value="">-- Bodega --</option>
                                  {catalogs.bodegas.map(b => <option key={b.id} value={b.id}>{b.numero_bodega}</option>)}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition ${mode === 'create' ? 'bg-blue-600 hover:bg-blue-700' : mode === 'edit' ? 'bg-orange-500' : 'bg-green-600'}`}>
                            {mode === 'create' ? "✅ Guardar Residente y Auto" : mode === 'edit' ? "💾 Guardar Cambios" : "🔗 Asignar Propiedad"}
                        </button>
                    </form>
                </div>

                {/* 2. BARRA DE BÚSQUEDA */}
                <div className="mb-6 flex items-center bg-white p-3 rounded-lg shadow border border-gray-200">
                    <span className="text-2xl mr-3">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Buscar por Nombre, RUT o N° Depto..." 
                        className="w-full text-lg outline-none text-gray-700 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 3. LISTA DE TARJETAS (USAMOS filteredUsers EN LUGAR DE users) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.length === 0 && <p className="text-gray-500 text-center col-span-3 py-10">No se encontraron residentes.</p>}
                    
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition">
                            <div className="bg-slate-700 p-4 text-white">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg">{user.nombre} {user.apellido}</h3>
                                    <span className="bg-slate-900 text-xs px-2 py-1 rounded border border-slate-500">{user.nombre_tipo_residente}</span>
                                </div>
                                <p className="text-xs text-gray-300 mt-1">{user.correo}</p>
                            </div>

                            <div className="p-4 text-sm text-gray-700 flex-grow space-y-3">
                                <div className="flex justify-between border-b pb-1">
                                    <span className="text-gray-500 font-bold">RUT:</span>
                                    <span>{user.rut}</span>
                                </div>
                                
                                {/* AQUI ESTAN LOS DEPARTAMENTOS */}
                                <div>
                                    <span className="font-bold text-gray-500 block text-xs uppercase mb-1">🏙️ Departamentos:</span>
                                    {user.departamentos && user.departamentos.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {user.departamentos.map(d => (
                                                <span key={d.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-xs border border-blue-200">
                                                    Torre {d.torre} - {d.numero}
                                                </span>
                                            ))}
                                        </div>
                                    ) : <span className="text-gray-400 italic text-xs">Sin asignar</span>}
                                </div>

                                {/* AQUI AGREGAMOS ESTACIONAMIENTOS Y BODEGAS */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="font-bold text-gray-500 block text-xs uppercase mb-1">🅿️ Estacionamientos:</span>
                                        {user.estacionamientos && user.estacionamientos.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {user.estacionamientos.map(e => (
                                                    <span key={e.id} className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs border border-green-200">
                                                        N° {e.numero}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : <span className="text-gray-400 italic text-xs">-</span>}
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-500 block text-xs uppercase mb-1">📦 Bodegas:</span>
                                        {user.bodegas && user.bodegas.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {user.bodegas.map(b => (
                                                    <span key={b.id} className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded text-xs border border-orange-200">
                                                        B. {b.numero}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : <span className="text-gray-400 italic text-xs">-</span>}
                                    </div>
                                </div>

                                {/* VEHICULOS */}
                                <div>
                                    <span className="font-bold text-gray-500 block text-xs uppercase mb-1">🚗 Vehículos:</span>
                                    {user.vehiculos && user.vehiculos.length > 0 ? (
                                        <ul className="space-y-1">
                                            {user.vehiculos.map((v, i) => (
                                                <li key={i} className="text-xs bg-gray-50 p-1 rounded border border-gray-200">
                                                    <strong>{v.patente}</strong> - {v.marca} {v.color}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <span className="text-gray-400 italic text-xs">Sin vehículo</span>}
                                </div>
                            </div>

                            <div className="p-3 bg-gray-50 border-t grid grid-cols-2 gap-2 text-xs font-bold">
                                <button onClick={() => startEditing(user)} className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded">✏️ Editar</button>
                                <button onClick={() => handleDelete(user.id)} className="bg-red-500 hover:bg-red-600 text-white py-2 rounded">🗑️ Borrar</button>
                                <button onClick={() => startAssigning(user)} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded col-span-2">🏠 + Propiedad</button>
                                <button onClick={() => { setSelectedUserId(user.id); setShowCarModal(true); }} className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded col-span-2">🚗 + Auto</button>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}

        {/* ================= PESTAÑA INVENTARIO ================= */}
        {activeTab === 'inventario' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">🏗️ Inventario del Edificio</h2>
                <div className="flex gap-2 mb-6">
                    <button onClick={() => setAssetType('depto')} className={`flex-1 py-3 rounded-lg font-bold border transition ${assetType === 'depto' ? 'bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}>Departamento</button>
                    <button onClick={() => setAssetType('est')} className={`flex-1 py-3 rounded-lg font-bold border transition ${assetType === 'est' ? 'bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}>Estacionamiento</button>
                    <button onClick={() => setAssetType('bodega')} className={`flex-1 py-3 rounded-lg font-bold border transition ${assetType === 'bodega' ? 'bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}>Bodega</button>
                </div>
                <form onSubmit={handleCreateAsset} className="space-y-4">
                    <div>
                        <label className="block font-bold text-gray-600 mb-1">Número / Identificador</label>
                        <input value={assetForm.numero} onChange={e => setAssetForm({...assetForm, numero: e.target.value})} placeholder="Ej: 205 o E-15" className="input-style" required />
                    </div>
                    {assetType === 'depto' && (
                        <div>
                            <label className="block font-bold text-gray-600 mb-1">Número de Torre</label>
                            <input type="number" value={assetForm.torre} onChange={e => setAssetForm({...assetForm, torre: e.target.value})} placeholder="Ej: 1" className="input-style" required />
                        </div>
                    )}
                    <button type="submit" className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-900 transition shadow-lg">Crear Activo</button>
                </form>
            </div>
        )}

      </div>

      {/* MODAL AUTO */}
      {showCarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">🚗 Agregar Vehículo Extra</h3>
                <form onSubmit={handleAddCar} className="space-y-3">
                    <input placeholder="Patente" className="input-style" value={carForm.patente} onChange={e => setCarForm({...carForm, patente: e.target.value})} required />
                    <input placeholder="Marca" className="input-style" value={carForm.marca} onChange={e => setCarForm({...carForm, marca: e.target.value})} required />
                    <input placeholder="Color" className="input-style" value={carForm.color} onChange={e => setCarForm({...carForm, color: e.target.value})} />
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={() => setShowCarModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg font-bold text-gray-700">Cancelar</button>
                        <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold shadow">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <style>{`.input-style { width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 0.5rem; outline: none; transition: all 0.2s; } .input-style:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }`}</style>
    </div>
  );
}

export default App;