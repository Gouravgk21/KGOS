import { create } from 'zustand';
import { db, type Exam } from '../db/database';

interface ExamStoreState {
  addExam: (exam: Omit<Exam, 'createdAt'>) => Promise<number>;
  updateExam: (id: number, updates: Partial<Exam>) => Promise<number>;
  deleteExam: (id: number) => Promise<void>;
  logStudyHours: (id: number, hours: number) => Promise<number | undefined>;
}

export const useExamStore = create<ExamStoreState>(() => ({
  addExam: async (exam) => {
    return await db.exams.add({
      ...exam,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateExam: async (id, updates) => {
    return await db.exams.update(id, updates);
  },
  deleteExam: async (id) => {
    return await db.exams.delete(id);
  },
  logStudyHours: async (id, hours) => {
    const exam = await db.exams.get(id);
    if (!exam) return;
    const studyHours = (exam.studyHours || 0) + hours;
    await db.exams.update(id, { studyHours });
    return id;
  }
}));
