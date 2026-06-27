import { useNavigate } from "react-router-dom";

export default function RoleSelector() {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    localStorage.setItem("role", role);
    if (role === "hr_admin") {
      navigate("/admin");
    } else if (role === "manager") {
      navigate("/manager");
    } else {
      navigate("/chat");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          HR Platform
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Select your role to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-4">
          <button
            onClick={() => handleRoleSelect("employee")}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Enter as Employee
          </button>
          
          <button
            onClick={() => handleRoleSelect("manager")}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Enter as Manager
          </button>
          
          <button
            onClick={() => handleRoleSelect("hr_admin")}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Enter as HR Manager
          </button>
        </div>
      </div>
    </div>
  );
}
