async function requestAttempt(slug, { signal, body } = {}) {
  const response = await fetch(`/api/exhibits/${encodeURIComponent(slug)}/attempt`, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    signal,
    headers: body === undefined ? {} : { "Content-Type": "application/json", "X-Almost-Request": "1" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Unable to load or save your attempt.");
    error.status = response.status;
    throw error;
  }
  return data;
}
export function getMyAttempt(slug, signal) { return requestAttempt(slug, { signal }); }
export function submitAttempt(slug, body) { return requestAttempt(slug, { body }); }