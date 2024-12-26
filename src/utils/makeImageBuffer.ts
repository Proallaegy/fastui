export async function makeImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw Error(
      `Failed to fetch background image from URL: ${url}, Status: ${response.statusText}`
    );
  }

  const data = await response.arrayBuffer();
  const imageBuffer = Buffer.from(data);

  return imageBuffer;
}
