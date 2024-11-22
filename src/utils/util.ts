export async function fetchRequest(
  url: string,
  init?: RequestInit
): Promise<any> {
  const response = await fetch(url, init);
  if (response.status !== 200) throw new Error("Error fetching");
  const result: any = await response.json();
  return result;
}
