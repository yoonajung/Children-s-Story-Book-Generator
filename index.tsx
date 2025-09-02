/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Type } from '@google/genai';
import { useState, useCallback, useRef, Fragment, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// Replaced MagicWandIcon with PencilIcon for a clearer, cuter look.
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M21.73,3.37a2,2,0,0,0-2.83,0l-1.42,1.42,2.83,2.83,1.42-1.42a2,2,0,0,0,0-2.83ZM2,18.25V21H4.75l11-11L12.92,7.17Zm17.83-9.58L6.17,17.33H12v2H2V13h2v4.83l8.67-8.66Z"/>
  </svg>
);

const SpeakerOnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M3,9v6h4l5,5V4L7,9H3z M16.5,12c0-1.77-1-3.29-2.5-4.03v8.05C15.5,15.29,16.5,13.77,16.5,12z M14,3.23v2.06c2.89,0.86,5,3.54,5,6.71s-2.11,5.85-5,6.71v2.06c4.01-0.91,7-4.49,7-8.77S18.01,4.14,14,3.23z"/>
  </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M6 6h12v12H6z"/>
    </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
  </svg>
);


const translations = {
  ko: {
    title: "나만의 그림동화책 생성기",
    languageLabel: "언어",
    childNameLabel: "아이의 이름은 무엇인가요?",
    childNameDefault: "알렉스",
    childAgeLabel: "나이는 몇 살인가요?",
    childAgeDefault: "5",
    favoriteThingsLabel: "가장 좋아하는 것은 무엇인가요?",
    favoriteThingsDefault: "공룡과 우주 로켓",
    submitButton: "나만의 멋진 동화 만들기!",
    submitButtonLoading: "만드는 중...",
    storyPlaceholder: "마법 같은 이야기와 멋진 그림이 여기에 나타날 거예요!",
    readAloudButton: "소리 내어 읽기",
    stopReadingButton: "읽기 중지",
    errorMessage: "문제가 발생했습니다! 다시 시도해 주세요. 오류: ",
    imageAltText: (page: number) => `동화 삽화 페이지 ${page}`,
    pageIndicator: (current: number, total: number) => `${current} / ${total} 페이지`,
    prevButton: "이전",
    nextButton: "다음",
    translateToEnglish: "영어로 번역",
    translateToKorean: "한국어로 번역",
    translatingButton: "번역 중...",
  },
  en: {
    title: "Children's Story Generator",
    languageLabel: "Language",
    childNameLabel: "What is your child's name?",
    childNameDefault: "Alex",
    childAgeLabel: "How old are they?",
    childAgeDefault: "5",
    favoriteThingsLabel: "What are their favorite things?",
    favoriteThingsDefault: "dinosaurs and space rockets",
    submitButton: "Write my Story!",
    submitButtonLoading: "Creating...",
    storyPlaceholder: "Your magical story and a beautiful illustration will appear here!",
    readAloudButton: "Read Aloud",
    stopReadingButton: "Stop Reading",
    errorMessage: "Something went wrong! Please try again. Error: ",
    imageAltText: (page: number) => `Story illustration page ${page}`,
    pageIndicator: (current: number, total: number) => `Page ${current} of ${total}`,
    prevButton: "Prev",
    nextButton: "Next",
    translateToEnglish: "Translate to English",
    translateToKorean: "Translate to Korean",
    translatingButton: "Translating...",
  },
};

const storySchema = {
  type: Type.OBJECT,
  properties: {
    pages: {
      type: Type.ARRAY,
      description: "An array of 3 storybook pages.",
      items: {
        type: Type.OBJECT,
        properties: {
          story_part: {
            type: Type.STRING,
            description: "One part of the story (beginning, middle, or end). Should be about 60-70 words. The hero's name must be in markdown bold.",
          },
          image_prompt: {
            type: Type.STRING,
            description: "A whimsical, vibrant, and cute illustration prompt for a children's storybook, based on the story part.",
          },
        },
        required: ["story_part", "image_prompt"],
      },
    },
  },
  required: ["pages"],
};

const translationSchema = {
    type: Type.ARRAY,
    description: "An array of translated story parts, corresponding to the input array.",
    items: {
        type: Type.STRING,
        description: "A single translated story part."
    }
};

const getPrompt = (language: 'ko' | 'en', childAge: string, childName: string, favoriteThings: string) => {
    if (language === 'ko') {
        return `${childAge}살 **${childName}** 어린이를 위한, 세 부분(시작, 중간, 끝)으로 구성된 짧고 마법 같은 동화책을 만들어주세요. 아이가 가장 좋아하는 것들인 **${favoriteThings}**에 대한 이야기여야 합니다. 흥미진진하고, 나이에 맞는 쉬운 단어를 사용하고, **${childName}** 어린이가 영웅이 되는 행복한 결말로 만들어주세요. **이야기는 반드시 한국어로 작성해야 합니다.** 각 이야기 부분에 대해, 그 내용과 어울리는 어린이 동화책 스타일의 기발하고 생생하며 귀여운 삽화를 생성할 수 있는 이미지 프롬프트도 함께 제공해주세요. 아이의 이름이 나올 때마다 마크다운 굵은 글씨로 강조해주세요.`;
    }
    return `Create a short, magical children's storybook in three parts (beginning, middle, end) for a ${childAge}-year-old child named **${childName}**. The story should be about their favorite things: **${favoriteThings}**. Make the story exciting, use simple words, and have a happy ending where **${childName}** is the hero. For each part, also provide a descriptive prompt to generate a whimsical, vibrant, and cute illustration for a children's storybook that matches the story part. Make sure to highlight the child's name in markdown bold every time it appears.`;
}

// --- Sound Effects Engine ---
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

function playNote(frequency: number, duration: number, startTime: number) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.5, startTime + duration * 0.1);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function playSuccessSound() {
  const now = audioContext.currentTime;
  playNote(523.25, 0.1, now); // C5
  playNote(659.25, 0.1, now + 0.1); // E5
  playNote(783.99, 0.1, now + 0.2); // G5
  playNote(1046.50, 0.2, now + 0.3); // C6
}

function playLoadingSound() {
    let continuePlaying = true;
    let nextNoteTime = audioContext.currentTime;
    const notes = [261.63, 329.63, 392.00];
    let noteIndex = 0;
    const scheduleNextNote = () => {
        if (!continuePlaying) return;
        const noteTime = 0.4;
        playNote(notes[noteIndex], noteTime, nextNoteTime);
        nextNoteTime += noteTime / 2;
        noteIndex = (noteIndex + 1) % notes.length;
        setTimeout(scheduleNextNote, noteTime * 1000 / 2);
    };
    scheduleNextNote();
    return () => {
        continuePlaying = false;
    };
}

interface StoryPage {
    text: string;
    image: string | null;
}

const App = () => {
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const [storyLanguage, setStoryLanguage] = useState<'ko' | 'en' | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const stopLoadingSound = useRef<(() => void) | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);

  const t = translations[language];

  const handleLanguageChange = (newLang: 'ko' | 'en') => {
    if (language === newLang) return;
    setLanguage(newLang);
    setStoryPages([]);
    setCurrentPage(0);
    setError(null);
    setStoryLanguage(null);
    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
    }
  };

  const generateStory = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStoryPages([]);
    setCurrentPage(0);
    setError(null);
    setStoryLanguage(null);
    stopLoadingSound.current = playLoadingSound();

    const formData = new FormData(event.currentTarget);
    const childName = formData.get('childName') as string;
    const childAge = formData.get('childAge') as string;
    const favoriteThings = formData.get('favoriteThings') as string;

    const prompt = getPrompt(language, childAge, childName, favoriteThings);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: storySchema,
        }
      });
      
      const storyData = JSON.parse(response.text);
      if (!storyData.pages || storyData.pages.length === 0) {
        throw new Error("Received an invalid story structure from the API.");
      }

      const pages = storyData.pages.map((page: any) => ({
          text: page.story_part,
          image: null, // Image will be loaded progressively
      }));
      setStoryPages(pages);
      setStoryLanguage(language);
      playSuccessSound();

      // Progressively generate and add images
      storyData.pages.forEach(async (pageData: any, index: number) => {
          try {
              const imageResponse = await ai.models.generateImages({
                  model: 'imagen-4.0-generate-001',
                  prompt: pageData.image_prompt,
                  config: {
                      numberOfImages: 1,
                      outputMimeType: 'image/jpeg',
                      aspectRatio: '16:9',
                  },
              });
              const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
              const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
              
              setStoryPages(currentPages => {
                  const newPages = [...currentPages];
                  if (newPages[index]) {
                      newPages[index].image = imageUrl;
                  }
                  return newPages;
              });
          } catch (imgErr: any) {
              console.error(`Image generation failed for page ${index + 1}:`, imgErr);
              // Do not set a user-facing error, the text is still available.
          }
      });
    } catch (err: any) {
      setError(`${t.errorMessage} ${err.message}`);
    } finally {
        if (stopLoadingSound.current) {
            stopLoadingSound.current();
        }
      setLoading(false);
    }
  }, [language]);
  
  const handleTranslate = async () => {
    if (!storyLanguage || storyPages.length === 0) return;

    setIsTranslating(true);
    setError(null);

    const targetLanguage = storyLanguage === 'ko' ? 'English' : 'Korean';
    const sourceLanguage = storyLanguage === 'ko' ? 'Korean' : 'English';
    
    const originalTexts = storyPages.map(page => page.text);

    const prompt = `You are an expert translator specializing in children's literature.
    Translate the following story parts from ${sourceLanguage} to ${targetLanguage}.
    The story is for a young child, so maintain a simple, magical, and age-appropriate tone.
    Preserve any markdown bolding for names exactly as it appears in the original text.
    The output must be a valid JSON array of strings, with each string being a translated story part.
    
    Original texts:
    ${JSON.stringify(originalTexts)}
    `;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: translationSchema,
            }
        });

        const translatedTexts = JSON.parse(response.text);

        if (!Array.isArray(translatedTexts) || translatedTexts.length !== storyPages.length) {
            throw new Error("Translation response was not in the expected format.");
        }

        const newStoryPages = storyPages.map((page, index) => ({
            ...page,
            text: translatedTexts[index],
        }));

        setStoryPages(newStoryPages);
        setStoryLanguage(storyLanguage === 'ko' ? 'en' : 'ko');
        playSuccessSound();

    } catch (err: any) {
        setError(`${t.errorMessage} ${err.message}`);
    } finally {
        setIsTranslating(false);
    }
  };

  const handleReadAloud = useCallback(() => {
    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    if (storyPages[currentPage] && storyLanguage) {
      const textToRead = storyPages[currentPage].text.replace(/\*\*/g, '');
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = storyLanguage === 'ko' ? 'ko-KR' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      utterance.onend = () => setIsReading(false);
      
      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  }, [storyPages, isReading, storyLanguage, currentPage]);

  useEffect(() => {
    return () => speechSynthesis.cancel();
  }, []);

  const currentStoryPage = storyPages[currentPage];

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">{t.title}</h1>
      </header>
      <main className="content-wrapper">
        <div className="form-container">
          <form className="story-form" onSubmit={generateStory} key={language}>
            <div className="form-group">
                <label>{t.languageLabel}</label>
                <div className="lang-selector-buttons">
                    <button type="button" className={language === 'ko' ? 'active' : ''} onClick={() => handleLanguageChange('ko')}>한국어</button>
                    <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => handleLanguageChange('en')}>English</button>
                </div>
            </div>
            <div className="form-group">
              <label htmlFor="childName">{t.childNameLabel}</label>
              <input type="text" id="childName" name="childName" defaultValue={t.childNameDefault} required />
            </div>
            <div className="form-group">
              <label htmlFor="childAge">{t.childAgeLabel}</label>
              <input type="number" id="childAge" name="childAge" defaultValue={t.childAgeDefault} required min="1" max="10"/>
            </div>
            <div className="form-group">
              <label htmlFor="favoriteThings">{t.favoriteThingsLabel}</label>
              <input type="text" id="favoriteThings" name="favoriteThings" defaultValue={t.favoriteThingsDefault} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <Fragment>
                  <div className="spinner"></div>
                  <span>{t.submitButtonLoading}</span>
                </Fragment>
              ) : (
                <Fragment>
                  <PencilIcon />
                  <span>{t.submitButton}</span>
                </Fragment>
              )}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="story-container">
            {storyPages.length > 0 && currentStoryPage ? (
            <div className="storybook-container">
              <div className="storybook-page">
                {currentStoryPage.image ? (
                  <div className="story-image-container">
                    <img src={currentStoryPage.image} alt={t.imageAltText(currentPage + 1)} className="story-image" />
                  </div>
                ) : (
                  <div className="image-placeholder">
                    <div className="image-spinner"></div>
                  </div>
                )}
                <div className="story-content" dangerouslySetInnerHTML={{ __html: currentStoryPage.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
              </div>

              <div className="storybook-controls">
                <div className="storybook-navigation">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="nav-button">
                        <ArrowLeftIcon />
                        <span>{t.prevButton}</span>
                    </button>
                    <span className="page-indicator">{t.pageIndicator(currentPage + 1, storyPages.length)}</span>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === storyPages.length - 1} className="nav-button">
                        <span>{t.nextButton}</span>
                        <ArrowRightIcon />
                    </button>
                </div>
                <div className="action-buttons-group">
                    {storyLanguage && (
                         <button className="btn btn-secondary translate-btn" onClick={handleTranslate} disabled={isTranslating || loading}>
                            {isTranslating ? (
                                <Fragment>
                                    <div className="spinner-small"></div>
                                    <span>{t.translatingButton}</span>
                                </Fragment>
                            ) : (
                                <span>{storyLanguage === 'ko' ? t.translateToEnglish : t.translateToKorean}</span>
                            )}
                        </button>
                    )}
                    <button className="btn btn-secondary read-aloud-btn" onClick={handleReadAloud} disabled={loading || !currentStoryPage.text}>
                    {isReading ? <StopIcon/> : <SpeakerOnIcon />}
                    <span>{isReading ? t.stopReadingButton : t.readAloudButton}</span>
                    </button>
                </div>
              </div>
            </div>
          ) : !loading && (
            <div className="story-placeholder">
              {t.storyPlaceholder}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
