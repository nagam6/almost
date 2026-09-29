async function post(path, body) {
  const response = await fetch(`/api/ai/${path}`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-Almost-Request": "1",
    },
    body: JSON.stringify(body),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.message || "The AI lab is unavailable. Please try again."
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function getAiChallenge() {
  const data = await post("challenge", {});

  if (
    !data.challenge?.token ||
    !Array.isArray(data.challenge.options)
  ) {
    throw new Error("The challenge could not be loaded.");
  }

  return data.challenge;
}

export async function checkAiChallenge(answer) {
  return post("check", answer);
}