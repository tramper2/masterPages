const CONFIG = {
    owner: 'YOUR_USERNAME',
    repo: 'YOUR_REPO_NAME',
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
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const textColor = brightness > 128 ? '#1f2937' : '#ffffff';

    return {
        backgroundColor: `#${color}`,
        color: textColor
    };
}

function renderSkeletonCards(count = 6) {
    DOM.skeletonGrid.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden';
        skeleton.innerHTML = `
            <div class="p-6">
                <div class="skeleton h-6 w-3/4 rounded mb-4"></div>
                <div class="skeleton h-4 w-1/4 rounded mb-4"></div>
                <div class="space-y-2 mb-4">
                    <div class="skeleton h-3 w-full rounded"></div>
                    <div class="skeleton h-3 w-5/6 rounded"></div>
                    <div class="skeleton h-3 w-4/6 rounded"></div>
                </div>
                <div class="flex gap-2">
                    <div class="skeleton h-6 w-16 rounded-full"></div>
                    <div class="skeleton h-6 w-20 rounded-full"></div>
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
    card.className = 'bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden card-hover flex flex-col h-full';

    let tagsHtml = '';
    if (tags.length > 0) {
        tagsHtml = '<div class="flex flex-wrap gap-2 mb-4">';
        tags.forEach(tag => {
            const style = createTagStyle(tag.color);
            tagsHtml += `<span class="text-xs font-medium px-2.5 py-1 rounded-full" style="background-color: ${style.backgroundColor}; color: ${style.color}">${tag.name}</span>`;
        });
        tagsHtml += '</div>';
    }

    card.innerHTML = `
        <div class="p-6 flex-1 flex flex-col">
            <h3 class="text-xl font-semibold text-slate-800 mb-2 line-clamp-2">${issue.title}</h3>
            <p class="text-sm text-slate-500 mb-4">${createdAt}</p>
            <p class="text-slate-600 mb-6 flex-1 line-clamp-3">${description}</p>
            ${tagsHtml}
            ${url ? `
                <a href="${url}" target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors w-full sm:w-auto">
                    <span>프로젝트 보기</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                </a>
            ` : `
                <span class="text-slate-400 text-sm">링크가 없습니다</span>
            `}
        </div>
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
