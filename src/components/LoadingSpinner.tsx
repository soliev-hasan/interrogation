import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Загрузка...",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const borderSize = {
    sm: "border-2",
    md: "border-4",
    lg: "border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} ${borderSize[size]} border-t-blue-500 border-r-blue-500 border-b-blue-500 border-l-transparent rounded-full animate-spin`}
      ></div>
      {message && (
        <p className="mt-2 text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;