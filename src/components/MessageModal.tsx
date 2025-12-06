import React, { useEffect } from "react";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: "✓",
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          borderColor: "border-green-500",
          titleColor: "text-green-800",
          buttonBg: "bg-green-600 hover:bg-green-700",
        };
      case "error":
        return {
          icon: "✕",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          borderColor: "border-red-500",
          titleColor: "text-red-800",
          buttonBg: "bg-red-600 hover:bg-red-700",
        };
      default:
        return {
          icon: "ℹ",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          borderColor: "border-blue-500",
          titleColor: "text-blue-800",
          buttonBg: "bg-blue-600 hover:bg-blue-700",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-md bg-white rounded-xl shadow-2xl transform transition-all duration-300 animate-slideUp border-t-4 ${styles.borderColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1"
          aria-label="Закрыть"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with icon */}
        <div className="flex items-start p-6 pb-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mr-4`}
          >
            <span className={`text-2xl font-bold ${styles.iconColor}`}>
              {styles.icon}
            </span>
          </div>
          <div className="flex-1 pt-1">
            <h2
              className={`text-xl sm:text-2xl font-bold ${styles.titleColor} pr-8`}
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full py-3 px-6 ${styles.buttonBg} text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.borderColor.replace('border-', 'focus:ring-')}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
