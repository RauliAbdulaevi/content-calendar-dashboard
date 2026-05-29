import { loadData, saveData, mutateData, initializeStore } from "../repositories/dataStore.js";

export function readData() {
  return loadData();
}

export function writeData(data) {
  saveData(data);
}

export function publicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || "",
    role: user.role,
    createdAt: user.createdAt
  };
}

export { mutateData, initializeStore };
