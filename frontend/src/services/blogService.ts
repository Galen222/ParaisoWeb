// frontend/src/services/blogService.ts

import axios from "axios";

export interface BlogPost {
  id_noticia: number;
  idioma: string;
  titulo: string;
  contenido: string;
  autor: string;
  imagen_url: string;
  imagen_url_2?: string;
  fecha_publicacion: string;
  fecha_actualizacion: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_BLOG_URL;

if (!API_URL) {
  throw new Error("La variable de entorno NEXT_PUBLIC_API_BLOG_URL no está definida.");
}

export const getBlogPosts = async (idioma: string): Promise<BlogPost[]> => {
  try {
    const response = await axios.get<BlogPost[]>(`${API_URL}?idioma=${idioma}`);
    return response.data;
  } catch (error) {
    /* console.error("Error recibiendo la lista de blogs: ", error); */
    throw error;
  }
};

export const getBlogPostById = async (id: number, idioma: string): Promise<BlogPost> => {
  try {
    const response = await axios.get<BlogPost>(`${API_URL}/${id}?idioma=${idioma}`);
    return response.data;
  } catch (error) {
    /* console.error("Error recibiendo el blog: ", error); */
    throw error;
  }
};
