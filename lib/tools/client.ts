export async function runTool<T>(name: string, data: any): Promise<T> {
  const res = await fetch(`/api/tools/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    throw new Error(`Tool request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}
