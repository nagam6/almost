export async function getRooms(signal) {
  const response = await fetch("/api/rooms", { signal });

  if (!response.ok) {
    throw new Error("Unable to load museum rooms.");
  }

  const data = await response.json();

  if (!Array.isArray(data.rooms)) {
    throw new Error("Invalid rooms response.");
  }

  return data.rooms;
}