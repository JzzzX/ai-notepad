import type { GlobalChatFilters, GlobalChatScope, Template } from './types';

export const GLOBAL_CHAT_DRAFT_KEY = 'piedras_globalChatDraft';

export interface GlobalChatDraft {
  displayText: string;
  question: string;
  templatePrompt?: string;
  templateId?: string;
  scope: GlobalChatScope;
  workspaceId?: string | null;
  filters: GlobalChatFilters;
}

export interface GlobalChatRecipe {
  id: string;
  title: string;
  description: string;
  prompt: string;
  command: string;
  scope: GlobalChatScope;
  accent: 'lime' | 'amber' | 'sky' | 'violet';
}

export interface GlobalChatCatalogItem {
  id: string;
  label: string;
  description: string;
  type: 'recipe' | 'template';
  group: 'recipes' | 'templates';
  accent: 'lime' | 'amber' | 'sky' | 'violet';
  command: string;
  recipe?: GlobalChatRecipe;
  template?: Template;
}

export const GLOBAL_CHAT_RECIPES: GlobalChatRecipe[] = [
  {
    id: 'recent-todos',
    title: '列出最近待办',
    description: '汇总最近会议里提到的待办、负责人和截止时间。',
    prompt: '请帮我汇总最近会议里提到的待办事项、负责人和截止时间。',
    command: '/todos',
    scope: 'my_notes',
    accent: 'lime',
  },
  {
    id: 'weekly-recap',
    title: '生成本周回顾',
    description: '概览这周的重要进展、风险和下一步。',
    prompt: '请基于本周的会议，生成一份周回顾，包含进展、风险和下一步。',
    command: '/weekly-recap',
    scope: 'my_notes',
    accent: 'amber',
  },
  {
    id: 'calendar-conflicts',
    title: '梳理日程冲突',
    description: '找出最近会议里提到的排期冲突、延期与依赖。',
    prompt: '请帮我梳理最近会议里提到的排期冲突、延期风险和关键依赖。',
    command: '/schedule-conflicts',
    scope: 'all_meetings',
    accent: 'sky',
  },
  {
    id: 'blind-spots',
    title: '发现盲点',
    description: '识别反复出现但尚未解决的问题。',
    prompt: '请帮我识别最近会议中反复出现但仍未解决的问题和潜在盲点。',
    command: '/blind-spots',
    scope: 'all_meetings',
    accent: 'lime',
  },
  {
    id: 'decision-scan',
    title: '扫描关键决策',
    description: '找出最近几场会议里做出的关键决定。',
    prompt: '请帮我整理最近几场会议里做出的关键决策，以及各自依据。',
    command: '/decisions',
    scope: 'all_meetings',
    accent: 'violet',
  },
];

export function buildGlobalChatSessionTitle(input: string) {
  const normalized = input.replace(/\s+/g, ' ').trim();
  if (!normalized) return '未命名对话';
  return normalized.length > 36 ? `${normalized.slice(0, 36)}...` : normalized;
}

export function parseStoredGlobalChatFilters(raw: string | null | undefined): GlobalChatFilters {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as GlobalChatFilters;
    return {
      titleKeyword: parsed.titleKeyword || '',
      dateFrom: parsed.dateFrom || '',
      dateTo: parsed.dateTo || '',
      folderId: parsed.folderId || '',
    };
  } catch {
    return {};
  }
}

export function serializeGlobalChatFilters(filters: GlobalChatFilters) {
  return JSON.stringify({
    titleKeyword: filters.titleKeyword || '',
    dateFrom: filters.dateFrom || '',
    dateTo: filters.dateTo || '',
    folderId: filters.folderId || '',
  });
}

export function buildGlobalChatRetrievalFilters(input: {
  scope: GlobalChatScope;
  workspaceId?: string | null;
  filters?: GlobalChatFilters;
}) {
  return {
    ...(input.filters || {}),
    ...(input.scope === 'my_notes' && input.workspaceId
      ? { workspaceId: input.workspaceId }
      : {}),
  };
}

export function getGlobalChatScopeLabel(scope: GlobalChatScope, workspaceName?: string | null) {
  if (scope === 'all_meetings') return '全部工作区';
  return workspaceName?.trim() || '指定工作区';
}

export function resolveGlobalChatScope(workspaceId?: string | null): GlobalChatScope {
  return workspaceId ? 'my_notes' : 'all_meetings';
}

export function getFeaturedGlobalChatRecipes() {
  return GLOBAL_CHAT_RECIPES.slice(0, 5);
}

export function buildGlobalChatCatalogItems(templates: Template[]): GlobalChatCatalogItem[] {
  return [
    ...GLOBAL_CHAT_RECIPES.map((recipe) => ({
      id: recipe.id,
      label: recipe.title,
      description: recipe.description,
      type: 'recipe' as const,
      group: 'recipes' as const,
      accent: recipe.accent,
      command: recipe.command,
      recipe,
    })),
    ...templates.map((template) => ({
      id: template.id,
      label: template.name,
      description: template.description,
      type: 'template' as const,
      group: 'templates' as const,
      accent: 'amber' as const,
      command: template.command,
      template,
    })),
  ];
}

export function buildRecipeCommandItems(templates: Template[]) {
  return buildGlobalChatCatalogItems(templates);
}
