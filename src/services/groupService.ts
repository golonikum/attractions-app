
import { getCookie } from "@/lib/clientCookies";
import { Group, CreateGroupRequest, UpdateGroupRequest } from "@/types/group";

const API_URL = "/api/groups";

// Get authorization header
const getAuthHeaders = () => {
  const token = getCookie("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Get all groups for the current user
export const getAllGroups = async (): Promise<Group[]> => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch groups");
  }

  const data = await response.json();
  return data.groups;
};

// Get a specific group by ID
export const getGroupById = async (id: string): Promise<Group> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch group");
  }

  const data = await response.json();
  return data.group;
};

// Create a new group
export const createGroup = async (groupData: CreateGroupRequest): Promise<Group> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(groupData),
  });

  if (!response.ok) {
    throw new Error("Failed to create group");
  }

  const data = await response.json();
  return data.group;
};

// Update an existing group
export const updateGroup = async (id: string, groupData: UpdateGroupRequest): Promise<Group> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(groupData),
  });

  if (!response.ok) {
    throw new Error("Failed to update group");
  }

  const data = await response.json();
  return data.group;
};

// Delete a group
export const deleteGroup = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete group");
  }
};
