// FIX: Removed unused and deprecated import for @google/genai. API calls are handled by the backend.

// DOM Elements
const storyForm = document.getElementById('story-form') as HTMLFormElement;
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
const storybookContainer = document.getElementById('storybook-container') as HTMLDivElement;
const langKoBtn = document.getElementById('lang-ko') as HTMLButtonElement;
const langEnBtn = document.getElementById('lang-en') as HTMLButtonElement;
const mainCharacterInput = document.getElementById('main-character') as HTMLInputElement;
const settingInput = document.getElementById('setting') as HTMLInputElement;
const plotInput = document.getElementById('plot') as HTMLInputElement;
const lessonInput = document.getElementById('lesson') as HTMLInputElement;

// State
let currentLanguage = 'ko';

// --- LANGUAGE SELECTION ---
function setLanguage(lang: 'ko' | 'en') {
  currentLanguage = lang;
  if (lang === 'ko') {
    langKoBtn.classList.add('active');
    langEnBtn.classList.remove('active');
    updatePlaceholders('ko');
  } else {
    langEnBtn.classList.add('active');
    langKoBtn.classList.remove('active');
    updatePlaceholders('en');
  }
}

function updatePlaceholders(lang: 'ko' | 'en') {
  const placeholders = {
    ko: {
      character: "예: 용감한 토끼",
      setting: "예: 마법의 숲",
      plot: "예: 잃어버린 보물을 찾아서",
      lesson: "예: 우정의 중요성"
    },
    en: {
      character: "e.g., a brave rabbit",
      setting: "e.g., in a magical forest",
      plot: "e.g., looking for a lost treasure",
      lesson: "e.g., the importance of friendship"
    }
  };
  mainCharacterInput.placeholder = placeholders[lang].character;
  settingInput.placeholder = placeholders[lang].setting;
  plotInput.placeholder = placeholders[lang].plot;
  lessonInput.placeholder = placeholders[lang].lesson;
}

langKoBtn.addEventListener('click', () => setLanguage('ko'));
langEnBtn.addEventListener('click', () => setLanguage('en'));


// --- UI CONTROL ---
function showLoader() {
  generateBtn.disabled = true;
  generateBtn.querySelector('.btn-text')!.textContent = currentLanguage === 'ko' ? '만드는 중...' : 'Generating...';
  // FIX: Cast querySelector result to HTMLElement to access style properties.
  (generateBtn.querySelector('.btn-loader') as HTMLElement)!.style.display = 'inline-block';
}

function hideLoader() {
  generateBtn.disabled = false;
  generateBtn.querySelector('.btn-text')!.textContent = currentLanguage === 'ko' ? '동화책 만들기!' : 'Create Storybook!';
  // FIX: Cast querySelector result to HTMLElement to access style properties.
  (generateBtn.querySelector('.btn-loader') as HTMLElement)!.style.display = 'none';
}

function displayError(message: string) {
  storybookContainer.style.display = 'block';
  storybookContainer.innerHTML = `<div class="page error-page"><p>${message}</p></div>`;
}

// --- API CALLS to our Firebase Backend ---

// **IMPORTANT**: Replace this with your actual deployed Cloud Function URL
const CLOUD_FUNCTION_BASE_URL = 'YOUR_CLOUD_FUNCTION_URL_HERE'; 

async function generateStory(prompt: string): Promise<any> {
  const response = await fetch(`${CLOUD_FUNCTION_BASE_URL}/generateStory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) throw new Error('Failed to generate story text.');
  return response.json();
}

async function generateImage(prompt: string): Promise<string> {
    const response = await fetch(`${CLOUD_FUNCTION_BASE_URL}/generateImage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) throw new Error('Failed to generate image.');
  const data = await response.json();
  return data.imageUrl; // Expecting { imageUrl: 'data:image/png;base64,...' }
}

async function translateText(text: string, targetLang: 'en' | 'ko'): Promise<string> {
   const response = await fetch(`${CLOUD_FUNCTION_BASE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLang }),
  });
  if (!response.ok) throw new Error('Failed to translate text.');
  const data = await response.json();
  return data.translatedText;
}


// --- STORY GENERATION LOGIC ---
storyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (CLOUD_FUNCTION_BASE_URL === 'YOUR_CLOUD_FUNCTION_URL_HERE') {
      alert('Please update the CLOUD_FUNCTION_BASE_URL in index.tsx with your deployed function URL.');
      return;
  }

  showLoader();
  storybookContainer.innerHTML = '';
  storybookContainer.style.display = 'none';

  const formData = new FormData(storyForm);
  const mainCharacter = formData.get('main-character') as string;
  const setting = formData.get('setting') as string;
  const plot = formData.get('plot') as string;
  const lesson = formData.get('lesson') as string;
  const artStyle = (document.getElementById('art-style') as HTMLSelectElement).value;
  
  const userPrompt = `
    - 주인공: ${mainCharacter}
    - 배경: ${setting}
    - 줄거리: ${plot}
    - 교훈: ${lesson}
  `;

  try {
    const storyPrompt = `Create a 5-page story for a child based on the following details. Each page must have a 'page' number and 'text' for the story. The final page, page 5, should explicitly state the story's lesson.
    Details: ${userPrompt}
    Output only in JSON format like this: {"pages": [{"page": 1, "text": "..."}, {"page": 2, "text": "..."}, ...]}
    `;
    
    const storyData = await generateStory(storyPrompt);
    const pages = storyData.pages;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      throw new Error("AI did not return a valid story structure.");
    }

    storybookContainer.style.display = 'grid';

    for (const page of pages) {
      const pageElement = document.createElement('div');
      pageElement.className = 'page';
      pageElement.innerHTML = `
        <div class="page-loader">
          <div class="spinner"></div>
          <p>${currentLanguage === 'ko' ? '그림을 그리는 중...' : 'Drawing picture...'}</p>
        </div>
        <img src="" alt="페이지 ${page.page} 이미지" style="display:none;"/>
        <p class="story-text"></p>
      `;
      storybookContainer.appendChild(pageElement);

      // Translate if necessary
      const storyText = currentLanguage === 'ko' 
        ? page.text 
        : await translateText(page.text, 'en');
      
      const textElement = pageElement.querySelector('.story-text') as HTMLParagraphElement;
      textElement.textContent = storyText;

      // Generate image
      try {
        const imagePrompt = `Children's storybook illustration, ${artStyle}. A scene describing: "${page.text}". Simple, cute, and colorful. Centered character.`;
        const imageUrl = await generateImage(imagePrompt);
        
        const img = pageElement.querySelector('img') as HTMLImageElement;
        img.src = imageUrl;
        img.onload = () => {
            pageElement.querySelector('.page-loader')?.remove();
            img.style.display = 'block';
        };
      } catch (imgError) {
        console.error(`Image generation failed for page ${page.page}:`, imgError);
        const loader = pageElement.querySelector('.page-loader');
        if (loader) {
            loader.innerHTML = `<p style="color: var(--error-color);">${currentLanguage === 'ko' ? '앗, 그림을 그리다 문제가 생겼어요!' : 'Oops! Failed to draw.'}</p>`;
        }
      }
    }
  } catch (error) {
    console.error(error);
    const errorMessage = currentLanguage === 'ko' 
      ? '이야기를 만들다가 문제가 생겼어요. 잠시 후 다시 시도해주세요.' 
      : 'An error occurred while creating the story. Please try again later.';
    displayError(errorMessage);
  } finally {
    hideLoader();
  }
});

// Initial setup
setLanguage('ko');
