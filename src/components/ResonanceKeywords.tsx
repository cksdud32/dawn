"use client";

import { useState, useRef, KeyboardEvent } from "react";

const MAX_KEYWORDS = 5;
const MAX_KEYWORD_LENGTH = 15;

interface Props {
  keywords: string[];
  onChange: (keywords: string[]) => void;
}

export default function ResonanceKeywords({ keywords, onChange }: Props) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addKeyword() {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length > MAX_KEYWORD_LENGTH) return;
    if (keywords.length >= MAX_KEYWORDS) return;
    if (keywords.includes(trimmed)) {
      setInput("");
      return;
    }
    onChange([...keywords, trimmed]);
    setInput("");
  }

  function removeKeyword(kw: string) {
    onChange(keywords.filter((k) => k !== kw));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
    if (e.key === "Backspace" && !input && keywords.length > 0) {
      removeKeyword(keywords[keywords.length - 1]);
    }
  }

  const isFull = keywords.length >= MAX_KEYWORDS;

  return (
    <div className="space-y-10">
      {/* 질문 */}
      <div className="space-y-3 text-center">
        <p className="text-fg3 text-base font-light" style={{ fontStyle: "italic", letterSpacing: "0.02em" }}>
          다 쓰고 나면, 무엇이 남을 것 같으세요?
        </p>
        <p className="text-fg5 text-xs leading-relaxed">
          원문은 사라지고, 당신이 고른 단어만
          <br />
          2주 동안 잔향에 머물다 없어집니다.
        </p>
      </div>

      {/* 입력한 키워드 목록 */}
      {keywords.length > 0 && (
        <ul className="space-y-4 pt-2">
          {keywords.map((kw, i) => (
            <li
              key={kw}
              className="flex items-center justify-between group"
              style={{
                opacity: 1 - i * 0.08,
                transition: "opacity 0.4s ease",
              }}
            >
              <span className="text-fg2 text-sm font-light tracking-wide">{kw}</span>
              <button
                type="button"
                onClick={() => removeKeyword(kw)}
                className="text-fg5 hover:text-fg3 text-base leading-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 pl-6"
                aria-label={`${kw} 삭제`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 구분선 */}
      {keywords.length > 0 && (
        <div className="border-t border-line" />
      )}

      {/* 입력창 */}
      {!isFull ? (
        <div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_KEYWORD_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder={keywords.length === 0 ? "단어 하나… (Enter 로 추가)" : "또 다른 단어…"}
            className="w-full bg-transparent border-b border-line text-fg2 placeholder-fg5 text-sm py-2.5 focus:outline-none focus:border-fg4 transition-colors duration-300 font-light"
          />
        </div>
      ) : (
        <p className="text-fg5 text-xs text-center">
          최대 {MAX_KEYWORDS}개까지 남길 수 있습니다.
        </p>
      )}

      {/* 카운트 */}
      <div className="flex justify-end">
        <span className="text-fg5 text-xs tabular-nums">{keywords.length} / {MAX_KEYWORDS}</span>
      </div>
    </div>
  );
}
