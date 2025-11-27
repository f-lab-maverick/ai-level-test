function resultApp() {
    return {
        result: {
            level: 'Lv3',
            score: 50,
            correct: 13,
            total: 25
        },

        testData: null,
        levelConfig: null,
        levelInfo: {},
        levelBreakdown: [],
        questionResults: [],

        // 레벨 이름 (프로그레스 바용 - config에서 로드)
        levelNames: [],

        async init() {
            await Promise.all([
                this.loadTestData(),
                this.loadLevelConfig()
            ]);
            this.loadResultFromURL();
            this.setupLevelInfo();
            this.setupLevelBreakdown();
            this.setupQuestionResults();
        },

        async loadTestData() {
            try {
                const response = await fetch('f-lab-ai-test-questions.json');
                this.testData = await response.json();
            } catch (error) {
                console.error('테스트 데이터 로드 실패:', error);
            }
        },

        async loadLevelConfig() {
            try {
                const response = await fetch('level-config.json');
                this.levelConfig = await response.json();
                this.levelNames = this.levelConfig.ui.progressBarLabels;
            } catch (error) {
                console.error('레벨 설정 로드 실패:', error);
                // 폴백: 기본값 사용
                this.levelNames = ['입문', '프롬프트', 'RAG', '시스템설계', 'Agent', '아키텍트'];
            }
        },

        loadResultFromURL() {
            const params = new URLSearchParams(window.location.search);

            if (params.has('level')) {
                this.result = {
                    level: params.get('level') || 'Lv3',
                    score: parseInt(params.get('score')) || 50,
                    correct: parseInt(params.get('correct')) || 13,
                    total: parseInt(params.get('total')) || 25
                };
            }

            const stored = localStorage.getItem('testResult');
            if (stored) {
                const storedResult = JSON.parse(stored);
                this.result = { ...this.result, ...storedResult };
            }
        },

        // 레벨 숫자 반환 (프로그레스 바용)
        getLevelNum() {
            const match = this.result.level.match(/\d+/);
            return match ? parseInt(match[0]) : 1;
        },

        setupLevelInfo() {
            if (this.levelConfig) {
                const config = this.levelConfig.levels[this.result.level];
                if (config) {
                    this.levelInfo = {
                        name: config.name,
                        achievementTitle: config.achievementTitle,
                        achievement: config.achievement,
                        nextLevel: config.nextLevel,
                        nextLevelName: config.nextLevelName,
                        nextDescription: config.nextDescription,
                        nextTips: config.nextTips
                    };
                    return;
                }
            }

            // 폴백: 기본 Lv3 데이터
            this.levelInfo = {
                name: 'RAG 개발자',
                achievementTitle: 'RAG 실무 역량을 갖추고 계십니다!',
                achievement: 'RAG의 개념, 청킹 전략, 벡터 검색, 캐시 설계 등 데이터 기반 AI 시스템 구축 역량이 있습니다.',
                nextLevel: 'Lv4',
                nextLevelName: 'AI 시스템 설계자',
                nextDescription: 'Function Calling, 가드레일, 구조화 출력 등 고급 기능으로 안정적인 시스템을 설계하는 단계입니다.',
                nextTips: [
                    'Function Calling으로 LLM에 외부 도구 연결하기',
                    '가드레일과 보안 레이어 설계 학습',
                    'Structured Output과 JSON Schema 활용하기'
                ]
            };
        },

        setupLevelBreakdown() {
            const stored = localStorage.getItem('testResult');
            let levelAnalysis = {};

            if (stored) {
                const storedResult = JSON.parse(stored);
                if (storedResult.levelAnalysis) {
                    levelAnalysis = typeof storedResult.levelAnalysis === 'string'
                        ? JSON.parse(storedResult.levelAnalysis)
                        : storedResult.levelAnalysis;
                }
            }

            if (this.levelConfig) {
                const levels = this.levelConfig.ui.levelOrder;
                this.levelBreakdown = levels.map(lvl => {
                    const config = this.levelConfig.levels[lvl];
                    const analysis = levelAnalysis[lvl] || { correct: 0, total: config.totalQuestions };
                    return {
                        level: lvl,
                        title: config.categoryTitle,
                        passed: analysis.correct >= config.passRequirement,
                        status: `${analysis.correct}/${analysis.total || config.totalQuestions}`
                    };
                });
            } else {
                // 폴백: 하드코딩된 기본값
                const levelTitles = {
                    1: 'LLM 기본/프롬프트',
                    2: 'LLM 핵심 개념',
                    3: 'RAG/벡터 검색',
                    4: '시스템 설계/보안',
                    5: 'AI Agent/메모리',
                    6: '멀티모달/안전'
                };
                const passReqs = { 1: 2, 2: 2, 3: 3, 4: 4, 5: 2, 6: 1 };
                const totals = { 1: 3, 2: 5, 3: 5, 4: 7, 5: 3, 6: 2 };

                this.levelBreakdown = [1, 2, 3, 4, 5, 6].map(num => {
                    const lvl = `Lv${num}`;
                    const analysis = levelAnalysis[lvl] || { correct: 0, total: totals[num] };
                    return {
                        level: lvl,
                        title: levelTitles[num],
                        passed: analysis.correct >= passReqs[num],
                        status: `${analysis.correct}/${analysis.total || totals[num]}`
                    };
                });
            }
        },

        setupQuestionResults() {
            if (!this.testData) return;

            const stored = localStorage.getItem('testResult');
            let userAnswers = [];

            if (stored) {
                const storedResult = JSON.parse(stored);
                if (storedResult.answers) {
                    userAnswers = typeof storedResult.answers === 'string'
                        ? JSON.parse(storedResult.answers)
                        : storedResult.answers;
                }
            }

            const questions = Object.values(this.testData.questions);
            this.questionResults = questions.map(q => {
                const userAnswer = userAnswers.find(a => a.id === q.id);
                return {
                    id: q.id,
                    level: q.level,
                    title: q.title,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correct_answer,
                    userAnswer: userAnswer?.selected || null,
                    isCorrect: userAnswer?.correct || false,
                    explanation: q.explanation
                };
            });
        },

        shareResult() {
            const url = window.location.href;
            let text;

            if (this.levelConfig) {
                text = this.levelConfig.ui.shareMessageTemplate
                    .replace('{level}', this.result.level)
                    .replace('{levelName}', this.levelInfo.name)
                    .replace('{correct}', this.result.correct)
                    .replace('{total}', this.result.total);
            } else {
                text = `나의 AI 역량은 ${this.result.level} ${this.levelInfo.name}! (${this.result.correct}/${this.result.total} 정답)`;
            }

            if (navigator.share) {
                navigator.share({
                    title: 'F-Lab AI 역량 진단 결과',
                    text: text,
                    url: url
                });
            } else {
                navigator.clipboard.writeText(url);
                alert('결과 링크가 복사되었습니다!');
            }
        }
    };
}
