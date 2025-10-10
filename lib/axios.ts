import axios from 'axios';

const clienteAxios = axios.create({
  // La URL base apunta a nuestras API Routes de Next.js
  baseURL: '/api',
});

export default clienteAxios;