import axios from "axios";

export const withoutAuthAxios = () => {
  return axios.create({
    // Falls back to "/api" so "/calculate" becomes "/api/calculate"
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  });
};