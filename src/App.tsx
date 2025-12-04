import { useState, useRef, useEffect } from "react";
import "./App.css";
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
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="app">
      {/* Test element to verify CSS is working */}

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
        <div className="main-layout">
          <header className="header">
            <div className="header-content">
              <h1>Система ведения допросов</h1>
              <nav className="navigation">
                <button onClick={() => setActiveView("dashboard")}>
                  Панель управления
                </button>
                <button onClick={() => setActiveView("interrogations")}>
                  Допросы
                </button>
                <button onClick={() => setActiveView("record")}>Запись</button>
                {user?.role === "admin" && (
                  <button onClick={() => setActiveView("admin")}>Админ</button>
                )}
                <button onClick={() => setActiveView("profile")}>
                  Профиль
                </button>
                <button onClick={handleLogout}>Выйти</button>
              </nav>
            </div>
          </header>

          <main className="main-content">
            {activeView === "dashboard" && <Dashboard />}
            {activeView === "interrogations" && <InterrogationsList />}
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
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Вход в систему</h2>
        <div className="form-group">
          <label htmlFor="username">Имя пользователя:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          Войти
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Панель управления следователя</h2>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Всего допросов</h3>
          <p>12</p>
        </div>
        <div className="stat-card">
          <h3>В этом месяце</h3>
          <p>3</p>
        </div>
        <div className="stat-card">
          <h3>На рассмотрении</h3>
          <p>2</p>
        </div>
      </div>
      <div className="quick-actions">
        <button className="action-btn">Начать новый допрос</button>
        <button className="action-btn">Просмотреть последние</button>
      </div>
    </div>
  );
}

function InterrogationsList() {
  const [interrogations, setInterrogations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingInterrogation, setViewingInterrogation] =
    useState<InterrogationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterrogations = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        console.log("Token found:", !!token); // Debug log

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
        console.log("Interrogations data received:", data); // Debug log

        // Map _id to id for consistency
        const mappedData = data.map((item: any) => {
          // Create a new object with id field and all other properties
          const newItem = {
            ...item,
            id: item._id,
          };
          return newItem;
        });

        setInterrogations(mappedData);
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
    };

    fetchInterrogations();
  }, []);

  const handleViewInterrogation = async (interrogationId: string) => {
    // Debugging: log the ID being passed
    console.log("Attempting to view interrogation with ID:", interrogationId);

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
      // Ensure the returned data has the correct id field
      const mappedData = {
        ...data,
        id: data._id || data.id || interrogationId,
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
  console.log(interrogations);

  if (loading) {
    return <div className="loading">Загрузка допросов...</div>;
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
    <div className="interrogations-list">
      <div className="list-header">
        <h2>Допросы</h2>
        <button
          className="add-btn"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("showMessage", {
                detail: {
                  title: "Функция в разработке",
                  message: "Создать новый допрос",
                  type: "info",
                },
              })
            )
          }
        >
          + Новый допрос
        </button>
      </div>

      {error && <div className="error-message">Ошибка: {error}</div>}

      {interrogations.length === 0 ? (
        <div className="no-data">Нет доступных допросов</div>
      ) : (
        <div className="interrogations-table">
          <div className="table-header">
            <div>Название</div>
            <div>Дата</div>
            <div>Подозреваемый</div>
            <div>Следователь</div>
            <div>Действия</div>
          </div>
          {interrogations.map((interrogation) => (
            <div key={interrogation.id} className="table-row">
              <div>{interrogation.title}</div>
              <div>
                {interrogation.date
                  ? new Date(interrogation.date).toLocaleDateString("ru-RU")
                  : "Нет даты"}
              </div>
              <div>{interrogation.suspect || "Не указан"}</div>
              <div>{interrogation.officer || "Не указан"}</div>
              <div>
                <button
                  className="action-btn-small"
                  onClick={() => handleViewInterrogation(interrogation.id)}
                >
                  Просмотр
                </button>
              </div>
            </div>
          ))}
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

  // Load audio if available
  useEffect(() => {
    if (interrogation.audioUrl) {
      setAudioUrl(interrogation.audioUrl);
    }
  }, [interrogation.audioUrl]);

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
    <div className="view-interrogation">
      <div className="view-header">
        <h2>Просмотр допроса</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="interrogation-details">
        <div className="detail-row">
          <label>Название:</label>
          <div className="detail-value">{interrogation.title}</div>
        </div>

        <div className="detail-row">
          <label>Дата:</label>
          <div className="detail-value">{formatDate(interrogation.date)}</div>
        </div>

        <div className="detail-row">
          <label>Подозреваемый:</label>
          <div className="detail-value">{interrogation.suspect}</div>
        </div>

        <div className="detail-row">
          <label>Следователь:</label>
          <div className="detail-value">{interrogation.officer}</div>
        </div>

        <div className="detail-row">
          <label>Расшифровка речи:</label>
          <div className="detail-value notes">
            {interrogation.transcript || "Нет расшифровки"}
          </div>
        </div>

        <div className="audio-section">
          <h3>Аудиозапись</h3>
          {loadingAudio ? (
            <div className="loading">Загрузка аудио...</div>
          ) : audioUrl ? (
            <div className="audio-player">
              <audio controls src={audioUrl} />
            </div>
          ) : (
            <div className="no-audio">Аудиозапись отсутствует</div>
          )}
        </div>
      </div>

      <div className="view-actions">
        <button
          className="secondary-btn"
          onClick={handleDownloadWord}
          disabled={loadingDocument}
        >
          {loadingDocument ? "Скачивание..." : "Скачать Word"}
        </button>
        <button className="cancel-btn" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

interface RecordingState {
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  audioUrl: string | null;
  recordingTime: number;
}

function RecordInterrogation() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);

        setRecordingState((prev) => ({
          ...prev,
          audioChunks,
          audioUrl,
        }));

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
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

      // Start speech recognition if available
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "ru-RU"; // Russian language

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
          console.error("Speech recognition error:", event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        console.warn("Web Speech API is not supported in this browser");
      }

      setRecordingState({
        isRecording: true,
        mediaRecorder,
        audioChunks: [],
        audioUrl: null,
        recordingTime: 0,
      });
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

      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      setRecordingState((prev) => ({
        ...prev,
        isRecording: false,
      }));
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
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.dispatchEvent(
          new CustomEvent("showMessage", {
            detail: {
              title: "Ошибка авторизации",
              message: "Вы должны войти в систему, чтобы сохранить допрос",
              type: "error",
            },
          })
        );
        return;
      }

      // Validate required fields
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

      // Save interrogation data with real-time transcript
      const dataToSave = {
        ...interrogationData,
        transcript: interrogationData.transcript,
      };

      const interrogation = await api.interrogationAPI.create(
        dataToSave,
        token
      );

      // If we have audio, upload it and get the transcript
      let transcript = "";
      if (recordingState.audioChunks.length > 0 && interrogation.id) {
        const audioBlob = new Blob(recordingState.audioChunks, {
          type: "audio/wav",
        });
        const audioFile = new File(
          [audioBlob],
          `interrogation-${interrogation.id}.wav`,
          { type: "audio/wav" }
        );
        const audioResponse = await api.audioAPI.upload(
          interrogation.id,
          audioFile,
          token
        );
        transcript = audioResponse.transcript || "";

        // Update the interrogation with the transcript
        await api.interrogationAPI.update(
          interrogation.id,
          { transcript },
          token
        );
      }

      // Generate Word document
      let documentPath = "";
      if (interrogation.id) {
        const documentResult = await api.documentAPI.generate(
          interrogation.id,
          token
        );
        documentPath = documentResult.documentPath;
        // Update the interrogation with the document path
        await api.interrogationAPI.update(
          interrogation.id,
          {
            wordDocumentPath: documentResult.documentPath,
          },
          token
        );
      }

      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Успех",
            message: "Допрос успешно сохранен!",
            type: "success",
          },
        })
      );
      console.log("Данные допроса:", interrogation);

      // Download Word document after saving
      if (documentPath) {
        try {
          // Extract filename from path
          const filename =
            documentPath.split("/").pop() || "interrogation.docx";
          const downloadResult = await api.documentAPI.download(filename);

          // Create download link
          const link = document.createElement("a");
          link.href = downloadResult.url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (downloadError) {
          console.error("Ошибка скачивания документа:", downloadError);
        }
      }
    } catch (error) {
      console.error("Ошибка сохранения допроса:", error);
      window.dispatchEvent(
        new CustomEvent("showMessage", {
          detail: {
            title: "Ошибка",
            message: "Не удалось сохранить допрос",
            type: "error",
          },
        })
      );
    }
  };

  return (
    <div className="record-interrogation">
      <h2>Запись нового допроса</h2>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="title">Название:</label>
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
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Дата:</label>
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="suspect">Подозреваемый:</label>
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="officer">Следователь:</label>
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
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="transcript">Расшифровка речи:</label>
          <textarea
            id="transcript"
            value={interrogationData.transcript}
            onChange={(e) =>
              setInterrogationData({
                ...interrogationData,
                transcript: e.target.value,
              })
            }
            style={{ width: "102%", height: 400 }}
            placeholder="Введите расшифровку речи"
            rows={4}
          />
        </div>
      </div>

      <div className="recording-section">
        <h3>Аудиозапись</h3>

        <div className="recording-controls">
          {!recordingState.isRecording ? (
            <button className="record-btn" onClick={startRecording}>
              Начать запись
            </button>
          ) : (
            <button className="stop-btn" onClick={stopRecording}>
              Остановить запись
            </button>
          )}

          <div className="timer">
            {formatTime(recordingState.recordingTime)}
          </div>
        </div>

        {recordingState.audioUrl && (
          <div className="audio-preview">
            <h4>Записанное аудио</h4>
            <audio controls src={recordingState.audioUrl} />
            <button className="play-btn">Воспроизвести</button>
          </div>
        )}
      </div>

      <div className="actions">
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={recordingState.isRecording}
        >
          Сохранить допрос
        </button>
        <button
          className="secondary-btn"
          onClick={handlePreviewDocument}
          disabled={recordingState.isRecording}
        >
          Предварительный просмотр и скачивание Word
        </button>
        <button
          className="cancel-btn"
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
    <div className="profile">
      <h2>Профиль пользователя</h2>
      <div className="profile-info">
        <div className="info-item">
          <label>ID:</label>
          <span>{user._id}</span>
        </div>
        <div className="info-item">
          <label>Имя пользователя:</label>
          <span>{user.username}</span>
        </div>
        <div className="info-item">
          <label>Роль:</label>
          <span>{user.role === "admin" ? "Администратор" : "Следователь"}</span>
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

      console.log("Sending user data:", userData);

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
        console.log("Creating new user with token:", token);
        const newUser = await api.adminAPI.createUser(userData, token);
        console.log("New user created:", newUser);
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
    return <div className="loading">Загрузка пользователей...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Панель администратора</h2>

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
          <div className="admin-section">
            <div
              className="section-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3>Управление пользователями</h3>
              <button className="add-btn" onClick={handleAddUser}>
                + Добавить пользователя
              </button>
            </div>

            <div className="users-table">
              <div className="table-header">
                <div>Имя пользователя</div>
                <div>Роль</div>
                <div>Действия</div>
              </div>
              {users.map((user) => (
                <div key={user._id} className="table-row">
                  <div>{user.username}</div>
                  <div>
                    {user.role === "admin" ? "Администратор" : "Следователь"}
                  </div>
                  <div>
                    <button
                      className="action-btn-small"
                      onClick={() => handleEditUser(user)}
                    >
                      Редактировать
                    </button>
                    <button
                      className="action-btn-small"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section">
            <div className="section-header">
              <h3>Статистика системы</h3>
            </div>

            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Всего пользователей</h3>
                <p>{users.length}</p>
              </div>
              <div className="stat-card">
                <h3>Всего допросов</h3>
                <p>24</p>
              </div>
              <div className="stat-card">
                <h3>Активные сессии</h3>
                <p>3</p>
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
    <div className="user-form-container">
      <h2>{user ? "Редактировать пользователя" : "Добавить пользователя"}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Имя пользователя:</label>
          <input
            id="username"
            type="text"
            value={userData.username}
            onChange={(e) =>
              setUserData({ ...userData, username: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
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
            required={!user}
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Роль:</label>
          <select
            id="role"
            value={userData.role}
            onChange={(e) => setUserData({ ...userData, role: e.target.value })}
          >
            <option value="investigator">Следователь</option>
            <option value="admin">Администратор</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {user ? "Сохранить изменения" : "Создать пользователя"}
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
