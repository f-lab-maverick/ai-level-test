function testApp() {
    return {
        // 상태
        currentScreen: 'start', // 'start', 'test', 'loading'

        // 문항 데이터
        testData: null,
        levelConfig: null,
        questions: [],
        currentQuestionIndex: 0,
        currentQuestion: null,

        // 응답 데이터
        answers: [],
        selectedAnswer: null,
        correctCount: 0,

        // UI 상태
        answeredCount: 0,
        totalQuestions: 10,
        progress: 0,

        // 초기화
        async init() {
            try {
                const [testResponse, configResponse] = await Promise.all([
                    fetch('f-lab-ai-test-questions.json'),
                    fetch('level-config.json')
                ]);

                this.testData = await testResponse.json();
                this.levelConfig = await configResponse.json();

                this.questions = Object.values(this.testData.questions);
                this.totalQuestions = this.questions.length;
                console.log('테스트 데이터 로드 완료:', this.totalQuestions, '문항');
            } catch (error) {
                console.error('데이터 로드 실패:', error);
                alert('테스트 데이터를 불러오는데 실패했습니다.');
            }
        },

        // 테스트 시작
        startTest() {
            this.currentScreen = 'test';
            this.currentQuestionIndex = 0;
            this.loadQuestion(0);
        },

        // 문항 로드
        loadQuestion(index) {
            if (index >= this.questions.length) {
                this.completeTest();
                return;
            }

            this.currentQuestion = this.questions[index];
            this.currentQuestionIndex = index;
            this.selectedAnswer = null;
            this.updateProgress();
        },

        // 답변 선택
        selectAnswer(answerId) {
            this.selectedAnswer = answerId;
        },

        // 답변 제출
        submitAnswer() {
            if (!this.selectedAnswer) return;

            const isCorrect = this.selectedAnswer === this.currentQuestion.correct_answer;

            // 답변 저장
            const answer = {
                questionId: this.currentQuestion.id,
                answerId: this.selectedAnswer,
                isCorrect: isCorrect,
                correctAnswer: this.currentQuestion.correct_answer,
                level: this.currentQuestion.level,
                title: this.currentQuestion.title
            };

            this.answers.push(answer);
            this.answeredCount++;

            if (isCorrect) {
                this.correctCount++;
            }

            console.log(`Q${this.currentQuestionIndex + 1}: ${isCorrect ? '✓ 정답' : '✗ 오답'} (${this.correctCount}/${this.answeredCount})`);

            // 다음 문항
            this.loadQuestion(this.currentQuestionIndex + 1);
        },

        // 테스트 완료
        completeTest() {
            console.log('테스트 완료!');
            console.log('정답:', this.correctCount, '/', this.totalQuestions);

            this.currentScreen = 'loading';

            // 결과 계산
            setTimeout(() => {
                const result = this.calculateResult();
                this.saveAndRedirect(result);
            }, 1500);
        },

        // 결과 계산
        calculateResult() {
            const level = this.determineLevel();
            const score = Math.round((this.correctCount / this.totalQuestions) * 100);

            // 레벨별 정답 분석
            const levelAnalysis = this.analyzeLevelPerformance();

            return {
                level: level,
                score: score,
                correct: this.correctCount,
                total: this.totalQuestions,
                levelAnalysis: JSON.stringify(levelAnalysis),
                answers: JSON.stringify(this.answers.map(a => ({
                    id: a.questionId,
                    correct: a.isCorrect,
                    selected: a.answerId
                })))
            };
        },

        // 레벨별 성과 분석
        analyzeLevelPerformance() {
            const analysis = {};

            for (const answer of this.answers) {
                const lvl = `Lv${answer.level}`;
                if (!analysis[lvl]) {
                    analysis[lvl] = { correct: 0, total: 0 };
                }
                analysis[lvl].total++;
                if (answer.isCorrect) {
                    analysis[lvl].correct++;
                }
            }

            return analysis;
        },

        // 레벨 판정 (정답 수 기반)
        determineLevel() {
            const correct = this.correctCount;

            // config에서 레벨 임계값 사용
            if (this.levelConfig) {
                const thresholds = this.levelConfig.scoring.levelThresholds;
                const levels = ['Lv6', 'Lv5', 'Lv4', 'Lv3', 'Lv2', 'Lv1'];

                for (const level of levels) {
                    if (correct >= thresholds[level]) {
                        return level;
                    }
                }
                return 'Lv1';
            }

            // 폴백: 하드코딩된 임계값 (25문항 기준)
            if (correct >= 24) return 'Lv6';  // 96%+ : AI 아키텍트
            if (correct >= 21) return 'Lv5';  // 84%+ : AI Agent 개발자
            if (correct >= 17) return 'Lv4';  // 68%+ : AI 시스템 설계자
            if (correct >= 13) return 'Lv3';  // 52%+ : RAG 개발자
            if (correct >= 8) return 'Lv2';   // 32%+ : 프롬프트 엔지니어
            return 'Lv1';                     // ~32% : AI 입문자
        },

        // 결과 저장 및 리다이렉트
        saveAndRedirect(result) {
            // 로컬스토리지에 저장
            localStorage.setItem('testResult', JSON.stringify(result));

            // URL 파라미터로 결과 페이지 이동
            const params = new URLSearchParams({
                level: result.level,
                score: result.score,
                correct: result.correct,
                total: result.total
            });
            window.location.href = `result.html?${params.toString()}`;
        },

        // 진행률 업데이트
        updateProgress() {
            this.progress = (this.answeredCount / this.totalQuestions) * 100;
        },

        // Computed: 현재 스테이지 (UI 표시용)
        get currentStage() {
            return Math.ceil((this.currentQuestionIndex + 1) / 4) || 1;
        },

        // Computed: 예상 총 문항수 (UI 표시용)
        get estimatedTotal() {
            return this.totalQuestions;
        }
    };
}
