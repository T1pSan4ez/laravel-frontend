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
  async getCities() {
    try {
      return await this.fetchData("/city");
    } catch (error) {
      console.error("Ошибка при запросе списка городов:", error);
      throw error;
    }
  }


}


export default new ApiService();
