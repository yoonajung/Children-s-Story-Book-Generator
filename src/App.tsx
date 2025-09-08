import React, { useMemo, useRef, useState } from "react";
import "./index.css";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Lang = "ko" | "en";

export default function App() {
  // --- UI 상태 ---
  const [lang, setLang] = useState<Lang>("ko");
  const [mainCharacter, setMainCharacter] = useState("");
  const [setting, setSetting] = useState("");
  const [plot, setPlot] = useState("");
  const [lesson, setLesson] = useState("");
  const [artStyle, setArtStyle] = useState("storybook illustration");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState("");
  const storyRef = useRef<HTMLDivElement | null>(null);

  // --- Gemini 클라이언트 ---
  const genAI = useMemo(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    return new GoogleGenerativeAI(apiKey);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 간단한 입력 검증
    if (!mainCharacter || !setting || !plot || !lesson) {
      setError(lang === "ko" ? "모든 입력 칸을 채워주세요." : "Please fill in all fields.");
      return;
    }

    // 브라우저에서 키가 없는 경우 예외 처리
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setError(
        lang === "ko"
          ? "API 키가 설정되지 않았습니다. 루트의 .env.local에 VITE_GEMINI_API_KEY를 설정하세요."
          : "Missing API key. Please set VITE_GEMINI_API_KEY in .env.local."
      );
      return;
    }

    setLoading(true);
    setStory("");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const promptKo = `
다음 정보로 6~10문단 분량의 어린이 그림 동화책 텍스트를 만들어주세요.
- 주인공: ${mainCharacter}
- 배경: ${setting}
- 줄거리: ${plot}
- 교훈: ${lesson}
- 그림 스타일(참고): ${artStyle}

요구사항:
- 6~10개의 "짧은 단락"으로 나눠 주세요.
- 각 단락은 1~3문장으로 간결하게.
- 5~8세 어린이가 이해할 수 있는 쉬운 표현.
- 마지막 단락에는 교훈을 자연스럽게 다시 한 번 상기.
- 출력은 텍스트만 주세요(마크다운/번호 불필요).
      `.trim();

      const promptEn = `
Create a 6–10 paragraph children's picture story based on:
- Main character: ${mainCharacter}
- Setting: ${setting}
- Plot: ${plot}
- Lesson: ${lesson}
- Art style (reference): ${artStyle}

Requirements:
- 6–10 short paragraphs, each 1–3 sentences.
- Simple wording suitable for ages 5–8.
- Gently restate the lesson in the final paragraph.
- Output plain text (no markdown, no numbering).
      `.trim();

      const prompt = lang === "ko" ? promptKo : promptEn;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setStory(text);

      // 스토리 영역으로 스크롤
      setTimeout(() => {
        storyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err: any) {
      console.error(err);
      setError(
        lang === "ko"
          ? `생성 중 오류가 발생했습니다: ${err?.message ?? "알 수 없는 오류"}`
          : `Generation failed: ${err?.message ?? "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">나만의 그림동화책 생성기</h1>

      <div className="content-wrapper">
        {/* 폼 */}
        <div className="form-container">
          <form className="story-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label>언어 선택 (Language)</label>
              <div className="lang-selector-buttons">
                <button
                  type="button"
                  className={lang === "ko" ? "active" : ""}
                  onClick={() => setLang("ko")}
                >
                  한국어
                </button>
                <button
                  type="button"
                  className={lang === "en" ? "active" : ""}
                  onClick={() => setLang("en")}
                >
                  English
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="main-character">주인공 (Main Character)</label>
              <input
                id="main-character"
                placeholder={lang === "ko" ? "예: 용감한 토끼" : "e.g., Brave Rabbit"}
                value={mainCharacter}
                onChange={(e) => setMainCharacter(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="setting">배경 (Setting)</label>
              <input
                id="setting"
                placeholder={lang === "ko" ? "예: 마법의 숲" : "e.g., Enchanted Forest"}
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="plot">줄거리 (Plot)</label>
              <input
                id="plot"
                placeholder={lang === "ko" ? "예: 잃어버린 보물을 찾아서" : "e.g., A quest for a lost treasure"}
                value={plot}
                onChange={(e) => setPlot(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lesson">교훈 (Lesson)</label>
              <input
                id="lesson"
                placeholder={lang === "ko" ? "예: 우정의 중요성" : "e.g., The importance of friendship"}
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                required
              />
            </div>

            <div className="form-group art-style-group">
              <label htmlFor="art-style">그림 스타일 (Art Style)</label>
              <select
                id="art-style"
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value)}
              >
                <option value="storybook illustration">동화책 삽화</option>
                <option value="disney pixar animation style">디즈니/픽사 스타일</option>
                <option value="ghibli studio anime style">지브리 스튜디오 스타일</option>
                <option value="watercolor painting">수채화</option>
                <option value="crayon drawing">크레용 그림</option>
                <option value="claymation">클레이 애니메이션</option>
              </select>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small" aria-hidden="true" />
                  {lang === "ko" ? "생성 중..." : "Generating..."}
                </>
              ) : (
                <>{lang === "ko" ? "동화책 만들기!" : "Create Story!"}</>
              )}
            </button>

            {error && <div className="error-message">{error}</div>}
          </form>
        </div>

        {/* 결과 영역 */}
        <div
          ref={storyRef}
          className="storybook-container"
          style={{ display: story ? "flex" : "none" }}
        >
          <div className="storybook-page">
            <div className="story-content">
              {story.split(/\n{2,}/).map((para, i) => (
                <p key={i} style={{ marginBottom: "1rem" }}>
                  {para.trim()}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
