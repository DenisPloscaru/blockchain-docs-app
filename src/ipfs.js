export async function uploadFileToIPFS(file) {
  const token = import.meta.env.VITE_PINATA_JWT;
  if (!token) throw new Error("Pinata JWT token not found in .env");

  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Pinata upload failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const cid = data.IpfsHash;
  return {
    uri: `ipfs://${cid}`,
    gateway: `https://gateway.pinata.cloud/ipfs/${cid}`,
  };
}
