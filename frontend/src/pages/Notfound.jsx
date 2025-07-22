import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl text-gray-800 mb-4">Oops! Page not found</h2>
      <p className="text-gray-600 mb-6 text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
