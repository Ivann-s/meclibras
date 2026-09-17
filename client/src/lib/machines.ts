import { supabase } from "./supabase";

export async function getPublishedMachines() {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { data, error } = await supabase
    .from("machines")
    .select(
      "id, name, slug, item_type, description, instructions, video_url, subtitle_url, status"
    )
    .eq("status", "published")
    .order("name");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function uploadMachineVideo(slug: string, file: File) {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const path = `${slug}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("videos-libras")
    .upload(path, file, {
      contentType: file.type || "video/mp4",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: publicData } = supabase.storage
    .from("videos-libras")
    .getPublicUrl(path);

  const { data, error } = await supabase
    .from("machines")
    .update({
      video_path: path,
      video_url: publicData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw error;

  return data;
}


export async function getMachineBySlug(slug: string) {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { data, error } = await supabase
    .from("machines")
    .select(
      "id, name, slug, item_type, description, instructions, video_url, subtitle_url, status"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createMachine(input: {
  name: string;
  slug: string;
  item_type: string;
  description?: string;
  instructions?: string;
}) {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Faça login como administrador.");
  }

  const { data, error } = await supabase
    .from("machines")
    .insert({
      ...input,
      created_by: user.id,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
export async function createSuggestion(input: {
  machineId?: string;
  message: string;
  userName?: string;
  userContact?: string;
}) {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase
    .from("suggestions")
    .insert({
      machine_id: input.machineId || null,
      message: input.message.trim(),
      user_name: input.userName?.trim() || null,
      user_contact: input.userContact?.trim() || null,
    });

  if (error) {
    throw error;
  }
}

export async function getSuggestions() {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { data, error } = await supabase
    .from("suggestions")
    .select(
      "id, message, user_name, user_contact, status, created_at, machine_id, machines(name, slug)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateSuggestionStatus(
  id: string,
  status: "new" | "read" | "resolved",
) {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase
    .from("suggestions")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}
