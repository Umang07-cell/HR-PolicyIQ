interface WelcomeBannerProps { name: string; role: string; department?: string; }

export const WelcomeBanner = ({ name, role, department }: WelcomeBannerProps) => (
  <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 shadow-lg shadow-blue-600/20">
    <p className="text-blue-200 text-sm font-medium mb-1">{role.replace("_", " ")} Dashboard</p>
    <h1 className="text-2xl font-bold text-white">Welcome back, {name.split(" ")[0]}</h1>
    {department && <p className="text-blue-300 text-sm mt-1">{department}</p>}
  </div>
);
