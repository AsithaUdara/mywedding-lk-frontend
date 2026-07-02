const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export function validateAgencyLogoFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Use JPEG, PNG, WebP, or SVG images only.";
  }
  if (file.size > MAX_BYTES) {
    return "Logo must be 2 MB or smaller.";
  }
  return null;
}

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to frontend/.env.local."
    );
  }

  return { cloudName, uploadPreset };
}

export async function uploadAgencyLogo(file: File, plannerId: string): Promise<string> {
  const validationError = validateAgencyLogoFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const { cloudName, uploadPreset } = getCloudinaryConfig();

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset);
  body.append("folder", `mywedding/planners/${plannerId}/branding`);
  body.append("tags", "planner,agency-logo,white-label");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (payload as { error?: { message?: string } })?.error?.message ||
      "Failed to upload logo to Cloudinary.";
    throw new Error(message);
  }

  const secureUrl = (payload as { secure_url?: string }).secure_url;
  if (!secureUrl) {
    throw new Error("Cloudinary did not return an image URL.");
  }

  return secureUrl;
}
