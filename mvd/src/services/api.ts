// API service for interacting with the backend

const API_BASE_URL = "http://localhost:3000/api";

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Ошибка входа");
    }

    return response.json();
  },

  getProfile: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Не удалось получить профиль");
    }

    return response.json();
  },
};

// Interrogation API
export const interrogationAPI = {
  getAll: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/interrogations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Не удалось получить допросы");
    }

    return response.json();
  },

  getById: async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/interrogations/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Не удалось получить допрос");
    }

    return response.json();
  },

  create: async (data: any, token: string) => {
    const response = await fetch(`${API_BASE_URL}/interrogations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Не удалось создать допрос");
    }

    return response.json();
  },

  update: async (id: string, data: any, token: string) => {
    const response = await fetch(`${API_BASE_URL}/interrogations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Не удалось обновить допрос");
    }

    return response.json();
  },

  delete: async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/interrogations/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Не удалось удалить допрос");
    }

    return response.json();
  },
};

// Admin API
export const adminAPI = {
  getAllUsers: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Не удалось получить пользователей");
    }

    return response.json();
  },

  getUserById: async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Не удалось получить пользователя");
    }

    return response.json();
  },

  createUser: async (userData: any, token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Не удалось создать пользователя");
    }

    return response.json();
  },

  updateUser: async (id: string, userData: any, token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Не удалось обновить пользователя");
    }

    return response.json();
  },

  deleteUser: async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Не удалось удалить пользователя");
    }

    return response.json();
  },
};

// Document API
export const documentAPI = {
  generate: async (interrogationId: string, token: string) => {
    const response = await fetch(
      `${API_BASE_URL}/documents/generate/${interrogationId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Не удалось сгенерировать документ");
    }

    return response.json();
  },

  download: async (filename: string) => {
    const response = await fetch(
      `${API_BASE_URL}/documents/download/${filename}`
    );

    if (!response.ok) {
      throw new Error("Не удалось загрузить документ");
    }

    return response.json();
  },
};

// Audio API
export const audioAPI = {
  upload: async (interrogationId: string, audioFile: File, token: string) => {
    const formData = new FormData();
    formData.append("audio", audioFile);

    const response = await fetch(
      `${API_BASE_URL}/audio/upload/${interrogationId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Не удалось загрузить аудио");
    }

    return response.json();
  },

  get: async (filename: string) => {
    const response = await fetch(`${API_BASE_URL}/audio/${filename}`);

    if (!response.ok) {
      throw new Error("Не удалось получить аудио");
    }

    return response.json();
  },
};
