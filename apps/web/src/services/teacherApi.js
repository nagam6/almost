export async function teacherRequest(
  path,
  { method = "GET", body, signal } = {},
) {
  const response = await fetch(`/api/teacher${path}`, {
    method,
    signal,
    credentials: "same-origin",
    headers:
      method === "GET"
        ? {}
        : { "Content-Type": "application/json", "X-Almost-Request": "1" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw Object.assign(
      new Error(
        data.message || "Could not complete the request. Please try again.",
      ),
      { status: response.status },
    );
  return data;
}
