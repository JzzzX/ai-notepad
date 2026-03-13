'use client';

import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Briefcase,
  Building2,
  FileText,
  FlaskConical,
  Folder,
  GraduationCap,
  Handshake,
  Landmark,
  Lightbulb,
  MessageSquare,
  Mic,
  Scale,
  Stethoscope,
  Users,
} from 'lucide-react';

export const WORKSPACE_ICON_OPTIONS = [
  { key: 'folder', label: '通用', icon: Folder },
  { key: 'briefcase', label: '项目', icon: Briefcase },
  { key: 'building', label: '公司', icon: Building2 },
  { key: 'users', label: '团队', icon: Users },
  { key: 'message', label: '沟通', icon: MessageSquare },
  { key: 'book', label: '知识', icon: BookOpen },
  { key: 'scale', label: '法律', icon: Scale },
  { key: 'landmark', label: '政策', icon: Landmark },
  { key: 'graduation', label: '教育', icon: GraduationCap },
  { key: 'research', label: '研究', icon: FlaskConical },
  { key: 'idea', label: '创意', icon: Lightbulb },
  { key: 'handshake', label: '客户', icon: Handshake },
  { key: 'health', label: '医疗', icon: Stethoscope },
  { key: 'mic', label: '访谈', icon: Mic },
  { key: 'notes', label: '记录', icon: FileText },
] as const;

export type WorkspaceIconKey = (typeof WORKSPACE_ICON_OPTIONS)[number]['key'];

export const DEFAULT_WORKSPACE_ICON_KEY: WorkspaceIconKey = 'folder';

const WORKSPACE_ICON_KEYWORD_RULES: Array<{
  key: WorkspaceIconKey;
  keywords: string[];
}> = [
  { key: 'handshake', keywords: ['client', 'customer', 'sales', 'crm', '客户', '销售', '商务', '合作', '商机'] },
  { key: 'briefcase', keywords: ['project', 'product', 'roadmap', 'sprint', '项目', '需求', '版本', '计划', '产品'] },
  { key: 'users', keywords: ['team', 'people', 'interview', 'hiring', 'recruit', '候选人', '面试', '招聘', '团队', '组织'] },
  { key: 'landmark', keywords: ['policy', 'government', 'politics', 'public', '政策', '政府', '政治', '公共事务'] },
  { key: 'scale', keywords: ['law', 'legal', 'contract', 'compliance', '法规', '法务', '法律', '合规', '合同'] },
  { key: 'graduation', keywords: ['course', 'class', 'edu', 'learning', '课程', '教学', '学习', '培训', '课堂'] },
  { key: 'research', keywords: ['research', 'study', 'analysis', 'lab', '研究', '分析', '实验', '课题'] },
  { key: 'idea', keywords: ['brainstorm', 'idea', 'creative', 'brand', '创意', '头脑风暴', '品牌', '灵感'] },
  { key: 'health', keywords: ['health', 'medical', 'clinic', 'patient', '医疗', '健康', '门诊', '患者'] },
  { key: 'mic', keywords: ['podcast', 'audio', 'interviewing', 'recording', '播客', '采访', '录音', '对谈'] },
  { key: 'book', keywords: ['knowledge', 'library', 'wiki', 'docs', '知识', '资料', '文档', '百科'] },
  { key: 'message', keywords: ['meeting', 'chat', 'support', 'feedback', '会议', '沟通', '反馈', '客服'] },
  { key: 'building', keywords: ['company', 'org', 'enterprise', 'business', '公司', '企业', '机构', '部门'] },
  { key: 'notes', keywords: ['note', 'memo', 'summary', '记录', '纪要', '笔记'] },
];

export const WORKSPACE_ICON_COMPONENTS: Record<WorkspaceIconKey, LucideIcon> = WORKSPACE_ICON_OPTIONS.reduce(
  (map, option) => {
    map[option.key] = option.icon;
    return map;
  },
  {} as Record<WorkspaceIconKey, LucideIcon>
);

export function getWorkspaceIcon(key?: string | null): LucideIcon {
  if (key && key in WORKSPACE_ICON_COMPONENTS) {
    return WORKSPACE_ICON_COMPONENTS[key as WorkspaceIconKey];
  }
  return WORKSPACE_ICON_COMPONENTS[DEFAULT_WORKSPACE_ICON_KEY];
}

export function getDefaultWorkspaceIconKey(): WorkspaceIconKey {
  return DEFAULT_WORKSPACE_ICON_KEY;
}

export function suggestWorkspaceIconKey(input: string): WorkspaceIconKey {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return DEFAULT_WORKSPACE_ICON_KEY;

  for (const rule of WORKSPACE_ICON_KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.key;
    }
  }

  return DEFAULT_WORKSPACE_ICON_KEY;
}
