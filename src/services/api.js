import axios from "axios";
import Constants from '@/constants.js';

const axiosInstance = axios.create({
  baseURL: Constants.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  withXSRFToken: true,
});

class ApiService {
  constructor() {}

  async fetchData(endpoint, params = {}) {
    try {
      const response = await axiosInstance.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error("Ошибка GET-запроса:", error);
      throw error.response?.data || error;
    }
  }

  async getSCRFToken() {
    try {

      const response = await axios.get("http://example.camelot/sanctum/csrf-cookie", {
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

  async getMovies() {
    try {
      return await this.fetchData("/movies");
    } catch (error) {
      console.error("Ошибка при запросе списка фильмов:", error);
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
      const response = await axiosInstance.patch(endpoint, { slots });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при запросе PATCH сессии с ID  ${id}:`, error);
      throw error.response?.data || error;
    }
  }

  async fetchProducts() {
    try {
      const response = await axiosInstance.get("/products");
      return response.data;
    } catch (error) {
      console.error("Ошибка при запросе списка продуктов:", error);
      throw error.response?.data || error;
    }
  }

}



export default new ApiService();
