import { Injectable } from '@nestjs/common';

export interface Quiz {
  id: string;
  moduleId: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizResult {
  quizId: string;
  driverId: string;
  score: number;
  passed: boolean;
  answers: { questionId: string; correct: boolean }[];
  completedAt: Date;
}

@Injectable()
export class AssessmentService {
  private quizzes: Map<string, Quiz> = new Map();

  constructor() {
    this.loadQuizzes();
  }

  private loadQuizzes(): void {
    const quizzes: Quiz[] = [
      {
        id: 'quiz_m3',
        moduleId: 'm3',
        passingScore: 80,
        questions: [
          { id: 'q1', question: 'What is the safe following distance?', options: ['1 car', '2 seconds', '3 car lengths', '5 meters'], correctIndex: 1 },
          { id: 'q2', question: 'How often should you check mirrors?', options: ['Every 5 min', 'Every 5-8 sec', 'Only at turns', 'Weekly'], correctIndex: 1 },
        ],
      },
      {
        id: 'quiz_m4',
        moduleId: 'm4',
        passingScore: 75,
        questions: [
          { id: 'q1', question: 'Max food delivery time?', options: ['30 min', '1 hour', '2 hours', 'Until cold'], correctIndex: 1 },
        ],
      },
      {
        id: 'quiz_m9',
        moduleId: 'm9',
        passingScore: 80,
        questions: [
          { id: 'q1', question: 'Speed limit in school zone?', options: ['60 km/h', '40 km/h', '80 km/h', 'No limit'], correctIndex: 1 },
        ],
      },
    ];

    for (const q of quizzes) {
      this.quizzes.set(q.id, q);
    }
  }

  /**
   * Get quiz for module
   */
  async getQuiz(moduleId: string): Promise<Quiz | null> {
    for (const quiz of this.quizzes.values()) {
      if (quiz.moduleId === moduleId) {
        return { ...quiz, questions: quiz.questions.map(q => ({ ...q, options: q.options })) };
      }
    }
    return null;
  }

  /**
   * Submit quiz
   */
  async submitQuiz(data: {
    driverId: string;
    moduleId: string;
    answers: number[];
  }): Promise<QuizResult> {
    const quiz = await this.getQuiz(data.moduleId);
    if (!quiz) throw new Error('Quiz not found');

    let correct = 0;
    const answerResults = quiz.questions.map((q, i) => {
      const isCorrect = data.answers[i] === q.correctIndex;
      if (isCorrect) correct++;
      return { questionId: q.id, correct: isCorrect };
    });

    const score = Math.floor((correct / quiz.questions.length) * 100);
    
    return {
      quizId: quiz.id,
      driverId: data.driverId,
      score,
      passed: score >= quiz.passingScore,
      answers: answerResults,
      completedAt: new Date(),
    };
  }

  /**
   * Get passing score
   */
  async getPassingScore(moduleId: string): Promise<number> {
    const quiz = await this.getQuiz(moduleId);
    return quiz?.passingScore || 70;
  }

  /**
   * Get assessment history
   */
  async getDriverAssessments(driverId: string): Promise<QuizResult[]> {
    // Would fetch from storage
    return [];
  }

  /**
   * Generate certificate
   */
  async generateCertificate(driverId: string): Promise<{
    issued: boolean;
    certificateId?: string;
    issuedAt: Date;
  }> {
    return {
      issued: true,
      certificateId: `cert_${driverId}_${Date.now()}`,
      issuedAt: new Date(),
    };
  }
}