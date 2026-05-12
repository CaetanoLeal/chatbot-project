import axios from "axios"

export const api = axios.create({
  baseURL: "http://45.228.143.12:3001", // api_mensagem
})