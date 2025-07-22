import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
const Spinner = () => {
  const [count, setCount] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    setInterval(() => {
      setCount((currentCount) => currentCount - 1);
    }, 1000);
    if (count < 0) {
      navigate("/login");
    }
    return () => clearInterval();
  }, [count, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Spinner Animation */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 border-8 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-700">
          Redirecting in {count} seconds...
        </p>
      </div>

      {/* Redirect Message */}
      <div className="mt-4 text-center text-xl text-gray-700">
        <p>Please wait while we redirect you...</p>
      </div>
    </div>
  );
};

export default Spinner;
