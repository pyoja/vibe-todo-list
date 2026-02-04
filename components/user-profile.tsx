"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  User as UserIcon,
  Settings,
  Loader2,
  Bell,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateProfileName,
  getNotificationSettings,
  updateNotificationSettings,
} from "@/app/actions/user";

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const router = useRouter();
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [isUpdating, setIsUpdating] = useState(false);

  // Notification Settings State
  const [pushEnabled, setPushEnabled] = useState(false);
  const [morningTime, setMorningTime] = useState("08:00");
  const [eveningTime, setEveningTime] = useState("22:00");
  const [weekendDnd, setWeekendDnd] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Load settings when dialog opens
  useEffect(() => {
    if (isProfileOpen) {
      const loadSettings = async () => {
        setIsLoadingSettings(true);
        try {
          const settings = await getNotificationSettings();
          setPushEnabled(settings.pushEnabled);
          setMorningTime(settings.morningTime || "08:00");
          setEveningTime(settings.eveningTime || "22:00");
          setWeekendDnd(settings.weekendDnd);
        } catch (error) {
          console.error(error);
          toast.error("설정을 불러오는데 실패했습니다.");
        } finally {
          setIsLoadingSettings(false);
        }
      };
      loadSettings();
    }
  }, [isProfileOpen]);

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    } finally {
      setIsSignOutLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      // 1. Update Name
      if (name !== user.name) {
        await updateProfileName(name);
      }

      // 2. Update Settings
      await updateNotificationSettings({
        pushEnabled,
        morningTime,
        eveningTime,
        weekendDnd,
      });

      toast.success("프로필이 업데이트되었습니다.");
      router.refresh(); // Refresh to update name in Header/Sidebar
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("프로필 업데이트에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Get initials
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
              <AvatarImage src={user.image || ""} alt={name} />
              <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>프로필 편집</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>설정</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
          >
            {isSignOutLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            <span>로그아웃</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>프로필 편집</DialogTitle>
            <DialogDescription>
              사용자 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          {isLoadingSettings ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="name"
                  className="text-right text-sm font-medium"
                >
                  이름
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="email"
                  className="text-right text-sm font-medium"
                >
                  이메일
                </label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="col-span-3 opacity-70 bg-slate-100 dark:bg-zinc-800"
                />
              </div>

              {/* Notification Settings Section */}
              <div className="border-t pt-4 mt-2">
                <h4 className="mb-4 text-sm font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4" /> 알림 설정
                </h4>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="pushEnabled"
                      className="text-sm font-medium cursor-pointer"
                    >
                      푸시 알림 받기
                    </label>
                    <Checkbox
                      id="pushEnabled"
                      checked={pushEnabled}
                      onCheckedChange={(checked) =>
                        setPushEnabled(checked as boolean)
                      }
                    />
                  </div>

                  {pushEnabled && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label
                          htmlFor="morningTime"
                          className="text-right text-sm text-muted-foreground"
                        >
                          모닝 브리핑
                        </label>
                        <Input
                          id="morningTime"
                          type="time"
                          value={morningTime}
                          onChange={(e) => setMorningTime(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label
                          htmlFor="eveningTime"
                          className="text-right text-sm text-muted-foreground"
                        >
                          저녁 회고
                        </label>
                        <Input
                          id="eveningTime"
                          type="time"
                          value={eveningTime}
                          onChange={(e) => setEveningTime(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="weekendDnd"
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          주말에는 알림 끄기
                        </label>
                        <Checkbox
                          id="weekendDnd"
                          checked={weekendDnd}
                          onCheckedChange={(checked) =>
                            setWeekendDnd(checked as boolean)
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateProfile} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
