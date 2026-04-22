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
            <div class="p-8">
                <div class="skeleton-dark h-7 w-3/4 rounded-lg mb-6"></div>
                <div class="skeleton-dark h-4 w-1/4 rounded-md mb-6"></div>
                <div class="space-y-3 mb-8">
                    <div class="skeleton-dark h-4 w-full rounded-md"></div>
                    <div class="skeleton-dark h-4 w-5/6 rounded-md"></div>
                    <div class="skeleton-dark h-4 w-4/6 rounded-md"></div>
                </div>
                <div class="flex gap-3">
                    <div class="skeleton-dark h-7 w-20 rounded-full"></div>
                    <div class="skeleton-dark h-7 w-24 rounded-full"></div>
                </div>
            </div>
        `;
        DOM.skeletonGrid.appendChild(skeleton);
    }
}

function renderProjectCard(issue) {
    const { url, description } = parseIssueBody(issue.body);
    const tags = extractTags(issue);
    const createdAt = formatDate(issue.created_at);

    const card = document.createElement('article');
    card.className = 'glass-card rounded-2xl overflow-hidden flex flex-col h-full group';

    let tagsHtml = '';
    if (tags.length > 0) {
        tagsHtml = '<div class="flex flex-wrap gap-2 mb-6 mt-auto">';
        tags.forEach(tag => {
            const style = createTagStyle(tag.color);
            tagsHtml += `<span class="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors hover:bg-opacity-30" style="background-color: ${style.backgroundColor}; color: ${style.color}; border-color: ${style.borderColor}">${tag.name}</span>`;
        });
        tagsHtml += '</div>';
    }

    card.innerHTML = `
        <div class="p-8 flex-1 flex flex-col relative z-10">
            <h3 class="text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-indigo-400 transition-colors">${issue.title}</h3>
            <div class="flex items-center text-sm text-zinc-500 mb-6 font-medium">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                ${createdAt}
            </div>
            <p class="text-zinc-400 mb-8 leading-relaxed flex-1 line-clamp-3">${description}</p>
            ${tagsHtml}
            <div class="mt-4 pt-6 border-t border-white/5">
                ${url ? `
                    <a href="${url}" target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center justify-center gap-2 w-full bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-medium py-3 px-6 rounded-xl transition-all border border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                        <span>프로젝트 열기</span>
                        <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </a>
                ` : `
                    <div class="inline-flex items-center justify-center w-full bg-white/5 text-zinc-500 font-medium py-3 px-6 rounded-xl border border-white/5 cursor-not-allowed">
                        <span>링크가 없습니다</span>
                    </div>
                `}
            </div>
        </div>
        <!-- Hover Gradient Effect -->
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none"></div>
    `;

    // Ensure relative positioning for the absolute hover background
    card.style.position = 'relative';

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
        issues.forEach(issue => {
            const card = renderProjectCard(issue);
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
