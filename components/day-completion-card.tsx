"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, CheckCircle2, Sparkles, X } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";

interface DayCompletionCardProps {
  isOpen: boolean;
  onClose: () => void;
  completedCount: number;
}

export function DayCompletionCard({
  isOpen,
  onClose,
  completedCount,
}: DayCompletionCardProps) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Big celebration confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
      };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: NodeJS.Timeout = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleDownload = async () => {
    const element = document.getElementById("daypiece-summary-card");
    if (!element) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `daypiece-summary-${format(new Date(), "yyyy-MM-dd")}.png`;
      link.click();
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-transparent border-none shadow-none sm:max-w-md">
        <div className="relative flex flex-col items-center">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* The Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            id="daypiece-summary-card"
            className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />

            <div className="relative text-center space-y-6">
              <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-full ring-4 ring-white/10">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  하루 조각 완성!
                </h2>
                <div className="w-12 h-1 bg-white/30 mx-auto rounded-full" />
                <p className="text-blue-100 font-medium pt-2">
                  {format(new Date(), "M월 d일 EEEE", { locale: ko })}
                </p>
              </div>

              <div className="py-6">
                <div className="text-6xl font-extrabold flex items-center justify-center gap-2">
                  <span>{completedCount}</span>
                  <span className="text-base font-normal text-blue-200 mt-4">
                    조각
                  </span>
                </div>
                <p className="text-sm text-blue-100 mt-2">
                  오늘의 계획을 모두 완료했어요
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-sm text-blue-50 font-medium">
                &quot;작은 성취가 모여
                <br />
                위대한 하루를 만듭니다.&quot;
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-blue-200">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Daypiece</span>
                </div>
                <span>@daypiece_kr</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 w-full">
            <Button
              className="flex-1 bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? "저장 중..." : "이미지로 저장"}
            </Button>
            <Button
              className="flex-1 bg-blue-600 border border-blue-500 hover:bg-blue-700"
              onClick={() => {
                // Share implementation or just copy text
                navigator.clipboard.writeText(
                  `오늘 하루조각 ${completedCount}개 완성! #daypiece`,
                );
                alert("공유 텍스트가 복사되었습니다!");
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              공유하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
