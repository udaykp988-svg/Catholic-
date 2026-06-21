/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Types of liturgical seasons
export type LiturgicalSeason = 'Ordinary Time' | 'Lent' | 'Easter' | 'Advent' | 'Christmas';

export interface FeastDay {
  id: string;
  date: string; // ISO date string or MM-DD
  title: string;
  feastLevel: 'Solemnity' | 'Feast' | 'Memorial' | 'Optional Memorial';
  season: LiturgicalSeason;
  color: 'green' | 'violet' | 'white' | 'red' | 'rose';
  description: string;
  saintBrief?: string;
  readings?: string;
}

export interface ScriptureReading {
  id: string;
  day: number;
  chapter: string;
  verses: string;
  text: string;
  reflection: string;
  completed: boolean;
}

export interface PersonalIntention {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  answered: boolean;
  notes?: string;
  reminderEnabled: boolean;
  reminderTime?: string;
  sharedToWall: boolean;
  isArchived?: boolean;
  category?: string;
}

export interface CommunityPrayer {
  id: string;
  content: string;
  authorName: string; // "Anonymous" or custom initials
  createdAt: string;
  amenCount: number;
  category: 'Healing' | 'Family' | 'Thanksgiving' | 'Strength' | 'Hope' | 'Other';
}

export interface Novena {
  id: string;
  title: string;
  description: string;
  targetSaint: string;
  currentDay: number; // 0 means not started, 1-9 means current day
  completedDays: number[]; // e.g. [1, 2, 3] if completed days 1, 2, 3
  prayersByDay: {
    day: number;
    prayer: string;
    intentionBrief: string;
  }[];
}

export interface UserStats {
  streak: number;
  lastPrayerDate: string; // YYYY-MM-DD
  totalPrayersCount: number;
  completedScripturesCount: number;
  lastReadDate?: string;
}

export interface DailyReflection {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  verse: string;
  reference: string;
  reflectionText: string;
  morningPrayer: string;
  eveningPrayer: string;
}

export interface Saint {
  id: string;
  name: string;
  title: string;
  feastDay: string;
  patronage: string;
  era: string;
  color: 'green' | 'violet' | 'white' | 'red' | 'rose' | 'blue';
  biography: string;
  virtues: string[];
  traditionalPrayer: string;
  liturgicalAffiliation?: string;
  imageSeed?: string; // used for generating beautiful visual avatars or icons
}

