import { useState, useRef, useEffect, useCallback } from "react";
import * as api from "./services/api";
import MessageModal from "./components/MessageModal";

// Add this interface for interrogation data
interface InterrogationData {
  id: string;
  title: string;
  date: string;
  suspect: string;
  officer: string;
  transcript: string;
  audioUrl?: string;
  audioFilePath?: string;
  wordDocumentPath?: string;
}

function App() {
  const [user, setUser] = useState<{
    _id: string;
    username: string;
    role: string;
  } | null>(null);
  const [activeView, setActiveView] = useState<
    "login" | "dashboard" | "interrogations" | "record" | "profile" | "admin"
  >("login");
  const [loading, setLoading] = useState(true);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });
  const [interrogationsRefreshKey, setInterrogationsRefreshKey] = useState(0);

  // Handle custom events for showing messages
  useEffect(() => {
    const handleMessageEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { title, message, type } = customEvent.detail;
      setMessageModal({
        isOpen: true,
        title,
        message,
        type,
      });
    };

    window.addEventListener("showMessage", handleMessageEvent);
    return () => {
      window.removeEventListener("showMessage", handleMessageEvent);
    };
  }, []);

  const closeMessageModal = () => {
    setMessageModal({
      ...messageModal,
      isOpen: false,
    });
  };

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Validate token by fetching user profile
          const profile = await api.authAPI.getProfile(token);
          setUser(profile);
          setActiveView("dashboard");
        }
      } catch (error) {
        console.error("Ошибка проверки сессии:", error);
        // If token is invalid, remove it
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Listen for refreshInterrogations event
  useEffect(() => {
    const handleRefreshInterrogations = () => {
      setInterrogationsRefreshKey((prev) => prev + 1);
    };

    window.addEventListener(
      "refreshInterrogations",
      handleRefreshInterrogations
    );
    return () => {
      window.removeEventListener(
        "refreshInterrogations",
        handleRefreshInterrogations
      );
    };
  }, []);

  // Listen for navigateToRecord event
  useEffect(() => {
    const handleNavigateToRecord = () => {
      setActiveView("record");
    };

    document.addEventListener("navigateToRecord", handleNavigateToRecord);
    return () => {
      document.removeEventListener("navigateToRecord", handleNavigateToRecord);
    };
  }, []);

  // Login function using API
  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await api.authAPI.login(username, password);
      localStorage.setItem("token", response.token);
      setUser(response.user);
      setActiveView("dashboard");
    } catch (error) {
      console.error("Ошибка входа:", error);
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка входа",
            message: "Пожалуйста, проверьте свои учетные данные.",
            type: "error",
          },
        })
      );
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setActiveView("login");
  };

  // Show loading state while checking session
  if (loading) {
    return <div className="text-center py-8 text-gray-600">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen">
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={closeMessageModal}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />

      {!user ? (
        <AuthForm type="login" onLogin={handleLogin} onSwitch={() => {}} />
      ) : (
        <div className="flex flex-col min-h-screen">
          <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  Система ведения допросов
                </h1>
                <nav className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setActiveView("dashboard")}
                    className="px-3 py-2 text-sm sm:text-base text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors"
                  >
                    Панель управления
                  </button>
                  <button
                    onClick={() => setActiveView("interrogations")}
                    className="px-3 py-2 text-sm sm:text-base text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors"
                  >
                    Допросы
                  </button>
                  <button
                    onClick={() => setActiveView("record")}
                    className="px-3 py-2 text-sm sm:text-base text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors"
                  >
                    Запись
                  </button>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => setActiveView("admin")}
                      className="px-3 py-2 text-sm sm:text-base text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors"
                    >
                      Админ
                    </button>
                  )}
                  <button
                    onClick={() => setActiveView("profile")}
                    className="px-3 py-2 text-sm sm:text-base text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors"
                  >
                    Профиль
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm sm:text-base text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors"
                  >
                    Выйти
                  </button>
                </nav>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {activeView === "dashboard" && <Dashboard />}
            {activeView === "interrogations" && (
              <InterrogationsList refreshKey={interrogationsRefreshKey} />
            )}
            {activeView === "record" && <RecordInterrogation />}
            {activeView === "profile" && <UserProfile user={user!} />}
            {activeView === "admin" && user?.role === "admin" && (
              <AdminDashboard />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

interface AuthFormProps {
  type: "login";
  onLogin: (username: string, password: string) => void;
  onSwitch: () => void;
}

function AuthForm({ type, onLogin, onSwitch }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <form
        className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-center mb-6 text-2xl font-semibold text-gray-800">
          Вход в систему
        </h2>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block mb-2 font-medium text-gray-700"
          >
            Имя пользователя:
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block mb-2 font-medium text-gray-700"
          >
            Пароль:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
        >
          Войти
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-center mb-8 text-2xl sm:text-3xl font-semibold text-gray-800">
        Панель управления следователя
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-gray-600 mb-2 text-sm sm:text-base">
            Всего допросов
          </h3>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-gray-600 mb-2 text-sm sm:text-base">
            В этом месяце
          </h3>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-gray-600 mb-2 text-sm sm:text-base">
            На рассмотрении
          </h3>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600">2</p>
        </div>
      </div>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-center font-medium"
            onClick={() => {
              // Navigate to the record view
              window.location.hash = "#record";
              document.dispatchEvent(new CustomEvent("navigateToRecord"));
            }}
          >
            Начать новый допрос
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-center font-medium">
            Просмотреть последние
          </button>
        </div>
      </div>
    </div>
  );
}

function InterrogationsList({ refreshKey }: { refreshKey?: number }) {
  const [interrogations, setInterrogations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingInterrogation, setViewingInterrogation] =
    useState<InterrogationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInterrogations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found");
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Ошибка аутентификации",
              message: "Требуется вход в систему",
              type: "error",
            },
          })
        );
        return;
      }

      const data = await api.interrogationAPI.getAll(token);

      // Map _id to id for consistency
      const mappedData = data.map((item: any) => {
        // Create a new object with id field and all other properties
        const newItem = {
          ...item,
          id: item._id,
        };
        return newItem;
      });

      // Sort by date descending (newest first)
      const sortedData = mappedData.sort((a: any, b: any) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      });

      setInterrogations(sortedData);
    } catch (error) {
      console.error("Ошибка при получении допросов:", error);
      setError("Failed to load interrogations");

      // We'll handle this in the parent component
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка",
            message:
              "Не удалось загрузить допросы: " + (error as Error).message,
            type: "error",
          },
        })
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterrogations();
  }, [fetchInterrogations, refreshKey]);

  const handleViewInterrogation = async (interrogationId: string) => {
    // Debugging: log the ID being passed
    //("Attempting to view interrogation with ID:", interrogationId);

    // Check if ID is valid
    if (!interrogationId) {
      console.error("Invalid interrogation ID:", interrogationId);
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка",
            message: "Неверный ID допроса",
            type: "error",
          },
        })
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const data = await api.interrogationAPI.getById(interrogationId, token);
      //("Interrogation data fetched:", data);
      //("Interrogation data type:", typeof data);
      //("Interrogation data keys:", Object.keys(data));

      // Check if data has _id or id field and ensure it's properly mapped
      const id = data._id || data.id || interrogationId;

      // Ensure the returned data has the correct id field
      const mappedData = {
        ...data,
        id: id,
      };

      setViewingInterrogation(mappedData);
    } catch (error) {
      console.error("Ошибка при получении допроса:", error);
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка",
            message: "Не удалось загрузить допрос",
            type: "error",
          },
        })
      );
    }
  };

  const closeViewInterrogation = () => {
    setViewingInterrogation(null);
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600">Загрузка допросов...</div>
    );
  }

  // If viewing an interrogation, show the view component
  if (viewingInterrogation) {
    return (
      <ViewInterrogation
        interrogation={viewingInterrogation}
        onClose={closeViewInterrogation}
      />
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Допросы
        </h2>
        <div className="flex gap-2 items-center">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm sm:text-base"
            onClick={() => {
              // Navigate to the record view
              window.location.hash = "#record";
              document.dispatchEvent(new CustomEvent("navigateToRecord"));
            }}
          >
            + Новый допрос
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-lg sm:text-xl"
            onClick={fetchInterrogations}
            title="Обновить список"
          >
            ↻
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Ошибка: {error}
        </div>
      )}

      {interrogations.length === 0 ? (
        <div className="text-center py-8 text-gray-500 italic">
          Нет доступных допросов
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="hidden sm:grid sm:grid-cols-5 bg-gray-100 p-4 font-bold text-gray-700">
              <div>Название</div>
              <div>Дата</div>
              <div>Подозреваемый</div>
              <div>Следователь</div>
              <div>Действия</div>
            </div>
            {interrogations.map((interrogation) => (
              <div
                key={interrogation.id}
                className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-0 p-4 border-b border-gray-200 last:border-b-0 sm:items-center"
              >
                <div className="sm:contents">
                  <span className="sm:hidden font-bold text-gray-600">
                    Название:{" "}
                  </span>
                  <div className="break-words">{interrogation.title}</div>
                </div>
                <div className="sm:contents">
                  <span className="sm:hidden font-bold text-gray-600">
                    Дата:{" "}
                  </span>
                  <div>
                    {interrogation.date
                      ? new Date(interrogation.date).toLocaleDateString("ru-RU")
                      : "Нет даты"}
                  </div>
                </div>
                <div className="sm:contents">
                  <span className="sm:hidden font-bold text-gray-600">
                    Подозреваемый:{" "}
                  </span>
                  <div>{interrogation.suspect || "Не указан"}</div>
                </div>
                <div className="sm:contents">
                  <span className="sm:hidden font-bold text-gray-600">
                    Следователь:{" "}
                  </span>
                  <div>{interrogation.officer || "Не указан"}</div>
                </div>
                <div className="sm:contents">
                  <span className="sm:hidden font-bold text-gray-600">
                    Действия:{" "}
                  </span>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    onClick={() => handleViewInterrogation(interrogation.id)}
                  >
                    Просмотр
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Add this new component for viewing interrogation details
function ViewInterrogation({
  interrogation,
  onClose,
}: {
  interrogation: InterrogationData;
  onClose: () => void;
}) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(false);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  // Manual refetch function
  const refetchInterrogation = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingAudio(true);
      const data = await api.interrogationAPI.getById(interrogation.id, token);

      // Try to extract audio file path from refetched data
      let audioFilePath =
        (data as any).audioFilePath ||
        (data as any).audio_file_path ||
        (data as any).filePath ||
        (data as any).audioFile ||
        (data as any).file_path;

      // Also check if it might be nested in another object
      if (!audioFilePath && (data as any).audio) {
        audioFilePath =
          (data as any).audio.filePath ||
          (data as any).audio.audioFilePath ||
          (data as any).audio.path;
      }

      if (audioFilePath) {
        // Make sure the path starts with /
        if (!audioFilePath.startsWith("/")) {
          audioFilePath = "/" + audioFilePath;
        }

        // Construct the full URL for the audio file
        // If the path already includes the full URL, use it directly
        let fullAudioUrl = audioFilePath;
        if (audioFilePath && !audioFilePath.startsWith("http")) {
          // Ensure the path starts with /
          let formattedPath = audioFilePath;
          if (!formattedPath.startsWith("/")) {
            formattedPath = "/" + formattedPath;
          }
          fullAudioUrl = `http://localhost:3000${formattedPath}`;
        }
        setAudioUrl(fullAudioUrl);
      } else {
        setAudioUrl(null);
      }
    } catch (error) {
      console.error("Error refetching interrogation:", error);
    } finally {
      setLoadingAudio(false);
    }
  };

  // Load audio if available
  useEffect(() => {
    // Check if interrogation is a valid object
    if (!interrogation || typeof interrogation !== "object") {
      setAudioUrl(null);
      return;
    }

    // Log all properties of the interrogation object
    const keys = Object.keys(interrogation);

    // Log all values

    // Try to find the audio file path in a more comprehensive way
    const findAudioFilePath = (obj: any): string | null => {
      // Direct properties
      if (obj.audioFilePath) return obj.audioFilePath;
      if (obj.audio_file_path) return obj.audio_file_path;
      if (obj.filePath) return obj.filePath;
      if (obj.audioFile) return obj.audioFile;
      if (obj.file_path) return obj.file_path;

      // Nested properties
      if (obj.audio && typeof obj.audio === "object") {
        if (obj.audio.audioFilePath) return obj.audio.audioFilePath;
        if (obj.audio.filePath) return obj.audio.filePath;
        if (obj.audio.path) return obj.audio.path;
      }

      // Check for any property that looks like an audio file path
      for (const key in obj) {
        if (typeof obj[key] === "string" && obj[key].includes("uploads")) {
          return obj[key];
        }
      }

      return null;
    };

    const loadAudio = async () => {
      const audioFilePath = findAudioFilePath(interrogation);

      // If we found an audio file path, make sure it's properly formatted
      if (audioFilePath) {
        try {
          setLoadingAudio(true);

          // Make sure the path starts with /
          let formattedPath = audioFilePath;
          if (!formattedPath.startsWith("/")) {
            formattedPath = "/" + formattedPath;
          }

          // Construct the full URL for the audio file
          // If the path already includes the full URL, use it directly
          let fullAudioUrl = formattedPath;
          if (formattedPath && !formattedPath.startsWith("http")) {
            // Ensure the path starts with /
            if (!formattedPath.startsWith("/")) {
              formattedPath = "/" + formattedPath;
            }
            fullAudioUrl = `http://localhost:3000${formattedPath}`;
          }
          setAudioUrl(fullAudioUrl);
        } catch (error) {
          console.error("Error loading audio:", error);
        } finally {
          setLoadingAudio(false);
        }
      } else {
        // Explicitly set audioUrl to null if no audio file path is found
        setAudioUrl(null);
      }
    };

    loadAudio();
  }, [JSON.stringify(interrogation)]); // Use JSON.stringify to detect deep changes

  const handleDownloadWord = async () => {
    try {
      setLoadingDocument(true);

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Ошибка авторизации",
              message: "Вы должны войти в систему, чтобы скачать документ",
              type: "error",
            },
          })
        );
        return;
      }

      // Generate document on the backend
      const documentResult = await api.documentAPI.generate(
        interrogation.id,
        token
      );

      // Download the document
      const downloadResult = await api.documentAPI.download(
        documentResult.filename
      );

      // Create download link
      const link = document.createElement("a");
      link.href = downloadResult.url;
      link.download = `Допрос_${interrogation.title.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Успех",
            message: "Документ успешно скачан!",
            type: "success",
          },
        })
      );
    } catch (error) {
      console.error("Ошибка скачивания документа:", error);
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка",
            message: "Не удалось скачать документ",
            type: "error",
          },
        })
      );
    } finally {
      setLoadingDocument(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Просмотр допроса
        </h2>
        <button
          className="text-2xl text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row mb-4 pb-4 border-b border-gray-100">
          <label className="font-bold text-gray-600 w-full sm:w-40 mb-2 sm:mb-0">
            Название:
          </label>
          <div className="flex-1 sm:pl-4">{interrogation.title}</div>
        </div>

        <div className="flex flex-col sm:flex-row mb-4 pb-4 border-b border-gray-100">
          <label className="font-bold text-gray-600 w-full sm:w-40 mb-2 sm:mb-0">
            Дата:
          </label>
          <div className="flex-1 sm:pl-4">{formatDate(interrogation.date)}</div>
        </div>

        <div className="flex flex-col sm:flex-row mb-4 pb-4 border-b border-gray-100">
          <label className="font-bold text-gray-600 w-full sm:w-40 mb-2 sm:mb-0">
            Подозреваемый:
          </label>
          <div className="flex-1 sm:pl-4">{interrogation.suspect}</div>
        </div>

        <div className="flex flex-col sm:flex-row mb-4 pb-4 border-b border-gray-100">
          <label className="font-bold text-gray-600 w-full sm:w-40 mb-2 sm:mb-0">
            Следователь:
          </label>
          <div className="flex-1 sm:pl-4">{interrogation.officer}</div>
        </div>

        <div className="flex flex-col sm:flex-row mb-4 pb-4 border-b border-gray-100">
          <label className="font-bold text-gray-600 w-full sm:w-40 mb-2 sm:mb-0">
            Расшифровка речи:
          </label>
          <div className="flex-1 sm:pl-4 whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200">
            {interrogation.transcript || "Нет расшифровки"}
          </div>
        </div>

        <div className="mt-6 p-4 sm:p-6 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Аудиозапись</h3>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              onClick={refetchInterrogation}
              title="Обновить аудио"
            >
              ↻
            </button>
          </div>
          {loadingAudio ? (
            <div className="text-center py-4 text-gray-600">
              Загрузка аудио...
            </div>
          ) : audioUrl ? (
            <div>
              <audio controls src={audioUrl} className="w-full mb-2" />
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                onClick={() => {
                  const audioElement = document.querySelector(
                    "audio"
                  ) as HTMLAudioElement;
                  if (audioElement) {
                    audioElement.play();
                  }
                }}
              >
                Воспроизвести
              </button>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 italic">
              Аудиозапись отсутствует
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleDownloadWord}
          disabled={loadingDocument}
        >
          {loadingDocument ? "Скачивание..." : "Скачать Word"}
        </button>
        <button
          className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  audioUrl: string | null;
  recordingTime: number;
}

function RecordInterrogation() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    mediaRecorder: null,
    audioChunks: [],
    audioUrl: null,
    recordingTime: 0,
  });

  const recognitionRef = useRef<any>(null);

  const timerIntervalRef = useRef<any>(null);

  const [interrogationData, setInterrogationData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    suspect: "",
    officer: "",
    transcript: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Add state for language selection
  const [transcriptionLanguage, setTranscriptionLanguage] = useState<
    "ru" | "tg"
  >("ru");

  const handleTestFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create FormData for the transcription request
      const formData = new FormData();
      formData.append("audio", file);

      // Send request to our backend which will proxy to Python service
      // Get token from localStorage
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3000/api/audio/transcribe",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();

        // Update the transcript in the textarea
        setInterrogationData((prev) => ({
          ...prev,
          transcript: result.transcription || prev.transcript,
        }));

        // Show success message
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Транскрипция завершена",
              message: `Аудио успешно транскрибировано. Язык: ${
                transcriptionLanguage == "tg" ? "Таджикский" : "Русский"
              }`,
              type: "success",
            },
          })
        );
      } else {
        throw new Error("Transcription failed");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка транскрипции",
            message: "Не удалось транскрибировать аудио",
            type: "error",
          },
        })
      );
    }
  };

  const startRecording = async () => {
    try {
      // Clear any existing speech recognition reference
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping existing speech recognition:", e);
        }
        recognitionRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Check what MIME types are supported by the browser
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Create blob with the correct MIME type
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);

        setRecordingState((prev) => ({
          ...prev,
          audioChunks,
          audioUrl,
        }));

        // Automatically transcribe the audio when recording stops
        if (audioChunks.length > 0) {
          try {
            // Create a File object with the correct extension based on MIME type
            const extension = mimeType.includes("webm") ? ".webm" : ".ogg";
            const audioFile = new File([audioBlob], `recording${extension}`, {
              type: mimeType,
            });

            // Create FormData for the transcription request
            const formData = new FormData();
            formData.append("audio", audioFile);
            // For Tajik language, we don't need to set max_length as the Python service handles None correctly
            // For Russian language, we also don't need to set max_length

            // For both languages, send request to our backend which will proxy to Python service
            // Get token from localStorage
            const token = localStorage.getItem("token");

            if (transcriptionLanguage === "ru") return;

            const response = await fetch(
              "http://localhost:3000/api/audio/transcribe",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              }
            );
            if (response.ok) {
              const result = await response.json();

              // Update the transcript in the textarea
              setInterrogationData((prev) => ({
                ...prev,
                transcript: result.transcription || prev.transcript,
              }));

              // Show success message
              window.dispatchEvent(
                new CustomEvent("showMessage", {
                  detail: {
                    title: "Транскрипция завершена",
                    message: `Аудио успешно транскрибировано. Язык: ${
                      transcriptionLanguage == "tg" ? "Таджикский" : "Русский"
                    }`,
                    type: "success",
                  },
                })
              );
            } else {
              const errorText = await response.text();
              console.error("Transcription service error:", errorText);
              throw new Error(`Transcription failed: ${errorText}`);
            }
          } catch (error) {
            console.error("Transcription error:", error);
            window.dispatchEvent(
              new CustomEvent("showMessage", {
                detail: {
                  title: "Ошибка транскрипции",
                  message: "Не удалось транскрибировать аудио",
                  type: "error",
                },
              })
            );
          }
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      };

      mediaRecorder.start();

      // Start timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      timerIntervalRef.current = setInterval(() => {
        setRecordingState((prev) => ({
          ...prev,
          recordingTime: prev.recordingTime + 1,
        }));
      }, 1000);

      // Start speech recognition if available and language is Russian
      // For Tajik language, we don't use real-time speech recognition
      if (transcriptionLanguage === "ru") {
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          // Set language to Russian
          recognition.lang = "ru-RU";

          // Add settings to improve recognition
          recognition.maxAlternatives = 1;
          recognition.interimResults = true;

          recognition.onresult = (event: any) => {
            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript + " ";
              } else {
                interimTranscript += transcript;
              }
            }

            // Update the transcript in the input field
            if (finalTranscript || interimTranscript) {
              setInterrogationData((prev) => ({
                ...prev,
                transcript: prev.transcript + finalTranscript,
              }));
            }
          };

          recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error, event);
            // Show error to user
            // window.dispatchEvent(
            //   new CustomEvent("showMessage", {
            //     detail: {
            //       title: "Ошибка распознавания речи",
            //       message: `Ошибка: ${event.error}. Распознавание будет перезапущено.`,
            //       type: "error",
            //     },
            //   })
            // );

            // Only restart if we're still recording and the error isn't due to manual stop
            if (
              recordingState.isRecording &&
              event.error !== "no-speech" &&
              event.error !== "aborted" &&
              event.error !== "not-allowed"
            ) {
              setTimeout(() => {
                // Double-check that we're still recording
                if (recordingState.isRecording) {
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.start();
                    } catch (e) {
                      console.error("Failed to restart speech recognition:", e);
                      window.dispatchEvent(
                        new CustomEvent("showMessage", {
                          detail: {
                            title: "Ошибка",
                            message:
                              "Не удалось перезапустить распознавание речи",
                            type: "error",
                          },
                        })
                      );
                    }
                  }
                }
              }, 300);
            }
          };

          recognition.onend = () => {
            // Automatically restart speech recognition if still recording
            // But only if we haven't manually stopped it
            if (recordingState.isRecording) {
              setTimeout(() => {
                // Double-check that we're still recording
                if (recordingState.isRecording) {
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.start();
                    } catch (e) {
                      console.error("Failed to restart speech recognition:", e);
                      window.dispatchEvent(
                        new CustomEvent("showMessage", {
                          detail: {
                            title: "Ошибка",
                            message:
                              "Не удалось перезапустить распознавание речи",
                            type: "error",
                          },
                        })
                      );
                    }
                  }
                }
              }, 300);
            }
          };

          recognition.onstart = () => {
            // Show a subtle notification that speech recognition is working
            window.dispatchEvent(
              new CustomEvent("showMessage", {
                detail: {
                  title: "Распознавание речи",
                  message:
                    "Распознавание речи активно. Говорите, чтобы начать запись.",
                  type: "info",
                },
              })
            );
          };

          recognition.start();
          recognitionRef.current = recognition;
        } else {
          console.warn("Web Speech API is not supported in this browser");
          window.dispatchEvent(
            new CustomEvent("showMessage", {
              detail: {
                title: "Предупреждение",
                message:
                  "Web Speech API не поддерживается в этом браузере. Расшифровка речи недоступна.",
                type: "info",
              },
            })
          );
        }
      } else {
        // For Tajik language, we'll rely on backend transcription only
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Язык таджикский",
              message: "Расшифровка будет выполнена после остановки записи.",
              type: "info",
            },
          })
        );
      }

      setRecordingState({
        isRecording: true,
        isPaused: false,
        mediaRecorder,
        audioChunks: [],
        audioUrl: null,
        recordingTime: 0,
      });

      // Add periodic health check for speech recognition
      const healthCheckInterval = setInterval(() => {
        if (recordingState.isRecording) {
          // If we have a speech recognition reference but it's not running, try to restart it
          if (recognitionRef.current) {
            // Note: There's no direct way to check if SpeechRecognition is actively listening
            // So we'll just log that the health check is running
          } else if (transcriptionLanguage === "ru") {
            // Only recreate speech recognition for Russian language
            const SpeechRecognition =
              (window as any).SpeechRecognition ||
              (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
              // If we lost the reference but should have speech recognition, try to recreate it

              try {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                // Set language to Russian
                recognition.lang = "ru-RU";
                recognition.maxAlternatives = 1;

                // Reattach event handlers
                recognition.onresult = (event: any) => {
                  let interimTranscript = "";
                  let finalTranscript = "";

                  for (
                    let i = event.resultIndex;
                    i < event.results.length;
                    i++
                  ) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                      finalTranscript += transcript + " ";
                    } else {
                      interimTranscript += transcript;
                    }
                  }

                  if (finalTranscript || interimTranscript) {
                    setInterrogationData((prev) => ({
                      ...prev,
                      transcript: prev.transcript + finalTranscript,
                    }));
                  }
                };

                recognition.onerror = (event: any) => {
                  console.error(
                    "Speech recognition error (from recreated):",
                    event.error,
                    event
                  );
                };

                recognition.start();
                recognitionRef.current = recognition;
              } catch (e) {
                console.error("Failed to recreate speech recognition:", e);
              }
            }
          }
        }
      }, 10000); // Check every 10 seconds

      // Store the health check interval so we can clear it later
      (window as any).speechHealthCheckInterval = healthCheckInterval;
    } catch (error) {
      console.error("Ошибка доступа к микрофону:", error);
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка доступа к микрофону",
            message:
              "Не удалось получить доступ к микрофону. Пожалуйста, проверьте разрешения.",
            type: "error",
          },
        })
      );
    }
  };

  const stopRecording = () => {
    if (recordingState.mediaRecorder && recordingState.isRecording) {
      recordingState.mediaRecorder.stop();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Clear speech health check interval if it exists
      if ((window as any).speechHealthCheckInterval) {
        clearInterval((window as any).speechHealthCheckInterval);
        (window as any).speechHealthCheckInterval = null;
      }

      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping speech recognition:", e);
        }
        recognitionRef.current = null;
      }

      setRecordingState((prev) => ({
        ...prev,
        isRecording: false,
        isPaused: false,
      }));

      // Show success message
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Запись остановлена",
            message: "Запись успешно остановлена",
            type: "success",
          },
        })
      );
    }
  };

  const pauseRecording = () => {
    if (
      recordingState.mediaRecorder &&
      recordingState.isRecording &&
      !recordingState.isPaused
    ) {
      recordingState.mediaRecorder.pause();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Pause speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error pausing speech recognition:", e);
        }
      }

      setRecordingState((prev) => ({
        ...prev,
        isPaused: true,
      }));

      // Show success message
    }
  };

  const resumeRecording = () => {
    if (
      recordingState.mediaRecorder &&
      recordingState.isRecording &&
      recordingState.isPaused
    ) {
      recordingState.mediaRecorder.resume();
      timerIntervalRef.current = setInterval(() => {
        setRecordingState((prev) => ({
          ...prev,
          recordingTime: prev.recordingTime + 1,
        }));
      }, 1000);

      // Resume speech recognition if language is Russian
      if (transcriptionLanguage === "ru") {
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "ru-RU";

            recognition.onresult = (event: any) => {
              let interimTranscript = "";
              let finalTranscript = "";

              for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                  finalTranscript += transcript + " ";
                } else {
                  interimTranscript += transcript;
                }
              }

              setInterrogationData((prev) => ({
                ...prev,
                transcript: prev.transcript + finalTranscript,
              }));
            };

            recognition.onerror = (event: any) => {
              console.error("Speech recognition error:", event.error);
            };

            recognition.onend = () => {
              // Restart recognition if still recording
              if (recordingState.isRecording && !recordingState.isPaused) {
                try {
                  recognition.start();
                } catch (e) {
                  console.error("Error restarting speech recognition:", e);
                }
              }
            };

            recognition.start();
            recognitionRef.current = recognition;
          } catch (error) {
            console.error("Error initializing speech recognition:", error);
          }
        }
      }

      setRecordingState((prev) => ({
        ...prev,
        isPaused: false,
      }));

      // Show success message
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePreviewDocument = async () => {
    try {
      // Validate required fields before generating document
      if (!interrogationData.title.trim()) {
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Ошибка валидации",
              message: "Пожалуйста, введите название допроса",
              type: "error",
            },
          })
        );
        return;
      }

      if (!interrogationData.suspect.trim()) {
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Ошибка валидации",
              message: "Пожалуйста, введите имя подозреваемого",
              type: "error",
            },
          })
        );
        return;
      }

      if (!interrogationData.officer.trim()) {
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Ошибка валидации",
              message: "Пожалуйста, введите имя следователя",
              type: "error",
            },
          })
        );
        return;
      }

      // Create a temporary interrogation object for document generation
      const tempInterrogationData = {
        ...interrogationData,
        transcript: interrogationData.transcript,
      };

      // In a real implementation, you would send this data to the backend to generate
      // a temporary document. For now, we'll simulate the process.

      // Show a message that the document is being generated
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Генерация документа",
            message: "Документ создается... Это может занять несколько секунд.",
            type: "info",
          },
        })
      );

      // Simulate document generation delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a Blob with the document content
      const docContent = `
Допрос №: Временный
Название: ${tempInterrogationData.title}
Дата: ${tempInterrogationData.date}
Подозреваемый: ${tempInterrogationData.suspect}
Следователь: ${tempInterrogationData.officer}

Расшифровка речи:
${tempInterrogationData.transcript}
      `;

      const blob = new Blob([docContent], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `Допрос_${tempInterrogationData.title.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Успех",
            message: "Документ успешно создан и скачан!",
            type: "success",
          },
        })
      );
    } catch (error) {
      console.error("Ошибка создания документа:", error);
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка",
            message: "Не удалось создать документ",
            type: "error",
          },
        })
      );
    }
  };

  const handleSave = async () => {
    if (!interrogationData.title.trim()) {
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка",
            message: "Введите название допроса",
            type: "error",
          },
        })
      );
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Create the interrogation first

      const interrogationResponse = await api.interrogationAPI.create(
        {
          title: interrogationData.title,
          date: interrogationData.date,
          suspect: interrogationData.suspect,
          officer: interrogationData.officer,
          transcript: interrogationData.transcript, // Use the transcript from the frontend
        },
        token
      );

      // Validate that we received a proper response with an ID
      if (!interrogationResponse || !interrogationResponse.id) {
        throw new Error(
          "Failed to create interrogation or missing ID in response"
        );
      }

      // If we have audio, transcribe it and then upload it
      let transcript = interrogationData.transcript;
      let audioFilePath = "";
      if (recordingState.audioChunks.length > 0 && interrogationResponse.id) {
        const audioBlob = new Blob(recordingState.audioChunks, {
          type: "audio/wav",
        });
        const audioFile = new File(
          [audioBlob],
          `interrogation-${interrogationResponse.id}.wav`,
          { type: "audio/wav" }
        );

        // Transcribe the audio using our new Python service
        try {
          const transcriptionResponse = await api.audioAPI.transcribe(
            audioFile,
            "ru-RU"
          );
          transcript = transcriptionResponse.transcription || transcript;
        } catch (transcriptionError) {
          // If transcription fails, we'll use the manual transcript from the frontend
        }

        // Validate that we have a valid interrogation ID before uploading audio
        if (!interrogationResponse || !interrogationResponse.id) {
          throw new Error(
            "Invalid interrogation response or missing ID for audio upload"
          );
        }

        const audioResponse = await api.audioAPI.upload(
          interrogationResponse.id,
          audioFile,
          transcript, // Pass the actual transcript (either transcribed or manual)
          token
        );

        // Extract transcript and audio file path from response
        transcript =
          audioResponse.transcript || audioResponse.transcription || transcript;
        audioFilePath =
          audioResponse.filePath ||
          audioResponse.audioFilePath ||
          audioResponse.path ||
          "";

        // Use the updated interrogation from the audio response if available
        if (audioResponse.interrogation) {
          // We don't need to make a separate update call since the audio upload already updated the interrogation
        } else {
          // Update the interrogation with the transcript and audio file path
          const updateResponse = await api.interrogationAPI.update(
            interrogationResponse.id,
            { transcript, audioFilePath },
            token
          );
        }
      }

      // Generate Word document
      // Validate that we have a valid interrogation ID before generating document
      if (!interrogationResponse || !interrogationResponse.id) {
        throw new Error("Invalid interrogation response or missing ID");
      }

      const wordResponse = await api.documentAPI.generate(
        interrogationResponse.id,
        token
      );

      // Update the interrogation with the Word document path
      // Validate that we have a valid interrogation ID and document path
      if (!interrogationResponse || !interrogationResponse.id) {
        throw new Error("Invalid interrogation response or missing ID");
      }

      if (!wordResponse) {
        throw new Error("Document generation failed - no response received");
      }

      if (!wordResponse.documentPath) {
        throw new Error(
          "Document generation failed - missing document path in response"
        );
      }

      await api.interrogationAPI.update(
        interrogationResponse.id,
        { wordDocumentPath: wordResponse.documentPath },
        token
      );

      // Reset form
      setInterrogationData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        suspect: "",
        officer: "",
        transcript: "",
      });

      // Stop recording if it's still active
      if (recordingState.isRecording) {
        stopRecording();
      }

      // Refresh interrogations list
      // fetchInterrogations();

      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Успех",
            message: "Допрос успешно сохранен",
            type: "success",
          },
        })
      );
    } catch (error) {
      console.error("Ошибка при сохранении допроса:", error);
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка",
            message: "Не удалось сохранить допрос",
            type: "error",
          },
        })
      );
    } finally {
      setIsSaving(false);
    }
  };

  const restartSpeechRecognition = () => {
    // Only allow restart for Russian language
    if (transcriptionLanguage !== "ru") {
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Перезапуск невозможен",
            message:
              "Перезапуск распознавания речи доступен только для русского языка",
            type: "info",
          },
        })
      );
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка",
            message: "Web Speech API не поддерживается в этом браузере",
            type: "error",
          },
        })
      );
      return;
    }

    if (!recordingState.isRecording) {
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка",
            message: "Запись не активна",
            type: "error",
          },
        })
      );
      return;
    }

    // Stop existing recognition if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping existing speech recognition:", e);
      }
      recognitionRef.current = null;
    }

    // Create new recognition instance
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ru-RU";
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript || interimTranscript) {
          setInterrogationData((prev) => ({
            ...prev,
            transcript: prev.transcript + finalTranscript,
          }));
        }
      };

      recognition.onerror = (event: any) => {
        console.error(
          "Speech recognition error (manual restart):",
          event.error,
          event
        );
        // window.dispatchEvent(
        //   new CustomEvent("showMessage", {
        //     detail: {
        //       title: "Ошибка распознавания речи",
        //       message: `Ошибка: ${event.error}`,
        //       type: "error",
        //     },
        //   })
        // );
      };

      recognition.onend = () => {
        // Try to restart automatically
        if (recordingState.isRecording) {
          setTimeout(() => {
            if (recordingState.isRecording && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error(
                  "Failed to automatically restart speech recognition:",
                  e
                );
              }
            }
          }, 300);
        }
      };

      recognition.onstart = () => {
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Распознавание речи",
              message: "Распознавание речи перезапущено",
              type: "success",
            },
          })
        );
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error("Failed to manually restart speech recognition:", e);
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка",
            message: "Не удалось перезапустить распознавание речи",
            type: "error",
          },
        })
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-center mb-6 text-2xl sm:text-3xl font-semibold text-gray-800">
        Запись нового допроса
      </h2>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block mb-2 font-medium text-gray-700"
          >
            Название:
          </label>
          <input
            id="title"
            type="text"
            value={interrogationData.title}
            onChange={(e) =>
              setInterrogationData({
                ...interrogationData,
                title: e.target.value,
              })
            }
            placeholder="Введите название допроса"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label
              htmlFor="date"
              className="block mb-2 font-medium text-gray-700"
            >
              Дата:
            </label>
            <input
              id="date"
              type="date"
              value={interrogationData.date}
              onChange={(e) =>
                setInterrogationData({
                  ...interrogationData,
                  date: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label
              htmlFor="suspect"
              className="block mb-2 font-medium text-gray-700"
            >
              Подозреваемый:
            </label>
            <input
              id="suspect"
              type="text"
              value={interrogationData.suspect}
              onChange={(e) =>
                setInterrogationData({
                  ...interrogationData,
                  suspect: e.target.value,
                })
              }
              placeholder="Введите имя подозреваемого"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label
              htmlFor="officer"
              className="block mb-2 font-medium text-gray-700"
            >
              Следователь:
            </label>
            <input
              id="officer"
              type="text"
              value={interrogationData.officer}
              onChange={(e) =>
                setInterrogationData({
                  ...interrogationData,
                  officer: e.target.value,
                })
              }
              placeholder="Введите имя следователя"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label
              htmlFor="language"
              className="block mb-2 font-medium text-gray-700"
            >
              Язык распознавания:
            </label>
            <select
              id="language"
              value={transcriptionLanguage}
              onChange={(e) =>
                setTranscriptionLanguage(e.target.value as "ru" | "tg")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="ru">Русский</option>
              <option value="tg">Таджикский</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="transcript"
            className="block mb-2 font-medium text-gray-700"
          >
            Расшифровка речи:
          </label>
          <textarea
            id="transcript"
            value={interrogationData.transcript}
            onChange={(e) =>
              setInterrogationData({
                ...interrogationData,
                transcript: e.target.value,
              })
            }
            placeholder="Введите расшифровку речи"
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-y"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          Аудиозапись
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          {!recordingState.isRecording ? (
            <button
              className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
              onClick={startRecording}
            >
              Начать запись
            </button>
          ) : (
            <div className="flex gap-2">
              {recordingState.isPaused ? (
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                  onClick={resumeRecording}
                >
                  Продолжить запись
                </button>
              ) : (
                <button
                  className="px-6 py-3 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors font-medium"
                  onClick={pauseRecording}
                >
                  Пауза
                </button>
              )}
              <button
                className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
                onClick={stopRecording}
              >
                Остановить запись
              </button>
              <button
                className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={restartSpeechRecognition}
              >
                Перезапустить распознавание
              </button>
            </div>
          )}
          <div className="font-mono text-xl sm:text-2xl font-bold text-gray-800">
            {formatTime(recordingState.recordingTime)}
          </div>
        </div>

        {recordingState.audioUrl && (
          <div className="mt-4 p-4 bg-white rounded">
            <h4 className="mb-2 font-medium text-gray-800">Записанное аудио</h4>
            <audio controls src={recordingState.audioUrl} className="w-full" />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          onClick={handleSave}
          disabled={recordingState.isRecording}
        >
          Сохранить допрос
        </button>
        <button
          className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          onClick={handlePreviewDocument}
          disabled={recordingState.isRecording}
        >
          Предварительный просмотр и скачивание Word
        </button>
        <button
          className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("showMessage", {
                detail: {
                  title: "Отмена",
                  message: "Операция отменена",
                  type: "info",
                },
              })
            )
          }
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

function UserProfile({
  user,
}: {
  user: { _id: string; username: string; role: string };
}) {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
      <h2 className="text-center mb-6 text-2xl font-semibold text-gray-800">
        Профиль пользователя
      </h2>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pb-4 border-b border-gray-200">
          <span className="flex-1 text-gray-800 break-all">{user._id}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pb-4 border-b border-gray-200">
          <label className="font-bold text-gray-600 w-full sm:w-40">
            Имя пользователя:
          </label>
          <span className="flex-1 text-gray-800">{user.username}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="font-bold text-gray-600 w-full sm:w-40">
            Роль:
          </label>
          <span className="flex-1 text-gray-800">
            {user.role === "admin" ? "Администратор" : "Следователь"}
          </span>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const data = await api.adminAPI.getAllUsers(token);
        setUsers(data);
      } catch (error) {
        console.error("Ошибка при получении пользователей:", error);
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Ошибка",
              message: "Не удалось загрузить пользователей",
              type: "error",
            },
          })
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setShowAddUserForm(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowAddUserForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        await api.adminAPI.deleteUser(userId, token);

        // Update the users list
        setUsers(users.filter((user) => user._id !== userId));

        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Успех",
              message: "Пользователь успешно удален",
              type: "success",
            },
          })
        );
      } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Ошибка",
              message: "Не удалось удалить пользователя",
              type: "error",
            },
          })
        );
      }
    }
  };

  const handleSaveUser = async (userData: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (editingUser) {
        // Update existing user
        const updatedUser = await api.adminAPI.updateUser(
          editingUser._id,
          userData,
          token
        );
        setUsers(
          users.map((user) =>
            user._id === editingUser._id ? updatedUser : user
          )
        );
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Успех",
              message: "Пользователь успешно обновлен",
              type: "success",
            },
          })
        );
      } else {
        // Create new user
        const newUser = await api.adminAPI.createUser(userData, token);
        setUsers([...users, newUser]);
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Успех",
              message: "Пользователь успешно создан",
              type: "success",
            },
          })
        );
      }

      setShowAddUserForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Ошибка при сохранении пользователя:", error);
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка",
            message:
              "Не удалось сохранить пользователя: " + (error as Error).message,
            type: "error",
          },
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600">
        Загрузка пользователей...
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md">
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
        Панель администратора
      </h2>

      {showAddUserForm ? (
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setShowAddUserForm(false);
            setEditingUser(null);
          }}
        />
      ) : (
        <>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Управление пользователями
              </h3>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm sm:text-base"
                onClick={handleAddUser}
              >
                + Добавить пользователя
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="hidden sm:grid sm:grid-cols-3 bg-gray-100 p-4 font-bold text-gray-700">
                  <div>Имя пользователя</div>
                  <div>Роль</div>
                  <div>Действия</div>
                </div>
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 p-4 border-b border-gray-200 last:border-b-0 sm:items-center"
                  >
                    <div className="sm:contents">
                      <span className="sm:hidden font-bold text-gray-600">
                        Имя пользователя:{" "}
                      </span>
                      <div>{user.username}</div>
                    </div>
                    <div className="sm:contents">
                      <span className="sm:hidden font-bold text-gray-600">
                        Роль:{" "}
                      </span>
                      <div>
                        {user.role === "admin"
                          ? "Администратор"
                          : "Следователь"}
                      </div>
                    </div>
                    <div className="sm:contents">
                      <span className="sm:hidden font-bold text-gray-600">
                        Действия:{" "}
                      </span>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                          onClick={() => handleEditUser(user)}
                        >
                          Редактировать
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Статистика системы
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
                <h3 className="text-gray-600 mb-2 text-sm sm:text-base">
                  Всего пользователей
                </h3>
                <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {users.length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
                <h3 className="text-gray-600 mb-2 text-sm sm:text-base">
                  Всего допросов
                </h3>
                <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                  24
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
                <h3 className="text-gray-600 mb-2 text-sm sm:text-base">
                  Активные сессии
                </h3>
                <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                  3
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface UserFormProps {
  user: any | null;
  onSave: (userData: any) => void;
  onCancel: () => void;
}

function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [userData, setUserData] = useState({
    username: user?.username || "",
    password: "",
    role: user?.role || "investigator",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(userData);
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
      <h2 className="text-center mb-6 text-xl sm:text-2xl font-semibold text-gray-800">
        {user ? "Редактировать пользователя" : "Добавить пользователя"}
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="username"
            className="block mb-2 font-medium text-gray-700"
          >
            Имя пользователя:
          </label>
          <input
            id="username"
            type="text"
            value={userData.username}
            onChange={(e) =>
              setUserData({ ...userData, username: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block mb-2 font-medium text-gray-700"
          >
            {user
              ? "Новый пароль (оставьте пустым, чтобы не менять)"
              : "Пароль:"}
          </label>
          <input
            id="password"
            type="password"
            value={userData.password}
            onChange={(e) =>
              setUserData({ ...userData, password: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required={!user}
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block mb-2 font-medium text-gray-700"
          >
            Роль:
          </label>
          <select
            id="role"
            value={userData.role}
            onChange={(e) => setUserData({ ...userData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
          >
            <option value="investigator">Следователь</option>
            <option value="admin">Администратор</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          >
            {user ? "Сохранить изменения" : "Создать пользователя"}
          </button>
          <button
            type="button"
            className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium"
            onClick={onCancel}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
