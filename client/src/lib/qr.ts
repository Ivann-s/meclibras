import QRCode from "qrcode";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "item";
}

export function getPublicItemUrl(slug: string ) {
  const configuredBase = import.meta.env.VITE_PUBLIC_BASE_URL
    ?.trim()
    .replace(/\/$/, "");

  const base = configuredBase || window.location.origin;

  return `${base}/m/${slug}`;
}


export async function createQrData(slug: string) {
  const url = getPublicItemUrl(slug);
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#193b34", light: "#ffffff" },
  });
  const png = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 1200,
    color: { dark: "#193b34", light: "#ffffff" },
  });
  return { url, svg, png };
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}
