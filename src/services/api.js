import axios from "axios";
import Constants from '@/constants.js';

const axiosInstance = axios.create({
  baseURL: Constants.API_BASE_URL,
  headers: {'Content-Type': 'application/json'},
  withCredentials: true,
  withXSRFToken: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


class ApiService {
  constructor() {
  }

  async fetchData(endpoint, params = {}) {
    try {
      const response = await axiosInstance.get(endpoint, {params});
      return response.data;
    } catch (error) {
      console.error("Ошибка GET-запроса:", error);
      throw error.response?.data || error;
    }
  }

  async getSCRFToken() {
    try {

      const response = await axios.get("http://localhost/sanctum/csrf-cookie", {
        withCredentials: true,
      });
      console.log("CSRF TOKEN:", response.headers);
      return response;
    } catch (error) {
      console.error("Ошибка при запросе токена для CSRF", error);
      throw error;
    }
  }

  async register(credentials) {
    try {
      const token = await this.getSCRFToken();

      const response = await axiosInstance.post("/register", credentials);
      return response.data;
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      throw error.response?.data || error;
    }
  }

  async login(credentials) {
    try {
      const token = await this.getSCRFToken();
      console.log("CSRF TOKEN:", token);

      const response = await axiosInstance.post("/login", credentials);
      return response.data;
    } catch (error) {
      console.error("Ошибка при запросе", error);
      throw error;
    }
  }

  async logout() {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      const response = await axiosInstance.post("/logout");

      localStorage.removeItem("authToken");

      console.log("Logout successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Ошибка при выходе", error);
      throw error;
    }
  }

  async getCities() {
    try {
      return await this.fetchData("/cities");
    } catch (error) {
      console.error("Ошибка при запросе списка городов:", error);
      throw error;
    }
  }

  async getMovies(params = {}) {
    try {
      return await this.fetchData("/movies", params);
    } catch (error) {
      console.error("Ошибка при запросе списка фильмов:", error);
      throw error;
    }
  }

  async getMovie(movieId) {
    try {
      const endpoint = `/movie/${movieId}`;
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при запросе фильма с ID ${movieId}:`, error);
      throw error.response?.data || error;
    }
  }

  async getGenres() {
    try {
      return await this.fetchData("/genres");
    } catch (error) {
      console.error("Ошибка при запросе списка жанров:", error);
      throw error;
    }
  }

  async getMoviesByCinema(cinemaId) {
    try {
      const endpoint = `/movies/${cinemaId}`;
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при запросе фильмов для кинотеатра с ID ${cinemaId}:`, error);
      throw error.response?.data || error;
    }
  }

  async getSessionById(id) {
    try {
      const endpoint = `/sessions/${id}`;
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при запросе сессии с ID ${id}:`, error);
      throw error.response?.data || error;
    }
  }

  async updateSessionSlots(id, slots) {
    try {
      const endpoint = `/session-slots/${id}`;
      const response = await axiosInstance.patch(endpoint, {slots});
      return response.data;
    } catch (error) {
      console.error(`Ошибка при запросе PATCH сессии с ID  ${id}:`, error);
      throw error.response?.data || error;
    }
  }

  async getProducts() {
    try {
      const response = await axiosInstance.get("/products");
      return response.data;
    } catch (error) {
      console.error("Ошибка при запросе списка продуктов:", error);
      throw error.response?.data || error;
    }
  }

  async loginWithGoogleRedirect() {
    try {
      const response = await this.fetchData('/auth/google/redirect');
      return response.url;
    } catch (error) {
      console.error("Ошибка при редиректе на Google:", error);
      throw error;
    }
  }

  async getUserProfile() {
    try {
      const response = await axiosInstance.get('/user');
      return response.data;
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error);
      throw error;
    }
  }

  async changeProfile(data) {
    try {
      const response = await axiosInstance.post('/user/profile', data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      throw error.response?.data || error;
    }
  }

  async changePassword(data) {
    try {
      const response = await axiosInstance.post('/user/password', data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении пароля:', error);
      throw error.response?.data || error;
    }
  }

  async generateQRToken() {
    try {
      const response = await axiosInstance.get('/qr-token');
      return response.data;
    } catch (error) {
      console.error('Ошибка генерации QR токена:', error);
      throw error;
    }
  }

  async loginWithQRToken(token) {
    try {
      const response = await axiosInstance.post("/login/qr", { token });
      return response.data;
    } catch (error) {
      console.error("Ошибка при входе с использованием QR-кода:", error);
      throw error.response?.data || error;
    }
  }

  async getMovieComments(movieId, params) {
    try {
      const response = await axiosInstance.get(`/movies/${movieId}/comments`, params);
      return response.data;
    } catch (error) {
      console.error("Error fetching movie comments:", error);
      throw error.response?.data || error;
    }
  }

  async addMovieComment(movieId, commentData) {
    try {
      const response = await axiosInstance.post(`/movies/${movieId}/comments`, commentData);
      return response.data;
    } catch (error) {
      console.error("Error posting movie comment:", error);
      throw error.response?.data || error;
    }
  }

  async deleteMovieComment(commentId) {
    try {
      const response = await axiosInstance.delete(`/movies/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error.response?.data || error;
    }
  }

  async getMovieRating(movieId) {
    try {
      const response = await axiosInstance.get(`/movies/${movieId}/ratings`);
      return response.data;
    } catch (error) {
      console.error("Error fetching movie rating:", error);
      throw error.response?.data || error;
    }
  }

  async addMovieRating(movieId, ratingData) {
    try {
      const response = await axiosInstance.post(`/movies/${movieId}/ratings`, ratingData);
      return response.data;
    } catch (error) {
      console.error("Error posting movie rating:", error);
      throw error.response?.data || error;
    }
  }

}


export default new ApiService();
