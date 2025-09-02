/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useCallback, useRef, Fragment, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// 데모용 더미 데이터
const dummyStories = {
  ko: [
    {
      text: "옛날 옛적에 **알렉스**라는 용감한 어린이가 살고 있었어요. 알렉스는 공룡과 우주 로켓을 무척 좋아했답니다. 어느 날, 알렉스는 뒷마당에서 반짝이는 이상한 돌을 발견했어요.",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzg3Q0VFQiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7sl4Drpr3snpAg7J2065OcIOuPhOyEgO2VnOyXrCDqt7jrpqzsnYQg67O064KZIPC+mpo8L3RleHQ+PC9zdmc+"
    },
    {
      text: "그 돌을 만지는 순간, **알렉스**는 마법의 공룡 친구 렉시와 함께 우주로 날아갔어요! 우주에서 알렉스와 렉시는 외계인 친구들을 만나고, 함께 우주 모험을 떠났답니다.",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJDMjc0QyIvPjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7sl4DrprTsoIDqsIDqsJjqs4Qg7Jqw7KO8IOuqqOusueydhCDqt7jrpqzsnYQgOzop8J+agDwvdGV4dD48L3N2Zz4="
    },
    {
      text: "마침내 **알렉스**는 우주 공룡들과 함께 지구를 구하는 영웅이 되었어요! 집으로 돌아온 알렉스는 이제 언제든지 마법의 돌로 새로운 모험을 떠날 수 있다는 것을 알게 되었답니다. 끝!",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0ZGRDcwMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9ImJsYWNrIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7sl4Drpr3snYAg7KeA6rWs66W8IOq1rO2VnOyYgeyZhSEg8J+OieKcqO+4jzwvdGV4dD48L3N2Zz4="
    }
  ],
  en: [
    {
      text: "Once upon a time, there lived a brave child named **Alex**. Alex loved dinosaurs and space rockets very much. One day, Alex found a sparkling strange stone in the backyard.",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzg3Q0VFQiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BbGV4IGZpbmRzIGEgbWFnaWNhbCBzdG9uZSEg8J+MnDwvdGV4dD48L3N2Zz4="
    },
    {
      text: "The moment **Alex** touched the stone, Alex flew to space with a magical dinosaur friend named Lexi! In space, Alex and Lexi met alien friends and went on a space adventure together.",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJDMjc0QyIvPjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TcGFjZSBhZHZlbnR1cmUgYmVnaW5zISAg8J+agDwvdGV4dD48L3N2Zz4="
    },
    {
      text: "Finally, **Alex** became a hero who saved Earth with space dinosaurs! Back home, Alex learned that new adventures could begin anytime with the magical stone. The End!",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0ZGRDcwMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9ImJsYWNrIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BbGV4IHNhdmVzIHRoZSBFYXJ0aCEg8J+OieKcqO+4jzwvdGV4dD48L3N2Zz4="
    }
  ]
};

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
    title: "나만의 그림동화책 생성기 (데모)",
    languageLabel: "언어",
    childNameLabel: "아이의 이름은 무엇인가요?",
    childNameDefault: "알렉스",
    childAgeLabel: "나이는 몇 살인가요?",
    childAgeDefault: "5",
    favoriteThingsLabel: "가장 좋아하는 것은 무엇인가요?",
    favoriteThingsDefault: "공룡과 우주 로켓",
    artStyleLabel: "그림 스타일",
    artStyleCartoon: "기운찬 카툰",
    artStyleWatercolor: "꿈같은 수채화",
    artStyleClaymation: "아늑한 클레이메이션",
    submitButton: "나만의 멋진 동화 만들기! (데모)",
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
    demoNotice: "🚧 이것은 데모 버전입니다. 실제 AI 생성을 위해서는 Google AI API 키가 필요합니다.",
  },
  en: {
    title: "Children's Story Generator (Demo)",
    languageLabel: "Language",
    childNameLabel: "What is your child's name?",
    childNameDefault: "Alex",
    childAgeLabel: "How old are they?",
    childAgeDefault: "5",
    favoriteThingsLabel: "What are their favorite things?",
    favoriteThingsDefault: "dinosaurs and space rockets",
    artStyleLabel: "Art Style",
    artStyleCartoon: "Cute Cartoon",
    artStyleWatercolor: "Dreamy Watercolor",
    artStyleClaymation: "Cozy Claymation",
    submitButton: "Write my Story! (Demo)",
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
    demoNotice: "🚧 This is a demo version. Google AI API key is required for actual AI generation.",
  },
};

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

    // 2초 후에 더미 스토리를 보여줌 (실제 API 호출처럼 보이게 하기 위해)
    setTimeout(() => {
      // 입력한 이름으로 스토리를 커스터마이징
      const customizedStory = dummyStories[language].map(page => ({
        text: page.text.replace(/\*\*알렉스\*\*/g, `**${childName}**`).replace(/\*\*Alex\*\*/g, `**${childName}**`),
        image: page.image
      }));

      setStoryPages(customizedStory);
      setStoryLanguage(language);
      playSuccessSound();
      
      if (stopLoadingSound.current) {
        stopLoadingSound.current();
      }
      setLoading(false);
    }, 2000);
  }, [language]);
  
  const handleTranslate = async () => {
    if (!storyLanguage || storyPages.length === 0) return;

    setIsTranslating(true);
    setError(null);

    // 1초 후에 언어를 변경 (데모용)
    setTimeout(() => {
      const targetLanguage = storyLanguage === 'ko' ? 'en' : 'ko';
      const translatedStory = dummyStories[targetLanguage].map((page, index) => ({
        text: storyPages[index] ? page.text.replace(/\*\*Alex\*\*/g, storyPages[index].text.match(/\*\*(.*?)\*\*/)?.[1] ? `**${storyPages[index].text.match(/\*\*(.*?)\*\*/)?.[1]}**` : '**Alex**').replace(/\*\*알렉스\*\*/g, storyPages[index].text.match(/\*\*(.*?)\*\*/)?.[1] ? `**${storyPages[index].text.match(/\*\*(.*?)\*\*/)?.[1]}**` : '**알렉스**') : page.text,
        image: page.image
      }));

      setStoryPages(translatedStory);
      setStoryLanguage(targetLanguage);
      playSuccessSound();
      setIsTranslating(false);
    }, 1000);
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
        <p style={{ 
          backgroundColor: '#FFF3CD', 
          color: '#856404', 
          padding: '10px', 
          borderRadius: '5px', 
          margin: '10px 0',
          border: '1px solid #FFEAA7'
        }}>
          {t.demoNotice}
        </p>
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
            <div className="form-group">
              <fieldset className="art-style-group">
                <legend>{t.artStyleLabel}</legend>
                <div className="art-style-options">
                    <input type="radio" id="style-cartoon" name="artStyle" value="Cute Cartoon" defaultChecked />
                    <label htmlFor="style-cartoon">{t.artStyleCartoon}</label>
                    
                    <input type="radio" id="style-watercolor" name="artStyle" value="Dreamy Watercolor" />
                    <label htmlFor="style-watercolor">{t.artStyleWatercolor}</label>
                    
                    <input type="radio" id="style-claymation" name="artStyle" value="Cozy Claymation" />
                    <label htmlFor="style-claymation">{t.artStyleClaymation}</label>
                </div>
              </fieldset>
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
root.render(<App />)
