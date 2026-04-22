const CONFIG = {
    owner: 'tramper2',
    repo: 'masterPages',
    label: 'project'
};

const API_URL = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/issues?labels=${CONFIG.label}&state=open&per_page=100`;

const DOM = {
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    errorMessage: document.getElementById('error-message'),
    emptyState: document.getElementById('empty-state'),
    skeletonGrid: document.getElementById('skeleton-grid'),
    projectsGrid: document.getElementById('projects-grid')
};

let currentTheme = localStorage.getItem('projectTheme') || 'aurora';
let cachedIssues = null;

// ========== THEME SYSTEM ==========
function setTheme(theme) {
    currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('projectTheme', theme);

    // Update button states
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme-value') === theme);
    });

    // Re-render cards if data exists
    if (cachedIssues) {
        renderAllCards(cachedIssues);
    }
}

// ========== PARSING ==========
function parseIssueBody(body) {
    if (!body) {
        return { url: null, description: '', imageUrl: null };
    }

    const lines = body.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Extract first image URL from either:
    // 1. HTML img tag: <img ... src="url" ... />  (GitHub drag-and-drop format)
    // 2. Markdown image: ![alt](url)
    let imageUrl = null;

    const htmlImgPattern = /<img[^>]+src=["']([^"']+)["'][^>]*\/?>/i;
    const mdImgPattern = /!\[.*?\]\((https?:\/\/[^)]+)\)/;

    const htmlMatch = body.match(htmlImgPattern);
    const mdMatch = body.match(mdImgPattern);

    if (htmlMatch) {
        imageUrl = htmlMatch[1];
    } else if (mdMatch) {
        imageUrl = mdMatch[1];
    }

    // Filter out image lines (both HTML img tags and markdown images) from description
    const filteredLines = lines.filter(line => {
        return !htmlImgPattern.test(line) && !mdImgPattern.test(line);
    });

    const urlPattern = /^https?:\/\/.+/i;
    let firstUrl = null;
    let descriptionStartIndex = 0;

    for (let i = 0; i < filteredLines.length; i++) {
        if (urlPattern.test(filteredLines[i])) {
            firstUrl = filteredLines[i];
            descriptionStartIndex = i + 1;
            break;
        }
    }

    const description = filteredLines.slice(descriptionStartIndex).join('\n').trim();

    return { url: firstUrl, description: description || '설명이 없습니다.', imageUrl };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

function extractTags(issue) {
    return issue.labels
        .filter(label => label.name !== CONFIG.label)
        .map(label => ({
            name: label.name,
            color: label.color
        }));
}

// ========== SKELETON ==========
function renderSkeletonCards(count = 6) {
    DOM.skeletonGrid.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'project-card';
        skeleton.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px;';
        skeleton.innerHTML = `
            <div class="card-inner">
                <div class="skeleton-dark h-8 w-3/4 rounded-lg mb-6"></div>
                <div class="skeleton-dark h-4 w-1/3 rounded-md mb-8"></div>
                <div class="space-y-3 mb-10">
                    <div class="skeleton-dark h-4 w-full rounded-md"></div>
                    <div class="skeleton-dark h-4 w-5/6 rounded-md"></div>
                    <div class="skeleton-dark h-4 w-4/6 rounded-md"></div>
                </div>
                <div class="flex gap-3 mt-auto">
                    <div class="skeleton-dark h-8 w-24 rounded-full"></div>
                    <div class="skeleton-dark h-8 w-28 rounded-full"></div>
                </div>
            </div>
        `;
        DOM.skeletonGrid.appendChild(skeleton);
    }
}

// ========== CARD RENDERING ==========
function renderProjectCard(issue, index) {
    const { url, description, imageUrl } = parseIssueBody(issue.body);
    const tags = extractTags(issue);
    const createdAt = formatDate(issue.created_at);
    const projectNum = String(index + 1).padStart(2, '0');
    const firstLetter = issue.title.charAt(0).toUpperCase();

    const card = document.createElement('article');
    card.className = 'project-card group';

    // Thumbnail HTML
    const thumbnailHtml = imageUrl
        ? `<div class="card-thumbnail">
               <img src="${imageUrl}" alt="${issue.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=card-thumbnail-placeholder>${firstLetter}</div>'">
           </div>`
        : `<div class="card-thumbnail">
               <div class="card-thumbnail-placeholder">${firstLetter}</div>
           </div>`;

    // Tags HTML
    let tagsHtml = '';
    if (tags.length > 0) {
        tagsHtml = '<div class="flex flex-wrap gap-2 mb-6 mt-auto">';
        tags.forEach(tag => {
            tagsHtml += `<span class="card-tag">${tag.name}</span>`;
        });
        tagsHtml += '</div>';
    }

    // No-link button
    const noLinkHtml = `
        <div class="card-action cursor-not-allowed opacity-40">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
            </svg>
            링크 준비중
        </div>
    `;

    // Link button
    const linkHtml = url ? `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="card-action group/btn">
            <span>프로젝트 살펴보기</span>
            <svg class="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
        </a>
    ` : noLinkHtml;

    card.innerHTML = `
        ${thumbnailHtml}
        <div class="card-inner">
            <span class="card-number">${projectNum}</span>
            
            <div class="mb-2">
                <span class="card-subtitle">Project #${projectNum}</span>
            </div>
            
            <h3 class="card-title text-2xl font-bold mb-4 line-clamp-2 leading-tight transition-colors">
                ${issue.title}
            </h3>
            
            <div class="card-date flex items-center text-xs font-semibold mb-8 tracking-wider">
                <div class="w-8 h-[1px] bg-current opacity-30 mr-3"></div>
                ${createdAt}
            </div>
            
            <p class="card-desc mb-8 leading-relaxed text-sm flex-1 line-clamp-3">
                ${description}
            </p>
            
            ${tagsHtml}
            
            <div class="mt-auto pt-6 border-t border-white/[0.05]">
                ${linkHtml}
            </div>
        </div>
    `;

    return card;
}

function renderAllCards(issues) {
    DOM.projectsGrid.innerHTML = '';

    // Add staggered animation
    issues.forEach((issue, index) => {
        const card = renderProjectCard(issue, index);
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        DOM.projectsGrid.appendChild(card);

        // Stagger animation
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 80);
    });

    showState('projects');
}

// ========== STATE MANAGEMENT ==========
function showState(state) {
    DOM.loadingState.classList.add('hidden');
    DOM.errorState.classList.add('hidden');
    DOM.emptyState.classList.add('hidden');
    DOM.skeletonGrid.classList.add('hidden');
    DOM.projectsGrid.classList.add('hidden');

    switch (state) {
        case 'loading':
            DOM.loadingState.classList.remove('hidden');
            break;
        case 'error':
            DOM.errorState.classList.remove('hidden');
            break;
        case 'empty':
            DOM.emptyState.classList.remove('hidden');
            break;
        case 'skeleton':
            DOM.skeletonGrid.classList.remove('hidden');
            break;
        case 'projects':
            DOM.projectsGrid.classList.remove('hidden');
            break;
    }
}

function showError(message) {
    DOM.errorMessage.textContent = message;
    showState('error');
}

// ========== DATA FETCHING ==========
async function fetchProjects() {
    showState('skeleton');
    renderSkeletonCards(6);

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('저장소를 찾을 수 없습니다. CONFIG 설정을 확인해주세요.');
            } else if (response.status === 403) {
                throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
            } else {
                throw new Error(`API 오류가 발생했습니다 (Status: ${response.status})`);
            }
        }

        const issues = await response.json();

        if (!Array.isArray(issues)) {
            throw new Error('데이터 형식이 올바르지 않습니다.');
        }

        if (issues.length === 0) {
            showState('empty');
            return;
        }

        cachedIssues = issues;
        renderAllCards(issues);

    } catch (error) {
        console.error('Failed to fetch projects:', error);
        showError(error.message || '알 수 없는 오류가 발생했습니다.');
    }
}

// ========== INITIALIZATION ==========
function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const owner = urlParams.get('owner');
    const repo = urlParams.get('repo');

    if (owner) CONFIG.owner = owner;
    if (repo) CONFIG.repo = repo;

    // Apply saved theme
    setTheme(currentTheme);

    fetchProjects();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
