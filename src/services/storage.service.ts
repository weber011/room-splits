import { createClient } from "@/lib/supabase/client";

export type StorageBucket =
  | "property-images"
  | "property-videos"
  | "owner-documents"
  | "stay-documents"
  | "complaint-attachments"
  | "avatars";

export interface FileValidationConfig {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export const BUCKET_CONFIGS: Record<StorageBucket, FileValidationConfig> = {
  "property-images": {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
  },
  "property-videos": {
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ["video/mp4", "video/webm"],
    allowedExtensions: ["mp4", "webm"],
  },
  "owner-documents": {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    allowedExtensions: ["pdf", "jpg", "jpeg", "png"],
  },
  "stay-documents": {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    allowedExtensions: ["pdf", "jpg", "jpeg", "png"],
  },
  "complaint-attachments": {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    allowedExtensions: ["jpg", "jpeg", "png", "webp", "pdf"],
  },
  avatars: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: ["jpg", "jpeg", "png", "webp"],
  },
};

const DANGEROUS_EXTENSIONS = [
  "exe", "bat", "cmd", "sh", "php", "js", "ts", "py", "pl", "rb",
  "jar", "vbs", "ps1", "scr", "pif", "application", "gadget", "msi",
];

export function validateFile(file: File, bucket: StorageBucket): { valid: boolean; reason?: string } {
  const config = BUCKET_CONFIGS[bucket];
  const extension = (file.name.split(".").pop() || "").toLowerCase();

  // 1. Executable file protection
  if (DANGEROUS_EXTENSIONS.includes(extension)) {
    return { valid: false, reason: `Executable and script files (.${extension}) are strictly prohibited.` };
  }

  // 2. Extension validation
  if (!config.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      reason: `Invalid file extension '.${extension}'. Allowed extensions for ${bucket}: ${config.allowedExtensions.join(", ")}`,
    };
  }

  // 3. MIME Type validation
  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      reason: `Unsupported file format '${file.type}'. Allowed MIME types: ${config.allowedMimeTypes.join(", ")}`,
    };
  }

  // 4. File Size validation
  if (file.size > config.maxSizeBytes) {
    const maxMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      reason: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the maximum limit of ${maxMB}MB for ${bucket}.`,
    };
  }

  return { valid: true };
}

async function getCurrentUser() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export const storageService = {
  /**
   * Generates a short-lived signed URL for private bucket files
   */
  async getSignedUrl(bucket: StorageBucket, path: string, expiresInSeconds = 3600): Promise<string | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
      if (error || !data) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  },

  /**
   * Returns public URL for public discovery buckets
   */
  getPublicUrl(bucket: "property-images" | "property-videos" | "avatars", path: string): string {
    const supabase = createClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Private Owner Document Upload Helper
   * Uploads file to private 'owner-documents' bucket & returns storage path with signed URL
   */
  async uploadOwnerDocument(documentType: string, file: File): Promise<{ path: string; signedUrl: string | null }> {
    const validation = validateFile(file, "owner-documents");
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const authUser = await getCurrentUser();
    if (!authUser) {
      throw new Error("Authentication required to upload owner verification documents.");
    }

    const supabase = createClient();
    const fileExt = (file.name.split(".").pop() || "pdf").toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${authUser.id}/${documentType}/${fileName}`;

    const { data, error } = await supabase.storage.from("owner-documents").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error || !data) {
      throw new Error(error?.message || "Failed to upload owner document to storage.");
    }

    const signedUrl = await this.getSignedUrl("owner-documents", filePath, 3600);
    return { path: filePath, signedUrl };
  },

  /**
   * Property Media Upload Helper (Public Discovery Content)
   */
  async uploadPropertyMedia(
    propertyId: string,
    file: File,
    type: "image" | "video"
  ): Promise<{ path: string; publicUrl: string }> {
    const bucket: StorageBucket = type === "image" ? "property-images" : "property-videos";
    const validation = validateFile(file, bucket);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const authUser = await getCurrentUser();
    if (!authUser) {
      throw new Error("Authentication required to upload property media.");
    }

    const supabase = createClient();
    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${propertyId}/${fileName}`;

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error || !data) {
      throw new Error(error?.message || "Failed to upload property media.");
    }

    const publicUrl = this.getPublicUrl(type === "image" ? "property-images" : "property-videos", filePath);
    return { path: filePath, publicUrl };
  },

  /**
   * Avatar Upload Helper
   */
  async uploadAvatar(file: File): Promise<{ path: string; publicUrl: string }> {
    const validation = validateFile(file, "avatars");
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const authUser = await getCurrentUser();
    if (!authUser) {
      throw new Error("Authentication required to update profile avatar.");
    }

    const supabase = createClient();
    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
    const filePath = `${authUser.id}/avatar.${fileExt}`;

    const { data, error } = await supabase.storage.from("avatars").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error || !data) {
      throw new Error(error?.message || "Failed to upload avatar.");
    }

    const publicUrl = this.getPublicUrl("avatars", filePath);
    return { path: filePath, publicUrl };
  },
};
