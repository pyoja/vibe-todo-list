"use server";

// by jh 20260210: 이미지 업로드/삭제 서버 액션

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "todo-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // by jh 20260210: 5MB 제한

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

// by jh 20260210: Supabase Storage에 이미지 업로드 후 공개 URL 반환
export async function uploadImage(formData: FormData): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("파일이 선택되지 않았습니다.");

  // by jh 20260210: 파일 크기 서버 측 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("파일 크기가 5MB를 초과합니다.");
  }

  // by jh 20260210: 이미지 파일만 허용
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  const supabase = await createClient();

  const ext = file.name.split(".").pop() || "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  // by jh 20260210: 충돌 방지를 위한 고유 파일명 (userId/timestamp-random.ext)
  const filePath = `${session.user.id}/${timestamp}-${random}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Failed to upload image:", error);
    throw new Error("이미지 업로드에 실패했습니다.");
  }

  // by jh 20260210: 공개 URL 반환
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// by jh 20260210: Storage에서 이미지 삭제
export async function deleteImage(imageUrl: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const supabase = await createClient();

    // by jh 20260210: URL에서 파일 경로 추출
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(
      `/storage/v1/object/public/${BUCKET_NAME}/`,
    );
    if (pathParts.length < 2) return;

    const filePath = decodeURIComponent(pathParts[1]);

    // by jh 20260210: 자신의 파일만 삭제 가능 (userId prefix 확인)
    if (!filePath.startsWith(session.user.id)) {
      throw new Error("권한이 없습니다.");
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Failed to delete image:", error);
      throw new Error("이미지 삭제에 실패했습니다.");
    }
  } catch (error) {
    console.error("Failed to delete image:", error);
    throw new Error("이미지 삭제에 실패했습니다.");
  }
}
