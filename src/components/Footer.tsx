export function Footer() {
  return (
    <footer className="border-t border-line mt-16 py-10">
      <div className="max-w-xl mx-auto px-4 space-y-3 text-center">
        <p className="text-xs text-fg4 leading-relaxed">
          새벽 00:00~05:00에 익명으로 감정을 기록하고, 아침 06:00에 모두에게 공개됩니다.
          <br />
          댓글은 공개 후 2일간 작성 가능하며 (새벽 시간 제외), 모든 기록은 7일 후 자동 삭제됩니다.
        </p>
        <p className="text-xs text-fg5">
          문의 ·{" "}
          <a
            href="https://instagram.com/cksdud3"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg3 transition-colors underline underline-offset-2"
          >
            Instagram @cksdud3
          </a>
        </p>
        <p className="text-xs text-fg5">© 2026 dawn · cksdud3. All rights reserved.</p>
      </div>
    </footer>
  );
}