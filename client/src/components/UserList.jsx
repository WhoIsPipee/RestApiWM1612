import { useEffect, useState } from "react";

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar residente?")) {
      try {
        await fetch(`http://localhost:4000/users/${id}`, { method: "DELETE" });
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 inline-block">
        Residentes Registrados
      </h2>
      
      {/* GRILLA RESPONSIVA: 1 col en celular, 2 en tablet, 3 en PC */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
            
            {/* Encabezado de la Card con color */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4">
                <h3 className="text-xl font-bold text-white truncate">
                    {user.nombre} {user.apellido}
                </h3>
                <p className="text-blue-100 text-sm">{user.correo}</p>
            </div>

            {/* Cuerpo de la Card */}
            <div className="p-5 space-y-2 text-gray-600">
                <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">RUT:</span>
                    <span>{user.rut}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">Teléfono:</span>
                    <span>{user.numero_telefono}</span>
                </div>
                
                {/* Datos traídos con el JOIN (Depto y Auto) */}
                <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-gray-700">Depto:</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.numero_departamento ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.numero_departamento || "Sin Asignar"}
                    </span>
                </div>

                <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-gray-700">Vehículo:</span>
                    <span className="text-sm">
                        {user.patente_vehiculo ? `${user.marca_vehiculo} (${user.patente_vehiculo})` : "No registra"}
                    </span>
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="p-4 bg-gray-50 flex gap-3">
                <button 
                    onClick={() => handleDelete(user.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Eliminar
                </button>
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Editar
                </button>
            </div>
          </div>
        ))}

        {users.length === 0 && (
            <p className="text-gray-500 text-center col-span-full py-10">No hay residentes registrados.</p>
        )}
      </div>
    </div>
  );
}

export default UserList;