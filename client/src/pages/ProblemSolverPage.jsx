import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { problemsAPI, submissionsAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/UI/AnimatedPage';
import { Play, CheckCircle2, XCircle, Clock, Cpu, Rocket, Terminal, Eye, EyeOff, Trophy, AlertTriangle, ChevronRight, Code2, FileText, History, FlaskConical, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProblemSolverPage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [resultTab, setResultTab] = useState('visible');
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [bottomTab, setBottomTab] = useState('testcases'); // 'testcases' | 'results'
  const [loading, setLoading] = useState(true);

  const localStorageKey = `devmatch_code_${slug}`;

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await problemsAPI.getBySlug(slug);
        setProblem(res.data.problem);
        setSubmissions(res.data.submissions || []);
        setBestScore(res.data.bestScore || 0);

        // Priority: localStorage draft > last submitted code > starter template
        const savedDraft = localStorage.getItem(localStorageKey);
        const lastCode = res.data.lastCode;
        const starter = res.data.problem.starter_code?.python || '# Write your Python solution here\n';

        setCode(savedDraft || lastCode || starter);
      } catch (err) {
        toast.error('Problem not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);

  // Auto-save code to localStorage on every change
  const handleCodeChange = (value) => {
    setCode(value);
    if (value) {
      localStorage.setItem(localStorageKey, value);
    }
  };

  // RUN — test visible cases only
  const handleRun = async () => {
    if (!code.trim()) { toast.error('Write some code first'); return; }
    setRunning(true);
    setRunResult(null);
    setSubmitResult(null);
    setBottomTab('results');
    try {
      const res = await submissionsAPI.run({ problem_id: problem.id, code });
      setRunResult(res.data);
      setResultTab('visible');
      setSelectedTestCase(0);
      if (res.data.passedCount === res.data.totalCount && res.data.totalCount > 0) {
        toast.success(`All ${res.data.totalCount} visible tests passed!`);
      } else {
        toast.error(`${res.data.passedCount}/${res.data.totalCount} visible tests passed`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Run failed');
    } finally {
      setRunning(false);
    }
  };

  // SUBMIT — test all cases (visible + hidden), get score
  const handleSubmit = async () => {
    if (!code.trim()) { toast.error('Write some code first'); return; }
    setSubmitting(true);
    setRunResult(null);
    setSubmitResult(null);
    setBottomTab('results');
    try {
      const res = await submissionsAPI.submit({ problem_id: problem.id, code });
      setSubmitResult(res.data);
      setResultTab('visible');
      setSelectedTestCase(0);

      if (res.data.submission) {
        setSubmissions(prev => [res.data.submission, ...prev]);
        if (res.data.submission.score > bestScore) {
          setBestScore(res.data.submission.score);
        }
      }

      if (res.data.allPassed) {
        toast.success(`Accepted! Score: ${res.data.submission?.score}/${res.data.submission?.maxScore}`);
      } else if (res.data.submission?.status === 'Partial') {
        toast('Partial score: ' + res.data.submission?.score + '/' + res.data.submission?.maxScore, { icon: '🟡' });
      } else {
        toast.error(`${res.data.submission?.status}: ${res.data.submission?.passedCount}/${res.data.submission?.totalCount} passed`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-accent-200 border-t-accent-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!problem) return <div className="text-center py-12 text-ink-400">Problem not found</div>;

  const visibleTests = problem.visible_test_cases || [];
  const visibleCount = visibleTests.length;
  const totalTestCount = problem.totalTestCount || visibleCount;
  const hiddenCount = problem.hiddenTestCount || 0;

  const activeResult = submitResult || runResult;
  const isSubmitResult = !!submitResult;

  return (
    <AnimatedPage>
      <div className="flex flex-col lg:flex-row gap-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ minHeight: 'calc(100vh - 140px)' }}>

        {/* ═══ LEFT PANEL: Description / Test Cases / Submissions ═══ */}
        <div className="lg:w-[45%] flex flex-col">
          <div className="glass-card flex-1 overflow-y-auto !p-0">
            {/* Tabs */}
            <div className="flex border-b border-ink-100 sticky top-0 bg-white/80 backdrop-blur-xl z-10">
              {[
                { key: 'description', label: 'Description', icon: FileText },
                { key: 'testcases', label: 'Test Cases', icon: FlaskConical },
                { key: 'submissions', label: 'Submissions', icon: History },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative px-4 py-3 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === key ? 'text-accent-600' : 'text-ink-400 hover:text-ink-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {activeTab === key && (
                    <motion.div
                      layoutId="solver-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                {/* ── Description Tab ── */}
                {activeTab === 'description' && (
                  <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-xl font-bold text-ink-900">{problem.title}</h1>
                      <span className={`badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                      {bestScore > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-accent-50 text-accent-600 border border-accent-200">
                          <Trophy className="w-3 h-3" /> Best: {bestScore}/{problem.max_score || 100}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags?.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs bg-accent-50 text-accent-600 capitalize font-medium border border-accent-200">
                          {tag.replace('-', ' ')}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-ink-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-accent-600" />
                        {visibleCount} visible
                      </span>
                      <span className="flex items-center gap-1">
                        <EyeOff className="w-3.5 h-3.5 text-purple-600" />
                        {hiddenCount} hidden
                      </span>
                      <span className="text-ink-300">|</span>
                      <span>{totalTestCount} total</span>
                    </div>

                    <div className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">{problem.description}</div>

                    {problem.examples?.length > 0 && (
                      <div className="space-y-3">
                        {problem.examples.map((ex, i) => (
                          <div key={i} className="bg-surface-100 rounded-xl p-4 border border-ink-100">
                            <p className="font-semibold text-sm text-ink-900 mb-2">Example {i + 1}:</p>
                            <div className="space-y-1 text-sm font-mono">
                              <p><span className="text-ink-400">Input:</span> <span className="text-accent-600">{ex.input}</span></p>
                              <p><span className="text-ink-400">Output:</span> <span className="text-emerald-600">{ex.output}</span></p>
                              {ex.explanation && (
                                <p className="text-ink-500 font-sans text-xs mt-2">{ex.explanation}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {problem.constraints && (
                      <div>
                        <h3 className="font-semibold text-sm text-ink-900 mb-2">Constraints:</h3>
                        <div className="text-sm text-ink-500 font-mono whitespace-pre-wrap bg-surface-100 rounded-xl p-4 border border-ink-100">
                          {problem.constraints}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Test Cases Tab (shows visible test cases BEFORE running) ── */}
                {activeTab === 'testcases' && (
                  <motion.div key="tc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-sm font-semibold text-ink-900 flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-accent-600" />
                        Visible Test Cases
                      </h2>
                      <span className="text-xs text-ink-400">{visibleCount} visible + {hiddenCount} hidden</span>
                    </div>

                    {visibleTests.length > 0 ? visibleTests.map((tc, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-surface-100 rounded-xl border border-ink-100 overflow-hidden"
                      >
                        <div className="px-4 py-2.5 border-b border-ink-100/50 flex items-center gap-2">
                          <span className="text-xs font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-md">
                            Case {i + 1}
                          </span>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-1 block">Input</label>
                            <pre className="text-sm font-mono text-accent-700 bg-white rounded-lg p-3 border border-ink-100 whitespace-pre-wrap break-all">{tc.input || '(empty)'}</pre>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-1 block">Expected Output</label>
                            <pre className="text-sm font-mono text-emerald-700 bg-white rounded-lg p-3 border border-ink-100 whitespace-pre-wrap break-all">{tc.expected_output || '(empty)'}</pre>
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <p className="text-ink-400 text-sm text-center py-6">No visible test cases available</p>
                    )}

                    {hiddenCount > 0 && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 border border-purple-100 text-xs text-ink-500">
                        <EyeOff className="w-4 h-4 text-purple-500 shrink-0" />
                        <span>{hiddenCount} hidden test cases will be evaluated on <strong className="text-purple-600">Submit</strong></span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Submissions Tab ── */}
                {activeTab === 'submissions' && (
                  <motion.div key="subs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {submissions.length > 0 ? submissions.map((sub, i) => (
                      <motion.div
                        key={sub.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 bg-surface-100 rounded-xl border border-ink-100"
                      >
                        <div className="flex items-center gap-2">
                          {sub.status === 'Accepted' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : sub.status === 'Partial' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            sub.status === 'Accepted' ? 'text-emerald-600' :
                            sub.status === 'Partial' ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {sub.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-ink-400">
                          <span className="text-accent-600 font-semibold">
                            {sub.score !== undefined ? `${sub.score}pts` : ''}
                          </span>
                          <span>{sub.passed_count}/{sub.total_count}</span>
                          {sub.runtime != null && <span><Clock className="w-3 h-3 inline" /> {sub.runtime}ms</span>}
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-8">
                        <Terminal className="w-10 h-10 text-ink-300 mx-auto mb-2" />
                        <p className="text-ink-400 text-sm">No submissions yet</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL: Editor + Bottom Panel ═══ */}
        <div className="lg:w-[55%] flex flex-col gap-3">

          {/* ── Code Editor ── */}
          <div className="glass-card !p-0 overflow-hidden flex flex-col" style={{ flex: activeResult ? '1 1 55%' : '1 1 100%' }}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-ink-100 bg-surface-50">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-accent-600" />
                <span className="text-sm font-medium text-accent-600 bg-accent-50 px-3 py-1 rounded-lg border border-accent-200">
                  Python
                </span>
                <button
                  onClick={() => {
                    const starter = problem.starter_code?.python || '# Write your Python solution here\n';
                    setCode(starter);
                    localStorage.removeItem(localStorageKey);
                    toast.success('Code reset to starter template');
                  }}
                  title="Reset to starter code"
                  className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-surface-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleRun}
                  disabled={running || submitting}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    running
                      ? 'bg-surface-200 text-ink-400'
                      : 'bg-surface-100 text-ink-700 border border-ink-200 hover:bg-surface-200 hover:text-ink-900'
                  }`}
                >
                  {running ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-ink-300 border-t-ink-600 rounded-full" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {running ? 'Running...' : 'Run'}
                </motion.button>

                <motion.button
                  onClick={handleSubmit}
                  disabled={running || submitting}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    submitting
                      ? 'bg-accent-50 text-accent-600'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/15 hover:shadow-emerald-500/25'
                  }`}
                >
                  {submitting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-accent-300 border-t-accent-600 rounded-full" />
                      Judging...
                    </>
                  ) : (
                    <><Rocket className="w-4 h-4" /> Submit</>
                  )}
                </motion.button>
              </div>
            </div>

            <div className="flex-1 min-h-[300px]">
              <Editor
                height="100%"
                language="python"
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  padding: { top: 16 },
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  renderLineHighlight: 'gutter',
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                }}
              />
            </div>
          </div>

          {/* ═══ BOTTOM PANEL: Test Cases Preview / Execution Results ═══ */}
          <div className="glass-card !p-0 overflow-hidden flex flex-col" style={{ flex: '0 0 auto', maxHeight: '45%', minHeight: '180px' }}>
            {/* Bottom panel tabs */}
            <div className="flex items-center border-b border-ink-100 bg-surface-50 px-2">
              <button
                onClick={() => setBottomTab('testcases')}
                className={`px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-1.5 relative ${
                  bottomTab === 'testcases' ? 'text-accent-600' : 'text-ink-400 hover:text-ink-700'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" /> Test Cases
                {bottomTab === 'testcases' && (
                  <motion.div layoutId="bottom-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500" />
                )}
              </button>
              <button
                onClick={() => setBottomTab('results')}
                className={`px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-1.5 relative ${
                  bottomTab === 'results' ? 'text-accent-600' : 'text-ink-400 hover:text-ink-700'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Results
                {activeResult && (
                  <span className={`ml-1.5 w-2 h-2 rounded-full ${
                    activeResult.status === 'Accepted' || (activeResult.results?.every(r => r.passed))
                      ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                )}
                {bottomTab === 'results' && (
                  <motion.div layoutId="bottom-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500" />
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* ── Test Cases Preview (before running) ── */}
                {bottomTab === 'testcases' && (
                  <motion.div key="btc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full">
                    {/* Case selector pills */}
                    <div className="flex flex-col gap-1 p-2 border-r border-ink-100 bg-surface-50 min-w-[90px]">
                      {visibleTests.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedTestCase(i)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                            selectedTestCase === i
                              ? 'bg-accent-50 text-accent-600 border border-accent-200'
                              : 'text-ink-400 hover:text-ink-700 hover:bg-surface-100'
                          }`}
                        >
                          Case {i + 1}
                        </button>
                      ))}
                    </div>

                    {/* Selected case details */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                      {visibleTests[selectedTestCase] ? (
                        <>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-1.5 block">Input</label>
                            <pre className="text-sm font-mono text-accent-700 bg-surface-100 rounded-lg p-3 border border-ink-100 whitespace-pre-wrap break-all max-h-28 overflow-y-auto">
                              {visibleTests[selectedTestCase].input || '(empty)'}
                            </pre>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-1.5 block">Expected Output</label>
                            <pre className="text-sm font-mono text-emerald-700 bg-surface-100 rounded-lg p-3 border border-ink-100 whitespace-pre-wrap break-all max-h-28 overflow-y-auto">
                              {visibleTests[selectedTestCase].expected_output || '(empty)'}
                            </pre>
                          </div>
                        </>
                      ) : (
                        <p className="text-ink-400 text-sm py-4">No test case selected</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── Results Panel (after Run / Submit) ── */}
                {bottomTab === 'results' && (
                  <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {activeResult ? (
                      <>
                        {/* Status Header */}
                        <ResultHeader result={activeResult} isSubmit={isSubmitResult} />

                        {/* Submit tab switcher: Visible / Hidden */}
                        {isSubmitResult && (
                          <div className="flex border-b border-ink-100 px-4">
                            <button
                              onClick={() => setResultTab('visible')}
                              className={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 relative ${
                                resultTab === 'visible' ? 'text-accent-600' : 'text-ink-400 hover:text-ink-700'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" /> Visible ({submitResult.visibleResults?.length || 0})
                              {resultTab === 'visible' && <motion.div layoutId="result-sub-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500" />}
                            </button>
                            <button
                              onClick={() => setResultTab('hidden')}
                              className={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 relative ${
                                resultTab === 'hidden' ? 'text-purple-600' : 'text-ink-400 hover:text-ink-700'
                              }`}
                            >
                              <EyeOff className="w-3.5 h-3.5" /> Hidden ({submitResult.hiddenResults?.length || 0})
                              {resultTab === 'hidden' && <motion.div layoutId="result-sub-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
                            </button>
                          </div>
                        )}

                        {/* Test Case Results */}
                        <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
                          {isSubmitResult ? (
                            resultTab === 'visible' ? (
                              <VisibleResultsList cases={submitResult.visibleResults || []} />
                            ) : (
                              <HiddenTestCaseList cases={submitResult.hiddenResults || []} />
                            )
                          ) : (
                            <VisibleResultsList cases={runResult?.results || []} />
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-ink-300">
                        <Terminal className="w-8 h-8 mb-2" />
                        <p className="text-sm text-ink-500">Run or Submit your code to see results</p>
                        <p className="text-xs text-ink-400 mt-1">Output, errors, and test case verdicts will appear here</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

// ══════════════════════════════════════════════════════
// Sub-components
// ══════════════════════════════════════════════════════

function ResultHeader({ result, isSubmit }) {
  const submission = result.submission || {};
  const status = isSubmit ? (submission.status || result.status) : result.status;
  const passedCount = isSubmit ? submission.passedCount : result.passedCount;
  const totalCount = isSubmit ? submission.totalCount : result.totalCount;
  const score = submission.score;
  const maxScore = submission.maxScore;
  const runtime = isSubmit ? submission.runtime : result.runtime;
  const memory = isSubmit ? submission.memory : result.memory;

  const isPartial = status === 'Partial';
  const isAccepted = status === 'Accepted';

  return (
    <div className={`px-4 py-3 flex items-center gap-3 flex-wrap border-b ${
      isAccepted ? 'bg-emerald-50 border-emerald-200' :
      isPartial ? 'bg-amber-50 border-amber-200' :
      'bg-rose-50 border-rose-200'
    }`}>
      <div className="flex items-center gap-2">
        {isAccepted ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </motion.div>
        ) : isPartial ? (
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        ) : (
          <XCircle className="w-5 h-5 text-rose-500" />
        )}
        <span className={`font-semibold text-sm ${
          isAccepted ? 'text-emerald-600' : isPartial ? 'text-amber-600' : 'text-rose-600'
        }`}>
          {status}
        </span>
      </div>

      {isSubmit && score !== undefined && (
        <span className={`text-sm font-bold px-3 py-0.5 rounded-full border ${
          isAccepted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          isPartial ? 'bg-amber-50 text-amber-700 border-amber-200' :
          'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {score}/{maxScore} pts
        </span>
      )}

      <span className="text-xs text-ink-500">
        {passedCount}/{totalCount} passed
      </span>

      {runtime != null && (
        <span className="text-xs text-ink-400 ml-auto flex items-center gap-3">
          <span><Clock className="w-3 h-3 inline mr-1" />{runtime}ms</span>
          {memory != null && <span><Cpu className="w-3 h-3 inline mr-1" />{memory}KB</span>}
        </span>
      )}
    </div>
  );
}

/**
 * Shows full details for each visible test case result:
 * - Input, Expected Output, Stdout (actual output), Error (if any), Pass/Fail status
 */
function VisibleResultsList({ cases }) {
  const [expanded, setExpanded] = useState(0);

  if (!cases || cases.length === 0) return <p className="text-ink-400 text-sm p-4">No test cases</p>;

  return (
    <div className="flex h-full">
      {/* Case selector sidebar */}
      <div className="flex flex-col gap-1 p-2 border-r border-ink-100 bg-surface-50 min-w-[100px]">
        {cases.map((tc, i) => (
          <button
            key={i}
            onClick={() => setExpanded(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
              expanded === i
                ? tc.passed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'text-ink-400 hover:text-ink-700 hover:bg-surface-100'
            }`}
          >
            {tc.passed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            )}
            Case {i + 1}
          </button>
        ))}
      </div>

      {/* Expanded case detail */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {cases[expanded] && (
          <AnimatePresence mode="wait">
            <motion.div
              key={expanded}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {/* Status + Runtime badge */}
              <div className="flex items-center gap-2">
                {cases[expanded].passed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                    <XCircle className="w-3.5 h-3.5" /> {cases[expanded].status || 'Failed'}
                  </span>
                )}
                {cases[expanded].runtime != null && (
                  <span className="text-[10px] text-ink-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {cases[expanded].runtime}ms
                  </span>
                )}
              </div>

              {/* Input */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-1.5 block">Input</label>
                <pre className="text-sm font-mono text-accent-700 bg-surface-100 rounded-lg p-3 border border-ink-100 whitespace-pre-wrap break-all max-h-24 overflow-y-auto">
                  {cases[expanded].input || '(empty)'}
                </pre>
              </div>

              {/* Expected Output */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-1.5 block">Expected Output</label>
                <pre className="text-sm font-mono text-emerald-700 bg-surface-100 rounded-lg p-3 border border-ink-100 whitespace-pre-wrap break-all max-h-24 overflow-y-auto">
                  {cases[expanded].expected || '(empty)'}
                </pre>
              </div>

              {/* Stdout (Actual Output) */}
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold mb-1.5 block flex items-center gap-1.5">
                  <Terminal className="w-3 h-3" />
                  <span className={cases[expanded].passed ? 'text-ink-400' : 'text-rose-600'}>Stdout</span>
                </label>
                <pre className={`text-sm font-mono rounded-lg p-3 border whitespace-pre-wrap break-all max-h-24 overflow-y-auto ${
                  cases[expanded].passed
                    ? 'text-emerald-700 bg-surface-100 border-ink-100'
                    : cases[expanded].status === 'Runtime Error' || cases[expanded].status === 'Compilation Error'
                      ? 'text-rose-600 bg-rose-50 border-rose-200'
                      : 'text-rose-600 bg-surface-100 border-rose-200'
                }`}>
                  {cases[expanded].actual || '(no output)'}
                </pre>
              </div>

              {/* Show error highlight if Runtime Error or Compilation Error */}
              {(cases[expanded].status === 'Runtime Error' || cases[expanded].status === 'Compilation Error') && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-600">
                    <span className="font-semibold">{cases[expanded].status}:</span>{' '}
                    <span className="text-rose-500">Your code threw an error. Check the Stdout above for the traceback.</span>
                  </div>
                </div>
              )}

              {cases[expanded].status === 'Time Limit Exceeded' && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-600">
                    <span className="font-semibold">Time Limit Exceeded:</span>{' '}
                    <span className="text-amber-500">Your solution took too long. Try optimizing your algorithm.</span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function HiddenTestCaseList({ cases }) {
  if (!cases || cases.length === 0) return <p className="text-ink-400 text-sm p-4">No hidden test cases</p>;
  return (
    <div className="p-3 space-y-1.5">
      {cases.map((tc, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${
            tc.passed
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-rose-50 border border-rose-200'
          }`}
        >
          {tc.passed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span className="font-medium text-ink-700">Hidden Test {i + 1}</span>
          <EyeOff className="w-3 h-3 text-ink-300 ml-auto" />
          {tc.runtime != null && <span className="text-xs text-ink-400">{tc.runtime}ms</span>}
        </motion.div>
      ))}
    </div>
  );
}
