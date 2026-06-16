'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type MockTest } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  Award, Play, ArrowRight, Brain, Clock, ChevronRight, ChevronLeft, 
  Save, CheckCircle, AlertCircle, RefreshCw, BarChart2, ShieldAlert
} from 'lucide-react';

interface Question {
  id: number;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  subject: string;
}

// 20 High-Quality Food Science / FSSAI MCQs
const MCQ_BANK: Question[] = [
  {
    id: 1,
    q: "Which red seaweed genus is the primary industrial source for Kappa Carrageenan?",
    options: ["Eucheuma cottonii (Kappaphycus alvarezii)", "Eucheuma spinosum", "Chondrus crispus", "Gigartina stellata"],
    correct: 0,
    explanation: "Eucheuma cottonii (Kappaphycus alvarezii) yields primarily Kappa Carrageenan, whereas Eucheuma spinosum yields Iota Carrageenan.",
    subject: "Food Science & Technology"
  },
  {
    id: 2,
    q: "Which cation is highly specific for inducing gelation in Kappa Carrageenan by stabilizing double helix aggregation?",
    options: ["Sodium (Na+)", "Potassium (K+)", "Calcium (Ca2+)", "Magnesium (Mg2+)"],
    correct: 1,
    explanation: "Potassium ions fit perfectly in the helical cavity of Kappa Carrageenan, reducing electrostatic repulsion and promoting aggregate gelation. Calcium is more specific for Iota Carrageenan.",
    subject: "Food Science & Technology"
  },
  {
    id: 3,
    q: "What type of gel texture is characteristic of pure Kappa Carrageenan in water?",
    options: ["Soft and elastic with no syneresis", "Highly viscous non-gelling liquid", "Brittle, rigid, and prone to syneresis", "Thermally irreversible chemogel"],
    correct: 2,
    explanation: "Kappa Carrageenan forms rigid, brittle gels that tend to contract and squeeze out water (syneresis). This is often modified by blending with Locust Bean Gum.",
    subject: "Food Science & Technology"
  },
  {
    id: 4,
    q: "Which carrageenan type is fully soluble in cold water and does not form a gel structure?",
    options: ["Kappa-1 Carrageenan", "Iota Carrageenan", "Lambda Carrageenan", "Kappa-2 Carrageenan"],
    correct: 2,
    explanation: "Lambda Carrageenan has three sulfate groups per disaccharide unit, which prevents helical nesting and gel formation. It acts purely as a cold-soluble thickener.",
    subject: "Food Science & Technology"
  },
  {
    id: 5,
    q: "Under the FSSAI Act 2006, what is the maximum statutory imprisonment for selling sub-standard or adulterated food items which results in death?",
    options: ["Not less than 7 years, extending up to life imprisonment", "Maximum of 3 years", "5 years with fine", "No imprisonment, only monetary penalties"],
    correct: 0,
    explanation: "Section 59 of the FSS Act 2006 mandates imprisonment of not less than 7 years, extending to life, along with a fine of not less than 10 Lakh Rupees for adulteration causing death.",
    subject: "Food Safety & Regulations"
  },
  {
    id: 6,
    q: "Which section of the FSSAI Act 2006 defines the general principles of Food Safety to be followed in administration?",
    options: ["Section 12", "Section 16", "Section 18", "Section 22"],
    correct: 2,
    explanation: "Section 18 of the Food Safety and Standards Act, 2006 lays down the General Principles to be followed in the administration of the Act.",
    subject: "Food Safety & Regulations"
  },
  {
    id: 7,
    q: "Which FSSAI regulation mandates nutrition labeling rules including allergen declaration and vegetarian/non-vegetarian logos?",
    options: ["FSS (Packaging) Regulations 2018", "FSS (Labelling and Display) Regulations 2020", "FSS (Contaminants) Regulations 2011", "FSS (Approval of Non-Specified Food) Regulations 2017"],
    correct: 1,
    explanation: "FSS (Labelling and Display) Regulations 2020 came into effect to enforce clean allergen details, vegetarian logos, and front-of-pack nutritional declarations.",
    subject: "Food Safety & Regulations"
  },
  {
    id: 8,
    q: "Which food pathogen is characterized as a psychrotrophic gram-positive rod that can grow at refrigeration temperatures, posing a major threat to dairy products?",
    options: ["Salmonella enterica", "Escherichia coli O157:H7", "Listeria monocytogenes", "Clostridium botulinum"],
    correct: 2,
    explanation: "Listeria monocytogenes is psychrotrophic, meaning it grows at refrigerated temperatures (4°C), and causes listeriosis, which has a high mortality rate.",
    subject: "Food Microbiology"
  },
  {
    id: 9,
    q: "What is the primary target organism when validating canning thermal processes (sterilization/12D reduction) in low-acid foods?",
    options: ["Bacillus cereus", "Clostridium botulinum", "Staphylococcus aureus", "Salmonella typhimurium"],
    correct: 1,
    explanation: "Clostridium botulinum is the most heat-resistant anaerobic spore-forming pathogen. Thermal processes are designed to achieve a 12-decimal reduction of its spores.",
    subject: "Food Microbiology"
  },
  {
    id: 10,
    q: "In HACCP guidelines, which principle refers to setting up corrective actions when monitoring shows a Critical Control Point (CCP) is out of control?",
    options: ["Principle 3", "Principle 4", "Principle 5", "Principle 6"],
    correct: 2,
    explanation: "Principle 5 of HACCP establishes corrective actions to be taken when monitoring indicates that a particular CCP has deviated from its critical limits.",
    subject: "Food Microbiology"
  },
  {
    id: 11,
    q: "Which polysaccharide exhibits thermoreversible gelation and is extracted from brown seaweeds, requiring divalent ions like Calcium to gel?",
    options: ["Sodium Alginate", "Guar Gum", "Xanthan Gum", "Locust Bean Gum"],
    correct: 0,
    explanation: "Sodium Alginate is extracted from brown seaweeds (Phaeophyceae) and forms heat-stable ionic gels in the presence of calcium ions (egg-box model).",
    subject: "Food Science & Technology"
  },
  {
    id: 12,
    q: "What synergism is exploited by combining Xanthan Gum with Locust Bean Gum (LBG) in food formulations?",
    options: ["Precipitation of proteins", "Formation of a cohesive thermoreversible gel", "Extreme decrease in viscosity", "Syneresis increase"],
    correct: 1,
    explanation: "While neither Xanthan nor LBG gels on its own in water, their blend forms a cohesive, elastic, thermoreversible gel due to intermolecular alignment between the xanthan helix and the unsubstituted regions of LBG.",
    subject: "Food Science & Technology"
  },
  {
    id: 13,
    q: "What is the default threshold value of water activity (Aw) below which most pathogenic food-borne bacteria cannot grow?",
    options: ["0.60", "0.75", "0.85", "0.91"],
    correct: 3,
    explanation: "Most food-borne bacterial pathogens require a minimum water activity of 0.91 to multiply, although halophilic bacteria and molds can grow at much lower levels.",
    subject: "Food Microbiology"
  },
  {
    id: 14,
    q: "Which enzyme is internationally accepted as a marker for pasteurization efficiency in milk processing?",
    options: ["Amylase", "Alkaline Phosphatase", "Lipase", "Peroxidase"],
    correct: 1,
    explanation: "Alkaline phosphatase has a slightly higher heat resistance than Coxiella burnetii. Thus, its inactivation proves pasteurization was successful.",
    subject: "Food Science & Technology"
  },
  {
    id: 15,
    q: "What is the chemical composition of commercial FSSAI-approved Pink Salt?",
    options: ["Pure Potassium Chloride", "Sodium Chloride with trace iron oxide minerals", "Magnesium Sulfate", "Calcium Silicate"],
    correct: 1,
    explanation: "Pink Himalayan salt consists primarily of Sodium Chloride with trace impurities of iron oxides and potassium, giving it its characteristic pink hue.",
    subject: "General Science"
  }
];

export default function MockTestsPage() {
  const exams = useLiveQuery(() => db.exams.toArray()) || [];
  const pastTests = useLiveQuery(() => db.mockTests.toArray()) || [];

  // Configuration States
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(15); // in minutes

  // Test Engine Active States
  const [isActiveTest, setIsActiveTest] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // qId -> optionIdx
  const [timeLeft, setTimeLeft] = useState(0); // in seconds

  // Review & Score State
  const [testResult, setTestResult] = useState<MockTest | null>(null);

  // Timer Ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (exams.length > 0 && !selectedExamId) {
      setSelectedExamId(exams[0].id!.toString());
    }
  }, [exams, selectedExamId]);

  // Timer countdown hook
  useEffect(() => {
    if (isActiveTest && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            handleSubmitTest();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActiveTest, timeLeft]);

  // Start Test Configuration
  const handleStartTest = () => {
    if (!selectedExamId) {
      alert('Select an active exam first.');
      return;
    }

    // Filter MCQs based on chosen subject
    let pool = [...MCQ_BANK];
    if (selectedSubject !== 'All') {
      pool = pool.filter(q => q.subject === selectedSubject);
    }

    if (pool.length === 0) {
      alert('No questions in MCQ bank for this specific subject yet. Try "All Subjects".');
      return;
    }

    // Shuffle and pick limit
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, pool.length));

    setActiveQuestions(selected);
    setCurrentQIdx(0);
    setAnswers({});
    setTimeLeft(timeLimit * 60);
    setIsActiveTest(true);
    setTestResult(null);
  };

  // Submit test and calculate score
  const handleSubmitTest = async () => {
    setIsActiveTest(false);
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    const questionsLog = activeQuestions.map(q => {
      const chosen = answers[q.id];
      const isCorrect = chosen === q.correct;
      if (isCorrect) correctCount++;

      return {
        q: q.q,
        options: q.options,
        correct: q.correct,
        chosen: chosen !== undefined ? chosen : -1,
        explanation: q.explanation
      };
    });

    const elapsedSeconds = (timeLimit * 60) - timeLeft;
    const elapsedMinutes = Math.round(elapsedSeconds / 60) || 1;

    const resultData: MockTest = {
      examId: parseInt(selectedExamId),
      title: `${selectedSubject} Mock Practice`,
      subject: selectedSubject,
      totalQuestions: activeQuestions.length,
      correctAnswers: correctCount,
      timeTaken: elapsedMinutes,
      dateTaken: new Date().toISOString().split('T')[0],
      questions: JSON.stringify(questionsLog),
      createdAt: new Date().toISOString()
    };

    // Store in Dexie MockTests table
    const id = await db.mockTests.add(resultData);
    setTestResult({ ...resultData, id: id as number });
  };

  // Format countdown clock MM:SS
  const formatTime = (secs: number) => {
    const mm = Math.floor(secs / 60).toString().padStart(2, '0');
    const ss = (secs % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#00B4D8] text-xs font-mono mb-1">
            <a href="/exams" className="hover:underline">Exam OS</a>
            <span>/</span>
            <span>Mock Tests</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <Brain className="w-8 h-8 text-[#00B4D8]" />
            MOCK TEST ENGINE
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build exam confidence under real time limits with our conceptual food science question bank.
          </p>
        </div>
      </div>

      {/* WORKSPACE GRID */}
      {!isActiveTest && !testResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Configure New Practice Test */}
          <div className="lg:col-span-1">
            <Card header={<span className="text-sm font-semibold text-slate-200">Start Practice Simulator</span>}>
              <div className="flex flex-col gap-4">
                
                {/* Select Exam */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold font-mono">Target Exam</label>
                  <select
                    value={selectedExamId}
                    onChange={e => setSelectedExamId(e.target.value)}
                    className="w-full py-2 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-slate-700"
                  >
                    <option value="">Select Exam...</option>
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                {/* Select Subject */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold font-mono">Subject Scope</label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full py-2 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-slate-700"
                  >
                    <option value="All">All Subjects</option>
                    <option value="Food Science & Technology">Food Science & Technology</option>
                    <option value="Food Safety & Regulations">Food Safety & Regulations</option>
                    <option value="Food Microbiology">Food Microbiology</option>
                  </select>
                </div>

                {/* Question Count */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold font-mono">Question Count</label>
                  <select
                    value={questionCount}
                    onChange={e => setQuestionCount(parseInt(e.target.value))}
                    className="w-full py-2 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-slate-700"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>

                {/* Time Limit */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold font-mono">Time Limit (Minutes)</label>
                  <select
                    value={timeLimit}
                    onChange={e => setTimeLimit(parseInt(e.target.value))}
                    className="w-full py-2 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-slate-700"
                  >
                    <option value={5}>5 Minutes</option>
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                  </select>
                </div>

                <button
                  onClick={handleStartTest}
                  className="w-full btn-primary text-xs py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 fill-white" /> Start Practice Exam
                </button>
              </div>
            </Card>
          </div>

          {/* Test History Library */}
          <div className="lg:col-span-2">
            <Card header={<span className="text-sm font-semibold text-slate-200">Practice Score History</span>}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest font-mono text-[9px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Subject / Title</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Accuracy</th>
                      <th className="py-2.5 px-3">Time taken</th>
                      <th className="py-2.5 px-3 text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastTests.map(t => {
                      const accuracy = Math.round((t.correctAnswers / t.totalQuestions) * 100) || 0;
                      return (
                        <tr key={t.id} className="border-b border-slate-850 hover:bg-slate-900/40">
                          <td className="py-3 px-3 text-slate-400 font-mono">{t.dateTaken}</td>
                          <td className="py-3 px-3 font-semibold text-slate-200">{t.title}</td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-300">
                            {t.correctAnswers} / {t.totalQuestions}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                              accuracy >= 70 ? 'bg-emerald-500/10 text-emerald-400' :
                              accuracy >= 45 ? 'bg-amber-500/10 text-amber-400' :
                              'bg-rose-500/10 text-rose-400'
                            }`}>
                              {accuracy}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono">{t.timeTaken} mins</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setTestResult(t)}
                              className="text-[#00B4D8] hover:underline text-[10px] font-semibold cursor-pointer"
                            >
                              Inspect Detailed Analysis
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {pastTests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500">
                          No practice test records logged. Complete a test above to sync results.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* ACTIVE TEST ENGINE INTERFACE (Full screen overlay simulation) */}
      {isActiveTest && (
        <div className="fixed inset-0 bg-[#0B1220] z-[100] p-6 flex flex-col justify-between overflow-y-auto">
          
          {/* Header Progress and Timer */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">MCQ Practice Simulator</span>
              <h2 className="text-lg font-serif font-bold text-slate-200 mt-0.5">
                Question {currentQIdx + 1} of {activeQuestions.length}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-[#D4A017]">
                <Clock className="w-4 h-4 animate-pulse" />
                <span className="font-mono font-bold text-base">{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={() => { if(confirm('Abort active test? Progress will not be saved.')) setIsActiveTest(false); }}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer"
              >
                Abort
              </button>
            </div>
          </div>

          {/* Core MCQ display */}
          <div className="flex-1 max-w-3xl mx-auto w-full py-8 flex flex-col md:flex-row gap-8 justify-center items-stretch">
            
            {/* Left Column: Question & Radio options */}
            <div className="flex-1 flex flex-col gap-6 justify-center">
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
                <span className="px-2 py-0.5 text-[8px] font-mono tracking-wider bg-[#006D77]/20 border border-[#006D77]/30 text-[#00B4D8] rounded w-fit">
                  {activeQuestions[currentQIdx].subject}
                </span>
                <p className="text-sm md:text-base font-semibold leading-relaxed text-slate-100 font-serif">
                  {activeQuestions[currentQIdx].q}
                </p>
              </div>

              {/* Radio options */}
              <div className="flex flex-col gap-3">
                {activeQuestions[currentQIdx].options.map((opt, idx) => {
                  const isChecked = answers[activeQuestions[currentQIdx].id] === idx;
                  return (
                    <label 
                      key={idx}
                      onClick={() => setAnswers(prev => ({ ...prev, [activeQuestions[currentQIdx].id]: idx }))}
                      className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-slate-900 border-[#00B4D8]/50 text-slate-100 shadow-sm' 
                          : 'bg-[#0F172A]/50 border-slate-850 hover:border-slate-800 text-slate-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${activeQuestions[currentQIdx].id}`}
                        checked={isChecked}
                        readOnly
                        className="accent-[#00B4D8] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs md:text-sm font-semibold">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Question Grid and submission (Quick Navigation Grid) */}
            <div className="w-full md:w-[220px] bg-[#0F172A]/40 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Question Grid</h4>
                <div className="grid grid-cols-5 gap-2">
                  {activeQuestions.map((q, idx) => {
                    const answered = answers[q.id] !== undefined;
                    const isActive = idx === currentQIdx;

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQIdx(idx)}
                        className={`w-9 h-9 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-[#00B4D8] text-[#0B1220] ring-2 ring-[#00B4D8]/30 shadow-md'
                            : answered 
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-900 border border-slate-850 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSubmitTest}
                className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white text-xs py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg mt-4 md:mt-0"
              >
                Submit Practice Exam
              </button>
            </div>

          </div>

          {/* Footer controls */}
          <div className="flex justify-between items-center max-w-3xl mx-auto w-full border-t border-slate-800 pt-4">
            <button
              onClick={() => setCurrentQIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQIdx === 0}
              className="bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            
            <button
              onClick={() => setCurrentQIdx(prev => Math.min(activeQuestions.length - 1, prev + 1))}
              disabled={currentQIdx === activeQuestions.length - 1}
              className="bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY & ANALYSIS SCREEN */}
      {testResult && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          {/* Summary KPI Panel */}
          <Card header={<span className="text-zinc-200 font-semibold font-serif text-base flex items-center gap-2"><Award className="w-5 h-5 text-[#D4A017]" /> Practice Test Performance Scorecard</span>}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center py-4">
              <div className="flex flex-col justify-center items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">SCORE CARD</span>
                <span className="text-3xl font-serif font-bold text-slate-100">{testResult.correctAnswers} / {testResult.totalQuestions}</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">ACCURACY</span>
                <span className={`text-3xl font-serif font-bold ${
                  (testResult.correctAnswers / testResult.totalQuestions) >= 0.7 ? 'text-emerald-400' : 'text-[#D4A017]'
                }`}>
                  {Math.round((testResult.correctAnswers / testResult.totalQuestions) * 100)}%
                </span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">TIME CONSUMED</span>
                <span className="text-3xl font-serif font-bold text-[#00B4D8]">{testResult.timeTaken} Minutes</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <button
                  onClick={() => setTestResult(null)}
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-750 px-4 py-2 rounded-lg text-xs font-semibold text-slate-200 cursor-pointer"
                >
                  Take Another Test
                </button>
              </div>
            </div>
          </Card>

          {/* Question Review & Explanations */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-200">Question-by-Question Review Analysis</h3>
            
            {(() => {
              let questionsLog: { q: string; options: string[]; correct: number; chosen: number; explanation: string }[] = [];
              try {
                questionsLog = JSON.parse(testResult.questions || '[]');
              } catch {}

              return questionsLog.map((item, idx) => {
                const isCorrect = item.chosen === item.correct;
                const chosenText = item.chosen !== -1 ? item.options[item.chosen] : 'Unanswered';
                const correctText = item.options[item.correct];

                return (
                  <div key={idx} className={`p-5 border rounded-2xl bg-[#0F172A]/50 flex flex-col gap-3 ${
                    isCorrect ? 'border-emerald-500/20' : 'border-rose-500/20'
                  }`}>
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="text-xs font-bold text-slate-100 font-serif leading-relaxed flex-1">
                        Q{idx + 1}. {item.q}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase flex-shrink-0 ${
                        isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#0B1220] p-2.5 rounded border border-slate-850">
                        <span className="text-slate-500 font-mono text-[9px] block">YOUR ANSWER</span>
                        <span className={`font-semibold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>{chosenText}</span>
                      </div>
                      <div className="bg-[#0B1220] p-2.5 rounded border border-slate-850">
                        <span className="text-slate-500 font-mono text-[9px] block">CORRECT ANSWER</span>
                        <span className="font-semibold text-emerald-400">{correctText}</span>
                      </div>
                    </div>

                    {item.explanation && (
                      <div className="text-xs bg-slate-900/40 p-3 rounded-lg border border-slate-850 text-slate-400 font-mono leading-relaxed">
                        <strong>Conceptual Explanation:</strong> {item.explanation}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

    </div>
  );
}
