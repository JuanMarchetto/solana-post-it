export const fetcher = async (url: string): Promise<any> => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    const info = await res.json();
    (error as any).status = res.status;
    console.warn(url, "\nAn error occured while fetching:\n", info);
    throw error;
  }

  return res.json();
};
