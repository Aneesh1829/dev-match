import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemsAPI } from '../services/api';
import { motion } from 'framer-motion';
import AnimatedPage, { StaggerContainer, StaggerItem } from '../components/UI/AnimatedPage';
import { Search, CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const res = await problemsAPI.getAll({ search, difficulty, page, limit: 20 });
        setProblems(res.data.problems);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [search, difficulty, page]);

  const difficultyColors = {
    Easy: 'text-emerald-600',
    Medium: 'text-amber-600',
    Hard: 'text-rose-600',
  };

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Problems</h1>
      </div>

      {/* Filters */}
      <div className="glass-card !p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search problems..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-2">
            {['', 'Easy', 'Medium', 'Hard'].map(d => (
              <motion.button
                key={d}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setDifficulty(d); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  difficulty === d
                    ? 'bg-accent-50 text-accent-600 border border-accent-100 shadow-lg shadow-accent-500/10'
                    : 'bg-white text-ink-500 border border-ink-100 hover:bg-surface-200 hover:text-ink-800'
                }`}
              >
                {d || 'All'}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Problem List */}
      <div className="glass-card !p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wider w-12">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wider">Title</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wider hidden sm:table-cell">Tags</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wider">Difficulty</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wider hidden md:table-cell">Acceptance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100/50">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="w-5 h-5 bg-surface-200 rounded-full animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-surface-200 rounded w-48 animate-pulse" /></td>
                  <td className="px-6 py-4 hidden sm:table-cell"><div className="h-4 bg-surface-200 rounded w-24 animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-surface-200 rounded w-16 animate-pulse" /></td>
                  <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 bg-surface-200 rounded w-12 ml-auto animate-pulse" /></td>
                </tr>
              ))
            ) : problems.length > 0 ? (
              problems.map((problem, idx) => (
                <motion.tr
                  key={problem.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-surface-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    {problem.solved ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-ink-300" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/problems/${problem.slug}`}
                      className="text-sm font-medium text-ink-700 hover:text-accent-600 transition-colors group-hover:text-accent-600"
                    >
                      {problem.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {problem.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-white text-ink-500 capitalize border border-ink-100">
                          {tag.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${difficultyColors[problem.difficulty]}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right hidden md:table-cell">
                    <span className="text-sm text-ink-400">
                      {problem.acceptance_rate?.toFixed(1) || '0.0'}%
                    </span>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-ink-400">
                  No problems found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </motion.button>
          <span className="text-sm text-ink-500 px-4 py-2 bg-white rounded-lg border border-ink-100">
            Page {page} of {totalPages}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </AnimatedPage>
  );
}
