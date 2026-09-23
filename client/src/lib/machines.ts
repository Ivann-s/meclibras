import { supabase } from "./supabase";

export async function getPublishedMachines() {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { data, error } = await supabase
    .from("machines")
    .select(
      `
      id,
      name,
      slug,
      item_type,
      description,
      instructions,
      content_type,
      text_content,
      video_url,
      subtitle_url,
      status,
      machine_profile_id
      `
    )
    .eq("status", "published")
    .order("name");

  if (error) throw error;

  return data ?? [];
}

export async function getMachineProfiles() {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { data, error } = await supabase
    .from("machine_profiles")
    .select(`
      id,
      name,
      slug,
      category,
      description,
      status,
      created_at,
      updated_at
    `)
    .eq("status", "published")
    .order("name");

  if (error) throw error;

  return data ?? [];
}

export async function createMachineProfile(input: {
  name: string;
  slug: string;
  category?: string;
  description?: string;
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
    .from("machine_profiles")
    .insert({
      name: input.name.trim(),
      slug: input.slug.trim(),
      category: input.category?.trim() || null,
      description: input.description?.trim() || null,
      created_by: user.id,
      status: "published",
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateMachineProfile(
  id: string,
  input: {
    name: string;
    category?: string;
    description?: string;
  },
) {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { data, error } = await supabase
    .from("machine_profiles")
    .update({
      name: input.name.trim(),
      category: input.category?.trim() || null,
      description: input.description?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function uploadMachineVideo(slug: string, file: File) {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const extension =
    file.name.split(".").pop()?.toLowerCase() || "mp4";

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
      `
      id,
      name,
      slug,
      item_type,
      description,
      instructions,
      content_type,
      text_content,
      video_url,
      subtitle_url,
      status,
      machine_profile_id
      `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) throw error;

  return data;
}

export async function createMachine(input: {
  name: string;
  slug: string;
  item_type: string;
  description?: string;
  instructions?: string;
  machine_profile_id?: string | null;
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
      name: input.name,
      slug: input.slug,
      item_type: input.item_type,
      description: input.description || null,
      instructions: input.instructions || null,
      machine_profile_id: input.machine_profile_id || null,
      created_by: user.id,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateMachine(
  id: string,
  input: {
    name: string;
    item_type: string;
    description: string;
    content_type: "video" | "text";
    text_content?: string | null;
    machine_profile_id?: string | null;
  },
) {
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { data, error } = await supabase
    .from("machines")
    .update({
      name: input.name.trim(),
      item_type: input.item_type,
      description: input.description.trim(),
      content_type: input.content_type,
      text_content:
        input.content_type === "text"
          ? input.text_content?.trim() || null
          : null,
      machine_profile_id: input.machine_profile_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(
      `
      id,
      name,
      slug,
      item_type,
      description,
      instructions,
      content_type,
      text_content,
      video_url,
      subtitle_url,
      status,
      machine_profile_id
      `
    )
    .single();

  if (error) throw error;

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

  const { data, error } = await supabase
    .from("suggestions")
    .insert({
      machine_id: input.machineId || null,
      message: input.message.trim(),
      user_name: input.userName?.trim() || null,
      user_contact: input.userContact?.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
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