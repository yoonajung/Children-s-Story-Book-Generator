import React from 'react'
import './index.css'

export default function App() {
  return (
    <div className="container">
      <h1 className="title">나만의 그림동화책 생성기</h1>

      <div className="content-wrapper">
        <div className="form-container">
          <form className="story-form">
            <div className="form-group">
              <label>언어 선택 (Language)</label>
              <div className="lang-selector-buttons">
                <button type="button" className="active">한국어</button>
                <button type="button">English</button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="main-character">주인공 (Main Character)</label>
              <input type="text" id="main-character" placeholder="예: 용감한 토끼" required />
            </div>

            <div className="form-group">
              <label htmlFor="setting">배경 (Setting)</label>
              <input type="text" id="setting" placeholder="예: 마법의 숲" required />
            </div>

            <div className="form-group">
              <label htmlFor="plot">줄거리 (Plot)</label>
              <input type="text" id="plot" placeholder="예: 잃어버린 보물을 찾아서" required />
            </div>

            <div className="form-group">
              <label htmlFor="lesson">교훈 (Lesson)</label>
              <input type="text" id="lesson" placeholder="예: 우정의 중요성" required />
            </div>

            <div className="form-group art-style-group">
              <label htmlFor="art-style">그림 스타일 (Art Style)</label>
              <select id="art-style">
                <option value="storybook illustration">동화책 삽화</option>
                <option value="disney pixar animation style">디즈니/픽사 스타일</option>
                <option value="ghibli studio anime style">지브리 스튜디오 스타일</option>
                <option value="watercolor painting">수채화</option>
                <option value="crayon drawing">크레용 그림</option>
                <option value="claymation">클레이 애니메이션</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              동화책 만들기!
            </button>
          </form>
        </div>

        <div className="storybook-container" style={{ display: 'none' }}>
          {/* 동화책 페이지가 동적으로 여기에 추가될 예정 */}
        </div>
      </div>
    </div>
  )
}
