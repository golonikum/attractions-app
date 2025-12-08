import { getCookie } from "@/lib/clientCookies";

const API_URL = "/api/contacts";

// Get authorization header
const getAuthHeaders = () => {
  const token = getCookie("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Get all contacts for the current user
export const getAllContacts = async (): Promise<any[]> => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch contacts");
  }

  const data = await response.json();
  return data.contacts;
};
