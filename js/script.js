/**
 * js/script.js
 * Eco Chaser 프로젝트 공통 스크립트
 */

// [3] 랭킹 조회 및 표시 (index.html의 #ranking 모드용)
/**
 * [랭킹 데이터를 불러와서 화면에 표시하는 함수]
 * 이 함수는 [4]번의 applyModeFromHash에 의해 호출됩니다.
 */
async function loadRanking() {
    // 랭킹을 표시할 곳이 '.leaderboard-list'가 맞는지 확인
    const leaderboardList = document.querySelector('.leaderboard-list');
    
    // 랭킹 리스트 div가 없으면 함수 종료
    if (!leaderboardList) return; 

    leaderboardList.innerHTML = '<div class="loading">랭킹을 불러오는 중...</div>';

    try {
        // ★ Cloudflare Workers용 경로로 변경: /api/ranking
        const response = await fetch('/api/ranking');
        const data = await response.json();

        if (!data.success) {
            leaderboardList.innerHTML = `<div>랭킹 로드 실패: ${data.message}</div>`;
            return;
        }

        const scores = data.ranking;
        // 서버에서 이미 정렬해서 보내주므로 클라이언트에서 정렬할 필요가 없습니다。

        leaderboardList.innerHTML = '';

        if (scores.length === 0) {
            leaderboardList.innerHTML = '<div>아직 랭킹 데이터가 없습니다.</div>';
            return;
        }

        const header = document.createElement('div');
        header.className = 'leaderboard-header';
        header.innerHTML = `
            <span>카테고리</span>
            <span>순위</span>
            <span>닉네임</span>
            <span>오답</span>
            <span style="text-align: right;">점수</span>
        `;
        leaderboardList.appendChild(header);

        scores.forEach((entry, index) => {
            const rankItem = document.createElement('div');
            rankItem.className = 'leaderboard-entry';

            if (index === 0) rankItem.classList.add('gold');
            if (index === 1) rankItem.classList.add('silver');
            if (index === 2) rankItem.classList.add('bronze');

            const trophy = index < 3 ? ' <span class="trophy">🏆</span>' : '';
            const category = entry.category ?? (
              entry.score >= 1400 ? '레전드' :
              entry.score >= 1200 ? '마스터' :
              entry.score >= 900  ? '다이아'  :
              entry.score >= 700  ? '플래티넘' :
              entry.score >= 500  ? '골드' : '브론즈'
            );

            rankItem.innerHTML = `
                <span class="category">${category}</span>
                <span class="rank">${index + 1}${trophy}</span>
                <span class="nickname">${entry.nickname}</span>
                <span class="mistakes">${Number(entry.mistakes ?? 0)}</span>
                <span class="score">${entry.score}</span>
            `;
            leaderboardList.appendChild(rankItem);
        });
    } catch (error) {
        console.error('랭킹 요청 실패:', error);
        leaderboardList.innerHTML = '<div>서버 통신에 실패했습니다.</div>';
    }
} // [랭킹 조회 함수 끝]

// 게임 종료 시 서버에 결과를 제출하는 전역 헬퍼
window.submitGameResult = async function submitGameResult(userId, score, wrongItems) {
    try {
        const mistakes = Array.isArray(wrongItems) ? wrongItems.length : 0;
        // ★ Cloudflare Workers용 경로로 변경: /api/submit-score
        const res = await fetch('/api/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: Number(userId),
                score: Number(score),
                mistakes,
                wrongItems: Array.isArray(wrongItems) ? wrongItems : []
            })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || '제출 실패');
        return data;
    } catch (e) {
        console.error('게임 결과 제출 실패:', e);
        throw e;
    }
};

// Scroll reveal & hero load-in animations
document.addEventListener('DOMContentLoaded', () => {
    const revealEls = document.querySelectorAll('.reveal');
    const hero = document.querySelector('.hero');

    if (hero) {
        requestAnimationFrame(() => {
            hero.classList.add('hero-loaded');
        });
    }

    if (!('IntersectionObserver' in window)) {
        revealEls.forEach(el => el.classList.add('reveal-active'));
    } else {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });

        revealEls.forEach(el => observer.observe(el));
    }

    // Intro cards → fullscreen detail slider overlay
    const introCards = document.querySelectorAll('.intro-card[data-intro-index]');
    const introOverlay = document.getElementById('introDetailOverlay');
    const introOverlayTrack = introOverlay?.querySelector('.intro-overlay-track');
    const introOverlaySlides = introOverlay ? introOverlay.querySelectorAll('.intro-overlay-slide') : [];
    const introOverlayTitleEl = introOverlay?.querySelector('#introOverlayTitle');
    const introPrevBtn = introOverlay?.querySelector('.intro-overlay-arrow--prev');
    const introNextBtn = introOverlay?.querySelector('.intro-overlay-arrow--next');
    const introDots = introOverlay ? introOverlay.querySelectorAll('.intro-overlay-dot') : [];
    const introCloseBtn = introOverlay?.querySelector('.intro-overlay-close');

    let introCurrentIndex = 0;

    const syncIntroOverlay = () => {
        if (!introOverlayTrack) return;
        introOverlayTrack.style.transform = `translateX(-${introCurrentIndex * 100}%)`;

        // 헤더 제목은 현재 슬라이드 h3 텍스트로 동기화
        const activeSlide = introOverlaySlides[introCurrentIndex];
        const slideTitle = activeSlide?.querySelector('strong');
        if (introOverlayTitleEl && slideTitle) {
            introOverlayTitleEl.textContent = slideTitle.textContent || '';
        }

        introDots.forEach((dot, idx) => {
            dot.classList.toggle('is-active', idx === introCurrentIndex);
        });
    };

    const openIntroOverlay = (index) => {
        if (!introOverlay) return;
        introCurrentIndex = index;
        introOverlay.classList.add('is-active');
        document.body.classList.add('no-scroll');
        syncIntroOverlay();
    };

    const closeIntroOverlay = () => {
        if (!introOverlay) return;
        introOverlay.classList.remove('is-active');
        document.body.classList.remove('no-scroll');
    };

    introCards.forEach(card => {
        const idx = Number(card.getAttribute('data-intro-index')) || 0;
        card.tabIndex = 0;

        const activate = () => openIntroOverlay(idx);

        card.addEventListener('click', activate);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activate();
            }
        });
    });

    if (introPrevBtn && introNextBtn) {
        introPrevBtn.addEventListener('click', () => {
            introCurrentIndex = (introCurrentIndex + introOverlaySlides.length - 1) % introOverlaySlides.length;
            syncIntroOverlay();
        });

        introNextBtn.addEventListener('click', () => {
            introCurrentIndex = (introCurrentIndex + 1) % introOverlaySlides.length;
            syncIntroOverlay();
        });
    }

    introDots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            introCurrentIndex = idx;
            syncIntroOverlay();
        });
    });

    if (introCloseBtn) {
        introCloseBtn.addEventListener('click', closeIntroOverlay);
    }

    if (introOverlay) {
        introOverlay.addEventListener('click', (e) => {
            if (e.target === introOverlay || e.target.classList.contains('intro-overlay-backdrop')) {
                closeIntroOverlay();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!introOverlay.classList.contains('is-active')) return;

            if (e.key === 'Escape') {
                closeIntroOverlay();
            } else if (e.key === 'ArrowRight') {
                introCurrentIndex = (introCurrentIndex + 1) % introOverlaySlides.length;
                syncIntroOverlay();
            } else if (e.key === 'ArrowLeft') {
                introCurrentIndex = (introCurrentIndex + introOverlaySlides.length - 1) % introOverlaySlides.length;
                syncIntroOverlay();
            }
        });
    }
});

// localStorage의 로그인 사용자로 제출하는 헬퍼
window.submitGameResultFromLocal = async function submitGameResultFromLocal(score, wrongItems) {
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
        throw new Error('로그인 필요: 사용자 ID가 없습니다.');
    }
    const userId = Number(userIdStr);
    return window.submitGameResult(userId, score, wrongItems);
};


// [4] 페이지 모드 전환 (index.html용)
/**
 * [페이지 모드(해시)가 변경될 때마다 실행되는 함수]
 */
function applyModeFromHash() {
    const isIndexPage = document.body.classList.contains('mode-home') || 
                        document.body.classList.contains('mode-ranking');

    if (!isIndexPage) return; // index.html 아니면 실행 안 함
    
    if (location.hash === '#ranking') {
        document.body.classList.remove('mode-home');
        document.body.classList.add('mode-ranking');
        
        // 랭킹 모드가 되면, 랭킹 데이터를 불러오는 함수 실행
        loadRanking(); 
    } else {
        document.body.classList.remove('mode-ranking');
        document.body.classList.add('mode-home');
    }
}


// [5] (★최종 수정★) 모든 페이지 공통 초기화 작업
// ---------------------------------------------
// DOMContentLoaded는 페이지 로딩이 끝나면 딱 한 번 실행됩니다.

document.addEventListener('DOMContentLoaded', () => {

    // --- (C) 페이지별 초기화 로직 ---
    
    // 1. index.html인지 확인
    const isIndexPage = document.body.classList.contains('mode-home') || 
                        document.body.classList.contains('mode-ranking');

    // 2. 랭킹 리스트(.leaderboard-list)가 페이지에 있는지 확인
    const leaderboardList = document.querySelector('.leaderboard-list');

    if (isIndexPage) {
        // index.html 이면? -> 해시(#) 기반 모드 전환 실행
        applyModeFromHash();

        // 지역별 통계 데모 차트 렌더링
        renderRegionCharts('all');

        const regionSelect = document.getElementById('regionSelect');
        if (regionSelect) {
            regionSelect.addEventListener('change', async () => {
                const selectedRegion = regionSelect.value || 'all';
                const response = await fetch(`/api/scores/regions?region=${selectedRegion}`);
                const data = await response.json();
                renderRegionCharts(selectedRegion, data);
            });
        }
    } else if (leaderboardList) {
        // index.html이 아닌데 랭킹 리스트가 있다면? 
        // -> ranking.html 이므로 랭킹을 즉시 로드! (지금은 거의 사용 안 함)
        loadRanking();
    }
    
}); // [공통 초기화 작업 끝]


// [6] 해시 변경 이벤트 감지 (index.html에서만 사용)
window.addEventListener('hashchange', applyModeFromHash);