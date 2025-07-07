import React from "react";

interface SpinnerProps {
  message?: string;
  size?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message = "Loading...", size = "w-12 h-12" }) => (
  <div className="flex flex-col justify-center items-center py-8">
    <div className={`${size} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}></div>
    {message && <p className="mt-4 text-gray-600">{message}</p>}
  </div>
);

export default Spinner;
