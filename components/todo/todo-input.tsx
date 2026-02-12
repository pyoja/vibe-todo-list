"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Loader2,
  Calendar as CalendarIcon,
  Folder as FolderIcon,
  Inbox,
  Check,
  ImagePlus,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { type Folder } from "@/app/actions/folder";
import { uploadImage } from "@/app/actions/image";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";

export interface TodoInputMeta {
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  folderId?: string | null;
  // by jh 20260210: 이미지 URL 추가
  imageUrl?: string | null;
}

interface TodoInputProps {
  onAdd: (formData: FormData, meta: TodoInputMeta) => void;
  isPending: boolean;
  view: "list" | "calendar";
  selectedDate?: Date;
  defaultPriority?: "low" | "medium" | "high";
  folders: Folder[];
  defaultFolderId?: string;
}

export function TodoInput({
  onAdd,
  isPending,
  view,
  selectedDate,
  defaultPriority = "medium",
  folders,
  defaultFolderId,
}: TodoInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    defaultPriority,
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const [selectedFolderId, setSelectedFolderId] = useState<
    string | "inbox" | null
  >(defaultFolderId || "inbox");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // by jh 20260210: 이미지 압축 중 상태
  const [isCompressing, setIsCompressing] = useState(false);

  // Update selected folder when prop changes (navigation)
  useEffect(() => {
    const newFolderId = defaultFolderId || "inbox";
    if (selectedFolderId !== newFolderId) {
      setSelectedFolderId(newFolderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFolderId]);

  // Global Shortcut: Ctrl + N to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = async (formData: FormData) => {
    // by jh 20260210: 이미지 업로드 처리
    let imageUrl: string | null = null;
    if (selectedFile) {
      setIsUploading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        // by jh 20260210: 업로드 중 토스트 표시
        const toastId = toast.loading("📷 이미지 업로드 중...");
        imageUrl = await uploadImage(uploadFormData);
        toast.dismiss(toastId);
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.error("이미지 업로드에 실패했습니다.");
      } finally {
        setIsUploading(false);
      }
    }

    // Pass local state as metadata to parent
    onAdd(formData, {
      priority,
      dueDate,
      folderId: selectedFolderId === "inbox" ? null : selectedFolderId,
      imageUrl,
    });

    // Reset local state
    setPriority("medium");
    setDueDate(undefined);
    setSelectedFolderId(defaultFolderId || "inbox");
    setImagePreview(null);
    setSelectedFile(null);

    formRef.current?.reset();
  };

  // by jh 20260210: 이미지 선택 및 클라이언트 압축
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    try {
      // by jh 20260210: 압축 시작 즉시 로딩 표시
      setIsCompressing(true);
      // by jh 20260210: 클라이언트 측 이미지 압축 (maxSizeMB: 1, maxWidthOrHeight: 1920)
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      setSelectedFile(compressed);
      const previewUrl = URL.createObjectURL(compressed);
      setImagePreview(previewUrl);
    } catch (error) {
      console.error("Image compression failed:", error);
      toast.error("이미지 처리에 실패했습니다.");
    } finally {
      setIsCompressing(false);
    }

    // by jh 20260210: input 초기화 (동일 파일 재선택 가능)
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setSelectedFile(null);
  };

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <div className="relative group z-10">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
      <form
        ref={formRef}
        action={handleSubmit}
        className="relative flex flex-col gap-4 bg-gradient-to-br from-white to-blue-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/80 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/70 shadow-lg dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3),0_8px_30px_rgba(0,0,0,0.4)] group-hover:border-blue-400/40 dark:group-hover:border-blue-500/50 transition-all duration-300"
      >
        <Input
          ref={inputRef}
          name="content"
          placeholder={
            view === "calendar" && selectedDate
              ? `${format(selectedDate, "M월 d일", { locale: ko })} 오늘의 조각 ✨`
              : "오늘의 조각"
          }
          className="border-0 focus-visible:ring-0 bg-transparent text-base sm:text-xl font-medium pl-3 min-h-[60px] placeholder:text-zinc-400 dark:placeholder:text-zinc-300 selection:bg-blue-100 dark:selection:bg-blue-900 placeholder:font-normal text-zinc-900 dark:text-zinc-100"
          autoComplete="off"
          disabled={isPending}
        />

        {/* by jh 20260210: 이미지 압축 중 로딩 or 미리보기 */}
        {isCompressing && (
          <div className="px-3 pb-2">
            <div className="w-20 h-20 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          </div>
        )}
        {imagePreview && !isCompressing && (
          <div className="px-3 pb-2">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="미리보기"
                className="w-20 h-20 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* by jh 20260210: 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50 gap-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={priority}
              onValueChange={(v: string) =>
                setPriority(v as "low" | "medium" | "high")
              }
            >
              <SelectTrigger className="h-7 border-transparent bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs gap-1.5 px-2.5 rounded-full transition-colors focus:ring-0 text-zinc-900 dark:text-zinc-200">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    priority === "high"
                      ? "bg-red-500"
                      : priority === "medium"
                        ? "bg-blue-500"
                        : "bg-slate-400",
                  )}
                />
                <SelectValue placeholder="중요도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">낮음</SelectItem>
                <SelectItem value="medium">보통</SelectItem>
                <SelectItem value="high">높음</SelectItem>
              </SelectContent>
            </Select>

            {/* Folder Selection Popover */}
            <Popover open={isFolderOpen} onOpenChange={setIsFolderOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2.5 text-xs rounded-full bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300",
                    selectedFolderId !== "inbox" &&
                      "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
                  )}
                >
                  {selectedFolderId === "inbox" ? (
                    <>
                      <Inbox className="w-3.5 h-3.5 mr-1.5" />
                      폴더
                    </>
                  ) : (
                    <>
                      <FolderIcon className="w-3.5 h-3.5 mr-1.5" />
                      <span className="truncate max-w-[60px] sm:max-w-[80px]">
                        {selectedFolder?.name}
                      </span>
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="폴더 검색..." />
                  <CommandList>
                    <CommandEmpty>폴더가 없습니다.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="inbox"
                        onSelect={() => {
                          setSelectedFolderId("inbox");
                          setIsFolderOpen(false);
                        }}
                      >
                        <Inbox className="mr-2 h-4 w-4" />
                        <span>폴더 (미지정)</span>
                        {selectedFolderId === "inbox" && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                      {folders.map((folder) => (
                        <CommandItem
                          key={folder.id}
                          value={folder.name}
                          onSelect={() => {
                            setSelectedFolderId(folder.id);
                            setIsFolderOpen(false);
                          }}
                        >
                          <FolderIcon
                            className={`mr-2 h-4 w-4 text-${folder.color}`}
                          />
                          <span>{folder.name}</span>
                          {selectedFolderId === folder.id && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* by jh 20260210: Date Picker - 캘린더 뷰에서도 마감일 피커 표시 */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2.5 text-xs rounded-full bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300",
                    dueDate &&
                      "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
                  )}
                >
                  <CalendarIcon className={cn("w-3.5 h-3.5 mr-1.5")} />
                  {dueDate ? format(dueDate, "M.d", { locale: ko }) : "마감일"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-3 text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-105 shrink-0 ml-auto sm:ml-0"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : (
              <Plus className="w-3.5 h-3.5 mr-1" />
            )}
            추가
          </Button>
        </div>
      </form>
    </div>
  );
}
