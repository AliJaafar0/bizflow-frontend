export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("bizflow_token")
      : null;

  const publicEndpoints = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  const isPublicEndpoint = publicEndpoints.some(
    (route) => endpoint.startsWith(route)
  );

  if (
    typeof window !== "undefined" &&
    !token &&
    !isPublicEndpoint
  ) {
    window.location.href = "/login";

    throw new Error("Unauthenticated");
  }

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bizflow_token");
      window.location.href = "/login";
    }

    throw new Error("Unauthenticated");
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
}