"use server";

import { PromptVisibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function registerUser(
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email e senha são obrigatórios." };
  if (password.length < 6) return { error: "Senha deve ter pelo menos 6 caracteres." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email já cadastrado." };

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name: name || null, email, password: hashed },
  });

  return { success: true };
}

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  return user;
}

async function uniquePromptSlug(userId: string, title: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let index = 2;

  while (
    await prisma.prompt.findUnique({
      where: {
        userId_slug: {
          userId,
          slug,
        },
      },
      select: {
        id: true,
      },
    })
  ) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return slug;
}

async function categoryFromForm(userId: string, categoryName: string) {
  const name = categoryName.trim();

  if (!name) {
    return null;
  }

  const slug = slugify(name);

  return prisma.category.upsert({
    where: {
      userId_slug: {
        userId,
        slug,
      },
    },
    update: {
      name,
    },
    create: {
      name,
      slug,
      userId,
    },
  });
}

async function tagConnections(rawTags: string) {
  const tags = rawTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);

  const uniqueTags = Array.from(new Set(tags.map((tag) => tag.toLowerCase())));

  return Promise.all(
    uniqueTags.map(async (tag) => {
      const slug = slugify(tag);
      const savedTag = await prisma.tag.upsert({
        where: {
          slug,
        },
        update: {
          name: tag,
        },
        create: {
          name: tag,
          slug,
        },
      });

      return {
        tagId: savedTag.id,
      };
    }),
  );
}

export async function createPrompt(formData: FormData) {
  const user = await requireUser();
  const title = requiredString(formData, "title");
  const content = requiredString(formData, "content");
  const description = String(formData.get("description") ?? "").trim();
  const categoryName = String(formData.get("category") ?? "");
  const rawTags = String(formData.get("tags") ?? "");
  const visibility = String(formData.get("visibility") ?? "PRIVATE") as PromptVisibility;
  const category = await categoryFromForm(user.id, categoryName);
  const tagIds = await tagConnections(rawTags);
  const slug = await uniquePromptSlug(user.id, title);

  await prisma.prompt.create({
    data: {
      title,
      slug,
      content,
      description: description || null,
      visibility: Object.values(PromptVisibility).includes(visibility)
        ? visibility
        : PromptVisibility.PRIVATE,
      userId: user.id,
      categoryId: category?.id,
      tags: {
        create: tagIds,
      },
    },
  });

  revalidatePath("/");
  redirect("/");
}

export async function deletePrompt(formData: FormData) {
  const user = await requireUser();
  const id = requiredString(formData, "id");

  await prisma.prompt.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/");
}

export async function toggleFavorite(formData: FormData) {
  const user = await requireUser();
  const id = requiredString(formData, "id");
  const isFavorite = requiredString(formData, "isFavorite") === "true";

  await prisma.prompt.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: {
      isFavorite: !isFavorite,
    },
  });

  revalidatePath("/");
}

export async function setVisibility(formData: FormData) {
  const user = await requireUser();
  const id = requiredString(formData, "id");
  const visibility = requiredString(formData, "visibility") as PromptVisibility;

  await prisma.prompt.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: {
      visibility: Object.values(PromptVisibility).includes(visibility)
        ? visibility
        : PromptVisibility.PRIVATE,
    },
  });

  revalidatePath("/");
}
