"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

export function TermsModal({ isOpen, onClose }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] p-0 overflow-hidden bg-white dark:bg-zinc-900 border-none shadow-2xl flex flex-col">
        <DialogHeader className="px-6 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shrink-0">
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            서비스 이용약관
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            Vibe Todo 서비스를 이용해 주셔서 감사합니다. 아래 내용을 확인해
            주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          <div className="space-y-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            <section className="space-y-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                제1조 (목적)
              </h3>
              <p>
                본 약관은 Vibe Todo(이하 &quot;회사&quot;)가 제공하는 모든
                서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 이용자와
                회사의 권리, 의무, 책임사항 및 기타 필요한 사항을 규정함을
                목적으로 합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                제2조 (용어의 정의)
              </h3>
              <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
              <ul className="list-disc pl-5 space-y-1 marker:text-zinc-400">
                <li>
                  &quot;서비스&quot;란 단말기(PC, 휴대형단말기 등 각종 유무선
                  장치를 포함)와 상관없이 회원이 이용할 수 있는 Vibe Todo 관련
                  제반 서비스를 의미합니다.
                </li>
                <li>
                  &quot;회원&quot;이란 회사의 서비스에 접속하여 이 약관에 따라
                  회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는
                  고객을 말합니다.
                </li>
                <li>
                  &quot;아이디(ID)&quot;란 회원의 식별과 서비스 이용을 위하여
                  회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                제3조 (약관의 게시와 개정)
              </h3>
              <p>
                1. 회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기
                화면에 게시합니다.
                <br />
                2. 회사는 &quot;약관의 규제에 관한 법률&quot;, &quot;정보통신망
                이용촉진 및 정보보호 등에 관한 법률&quot; 등 관련법을 위배하지
                않는 범위에서 이 약관을 개정할 수 있습니다.
                <br />
                3. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여
                현행약관과 함께 제1항의 방식에 따라 적용일자 7일 전부터 적용일자
                전일까지 공지합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                제4조 (서비스의 제공 등)
              </h3>
              <p>
                회사는 회원에게 아래와 같은 서비스를 제공합니다.
                <br />
                1. 할 일(Todo) 관리 및 기록 서비스
                <br />
                2. 캘린더 연동 및 일정 관리 서비스
                <br />
                3. 통계 및 리포트 서비스
                <br />
                4. 기타 회사가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해
                회원에게 제공하는 일체의 서비스
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                제5조 (계약 해지 및 이용 제한)
              </h3>
              <p>
                회원은 언제든지 서비스 내 &quot;설정&quot; 화면을 통하여
                이용계약 해지 신청을 할 수 있으며, 회사는 관련법 등이 정하는
                바에 따라 이를 즉시 처리하여야 합니다.
              </p>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PrivacyModal({ isOpen, onClose }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] p-0 overflow-hidden bg-white dark:bg-zinc-900 border-none shadow-2xl flex flex-col">
        <DialogHeader className="px-6 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shrink-0">
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            개인정보처리방침
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            Vibe Todo는 회원의 개인정보를 소중히 다루며, 안전하게 보호합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          <div className="space-y-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            <section className="space-y-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                1. 개인정보의 처리 목적
              </h3>
              <p>
                회사는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의
                목적 이외의 용도로는 이용하지 않습니다.
              </p>
              <ul className="list-disc pl-5 space-y-1 marker:text-zinc-400">
                <li>회원 가입 및 관리</li>
                <li>서비스 제공 및 개선</li>
                <li>고객 상담 및 민원 처리</li>
                <li>마케팅 및 광고 활용 (동의 시)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                2. 수집하는 개인정보 항목
              </h3>
              <p>
                회사는 서비스 가입 및 이용 시 아래와 같은 개인정보를 수집하고
                있습니다.
              </p>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  필수 수집 항목
                </p>
                <ul className="list-disc pl-5 space-y-1 marker:text-zinc-400 text-xs">
                  <li>이메일 주소</li>
                  <li>닉네임(이름)</li>
                  <li>프로필 이미지(선택 설정 시)</li>
                  <li>소셜 로그인 정보(제공자 ID)</li>
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                3. 개인정보의 보유 및 이용기간
              </h3>
              <p>
                회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당
                정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할
                필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한
                기간 동안 회원정보를 보관합니다.
              </p>
              <ul className="list-disc pl-5 space-y-1 marker:text-zinc-400">
                <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                4. 개인정보의 파기절차 및 방법
              </h3>
              <p>
                회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당
                정보를 지체 없이 파기합니다. 파기절차 및 방법은 다음과 같습니다.
              </p>
              <p className="mt-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded text-zinc-500 dark:text-zinc-400">
                전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을
                사용하여 삭제합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                5. 이용자의 권리 및 행사방법
              </h3>
              <p>
                이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나
                수정할 수 있으며 가입해지를 요청할 수도 있습니다. 개인정보
                관리책임자에게 서면, 전화 또는 이메일로 연락하시면 지체 없이
                조치하겠습니다.
              </p>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
