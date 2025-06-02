import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function uploadToSupabase(file: File | null, folder: string, userId: string) {
  if (!file) {
    throw new Error("Aucun fichier fourni");
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase();
  if (!fileExt) {
    throw new Error("Extension de fichier non détectée");
  }

  const filePath = `${folder}/${userId}_${Date.now()}.${fileExt}`;

  try {
    const { data, error } = await supabase.storage
      .from("gestionnaire")
      .upload(filePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (error) {
      throw new Error(`Erreur lors du téléversement : ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("gestionnaire")
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Impossible de générer l'URL publique");
    }

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Erreur dans uploadToSupabase:", error);
    throw error;
  }
}