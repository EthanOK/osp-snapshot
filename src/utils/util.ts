export async function fetchRequest(url: string, init?: RequestInit): Promise<any> {
  const response = await fetch(url, init);
  const result: any = await response.json();
  return result;
}
