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

function parseIssueBody(body) {
    if (!body) {
        return { url: null, description: '' };
    }

    const lines = body.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const urlPattern = /^https?:\/\/.+/i;
    let firstUrl = null;
    let descriptionStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        if (urlPattern.test(lines[i])) {
            firstUrl = lines[i];
            descriptionStartIndex = i + 1;
            break;
        }
    }

    const description = lines.slice(descriptionStartIndex).join('\n').trim();

    return { url: firstUrl, description: description || '설명이 없습니다.' };
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

function createTagStyle(color) {
    // In dark mode, we want subtle glowing tags or glass-like tags
    // Let's use the color but make it transparent for background and bright for text
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
        color: `rgb(${Math.min(r + 50, 255)}, ${Math.min(g + 50, 255)}, ${Math.min(b + 50, 255)})`,
        borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`
    };
}

function renderSkeletonCards(count = 6) {
    DOM.skeletonGrid.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'glass-card rounded-2xl overflow-hidden';
        skeleton.innerHTML = `
            <div class="p-10 relative">
                <div class="skeleton-dark h-8 w-3/4 rounded-lg mb-6"></div>
                <div class="skeleton-dark h-4 w-1/3 rounded-md mb-8"></div>
                <div class="space-y-3 mb-10">
                    <div class="skeleton-dark h-4 w-full rounded-md"></div>
                    <div class="skeleton-dark h-4 w-5/6 rounded-md"></div>
                    <div class="skeleton-dark h-4 w-4/6 rounded-md"></div>
                </div>
                <div class="flex gap-3">
                    <div class="skeleton-dark h-8 w-24 rounded-full"></div>
                    <div class="skeleton-dark h-8 w-28 rounded-full"></div>
                </div>
            </div>
        `;
        DOM.skeletonGrid.appendChild(skeleton);
    }
}

function renderProjectCard(issue, index) {
    const { url, description } = parseIssueBody(issue.body);
    const tags = extractTags(issue);
    const createdAt = formatDate(issue.created_at);
    const projectNum = String(index + 1).padStart(2, '0');

    const card = document.createElement('article');
    card.className = 'glass-card rounded-2xl flex flex-col h-full group';

    let tagsHtml = '';
    if (tags.length > 0) {
        tagsHtml = '<div class="flex flex-wrap gap-2.5 mb-8 mt-auto">';
        tags.forEach(tag => {
            tagsHtml += `<span class="tag-pill">${tag.name}</span>`;
        });
        tagsHtml += '</div>';
    }

    card.innerHTML = `
        <div class="p-10 flex-1 flex flex-col relative z-10">
            <span class="card-number">${projectNum}</span>
            
            <div class="mb-2">
                <span class="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold opacity-70">Project Case Study</span>
            </div>
            
            <h3 class="text-2xl md:text-3xl font-extrabold text-white mb-4 line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">
                ${issue.title}
            </h3>
            
            <div class="flex items-center text-xs font-semibold text-zinc-500 mb-8 tracking-wider">
                <div class="w-8 h-[1px] bg-zinc-800 mr-3"></div>
                ${createdAt}
            </div>
            
            <p class="text-zinc-400 mb-10 leading-relaxed text-sm md:text-base font-light flex-1 line-clamp-3">
                ${description}
            </p>
            
            ${tagsHtml}
            
            <div class="mt-4 pt-8 border-t border-white/[0.05]">
                ${url ? `
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="action-button group/btn">
                        <span>프로젝트 살펴보기</span>
                        <svg class="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                        </svg>
                    </a>
                ` : `
                    <div class="flex items-center justify-center w-full bg-white/[0.03] text-zinc-600 font-bold py-4 px-6 rounded-xl border border-white/[0.02] cursor-not-allowed text-sm">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                        </svg>
                        링크 준비중
                    </div>
                `}
            </div>
        </div>
        
        <!-- Abstract Decoration -->
        <div class="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full -mr-16 -mb-16 group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
    `;

    return card;
}

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

        DOM.projectsGrid.innerHTML = '';
        issues.forEach((issue, index) => {
            const card = renderProjectCard(issue, index);
            DOM.projectsGrid.appendChild(card);
        });

        showState('projects');

    } catch (error) {
        console.error('Failed to fetch projects:', error);
        showError(error.message || '알 수 없는 오류가 발생했습니다.');
    }
}

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const owner = urlParams.get('owner');
    const repo = urlParams.get('repo');

    if (owner) CONFIG.owner = owner;
    if (repo) CONFIG.repo = repo;

    fetchProjects();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
