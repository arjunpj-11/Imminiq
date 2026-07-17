import api from "../../../../lib/axios";

export async function downloadServerCsv(
  path: string,
  filename: string,
  params?: Record<string, string>,
) {
  const response = await api.get<Blob>(path, { params, responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
