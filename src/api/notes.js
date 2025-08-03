 import axios from "axios";

export const fetchNotes = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${import.meta.env.VITE_API_URL}/api/notes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createNote = (data) => {
  const token = localStorage.getItem("token");
  return axios.post(`${import.meta.env.VITE_API_URL}/api/notes`, data, {
    headers: { "Authorization": `Bearer ${token}` },
  });
};

export const updateNote = (id, data) => {
  const token = localStorage.getItem("token");
  return axios.put(`${import.meta.env.VITE_API_URL}/api/notes/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteNote = (id) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${import.meta.env.VITE_API_URL}/api/notes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const bulkUpdateNotes = (noteIds, update) => {
  const token = localStorage.getItem("token");
  return axios.put(`${import.meta.env.VITE_API_URL}/api/notes/bulk`, { noteIds, update }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const shareNote = (noteId, userIds) => {
  const token = localStorage.getItem("token");
  return axios.post(`${import.meta.env.VITE_API_URL}/api/notes/share`, { noteId, userIds }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
