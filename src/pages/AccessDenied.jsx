import { Lock } from "lucide-react";

const AccessDenied = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-50 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center border border-red-100">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-4 rounded-full">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-red-700 mb-2">403 - Access Denied</h1>
        <p className="text-gray-600 mb-4">
          You do not have permission to access this page.
        </p>
        <a
          href="/"
          className="inline-block mt-4 px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default AccessDenied;
