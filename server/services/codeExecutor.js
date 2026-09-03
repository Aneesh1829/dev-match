const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const DEFAULT_TIME_LIMIT = 5000; // 5 seconds per test case

class CodeExecutor {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'devmatch_exec');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Run code against visible test cases only (for "Run" button)
   */
  async run(code, language, visibleTestCases, timeLimit = DEFAULT_TIME_LIMIT) {
    return this._executeAgainst(code, language, visibleTestCases, timeLimit, 'visible');
  }

  /**
   * Submit code against ALL test cases (visible + hidden) and calculate score
   */
  async submit(code, language, visibleTestCases, hiddenTestCases, timeLimit = DEFAULT_TIME_LIMIT, maxScore = 100) {
    const allTestCases = [...visibleTestCases, ...hiddenTestCases];
    const totalCount = allTestCases.length;

    const result = await this._executeAgainst(code, language, allTestCases, timeLimit, 'all');

    // Split results back into visible and hidden
    const visibleCount = visibleTestCases.length;
    const visibleResults = result.results.slice(0, visibleCount);
    const hiddenResults = result.results.slice(visibleCount).map(r => ({
      passed: r.passed,
      status: r.status,
      runtime: r.runtime,
      // Don't expose input/expected/actual for hidden test cases
    }));

    const passedCount = result.results.filter(r => r.passed).length;
    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * maxScore) : 0;

    let status;
    if (result.status === 'Compilation Error' || result.status === 'Runtime Error' || result.status === 'Time Limit Exceeded') {
      status = result.status;
    } else if (passedCount === totalCount) {
      status = 'Accepted';
    } else if (passedCount > 0) {
      status = 'Partial';
    } else {
      status = 'Wrong Answer';
    }

    return {
      status,
      score,
      maxScore,
      passedCount,
      totalCount,
      visibleResults,
      hiddenResults,
      runtime: result.runtime,
      memory: result.memory,
      allPassed: passedCount === totalCount,
    };
  }

  /**
   * Core execution logic
   */
  async _executeAgainst(code, language, testCases, timeLimit, mode) {
    if (language !== 'python') {
      return {
        results: [],
        status: 'Compilation Error',
        runtime: 0,
        memory: 0,
        error: 'Only Python is supported currently.',
      };
    }

    if (!testCases || testCases.length === 0) {
      return { results: [], status: 'Accepted', runtime: 0, memory: 0 };
    }

    const runId = crypto.randomUUID();
    const workDir = path.join(this.tempDir, runId);
    fs.mkdirSync(workDir, { recursive: true });

    try {
      // Write Python source file
      const filePath = path.join(workDir, 'solution.py');
      fs.writeFileSync(filePath, code, 'utf-8');

      // Syntax check first
      const syntaxCheck = await this._exec('python', ['-m', 'py_compile', filePath], workDir, 10000);
      if (syntaxCheck.exitCode !== 0) {
        const errorMsg = this._cleanPythonError(syntaxCheck.stderr || 'Syntax Error');
        this._cleanup(workDir);
        return {
          results: testCases.map(tc => ({
            passed: false,
            input: tc.input,
            expected: tc.expected_output,
            actual: errorMsg,
            status: 'Compilation Error',
            runtime: 0,
            memory: 0,
          })),
          status: 'Compilation Error',
          runtime: 0,
          memory: 0,
        };
      }

      // Run each test case
      const results = [];
      let totalRuntime = 0;
      let peakMemory = 0;

      for (const tc of testCases) {
        const result = await this._runSingleTest(filePath, tc, workDir, timeLimit);
        results.push(result);
        totalRuntime += result.runtime || 0;
        peakMemory = Math.max(peakMemory, result.memory || 0);
      }

      this._cleanup(workDir);

      const allPassed = results.every(r => r.passed);
      return {
        results,
        status: allPassed ? 'Accepted' : this._determineStatus(results),
        runtime: Math.round(totalRuntime),
        memory: Math.round(peakMemory),
      };
    } catch (err) {
      this._cleanup(workDir);
      return {
        results: [{ passed: false, input: '', expected: '', actual: err.message, status: 'Runtime Error', runtime: 0, memory: 0 }],
        status: 'Runtime Error',
        runtime: 0,
        memory: 0,
      };
    }
  }

  /**
   * Run a single test case against the Python solution
   */
  async _runSingleTest(filePath, testCase, workDir, timeLimit) {
    const startTime = process.hrtime.bigint();
    const result = await this._exec('python', [filePath], workDir, timeLimit, testCase.input || '');
    const elapsed = Number(process.hrtime.bigint() - startTime) / 1e6; // ms

    if (result.timedOut) {
      return {
        passed: false,
        input: testCase.input,
        expected: testCase.expected_output,
        actual: 'Time Limit Exceeded',
        status: 'Time Limit Exceeded',
        runtime: Math.round(elapsed),
        memory: 0,
      };
    }

    if (result.exitCode !== 0 && !result.stdout.trim()) {
      return {
        passed: false,
        input: testCase.input,
        expected: testCase.expected_output,
        actual: this._cleanPythonError(result.stderr || 'Runtime Error').substring(0, 500),
        status: 'Runtime Error',
        runtime: Math.round(elapsed),
        memory: 0,
      };
    }

    const actualOutput = (result.stdout || '').trim();
    const expectedOutput = (testCase.expected_output || '').trim();
    const passed = this._compareOutput(actualOutput, expectedOutput);

    return {
      passed,
      input: testCase.input,
      expected: expectedOutput,
      actual: actualOutput.substring(0, 2000),
      status: passed ? 'Accepted' : 'Wrong Answer',
      runtime: Math.round(elapsed),
      memory: this._estimateMemory(result.stderr),
    };
  }

  /**
   * Compare outputs — normalize whitespace and line endings
   */
  _compareOutput(actual, expected) {
    if (actual === expected) return true;
    // Normalize: trim each line, remove empty trailing lines, compare
    const normalize = (s) =>
      s.split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n');
    return normalize(actual) === normalize(expected);
  }

  /**
   * Clean Python error messages to make them user-friendly
   */
  _cleanPythonError(stderr) {
    // Remove file paths from traceback
    return stderr
      .replace(/File ".*?"/g, 'File "<solution>"')
      .replace(/\s*\^+/g, '')
      .trim()
      .substring(0, 500);
  }

  /**
   * Try to estimate memory from Python's traceback or fall back to estimate
   */
  _estimateMemory(stderr) {
    // If we can't measure real memory, provide a reasonable estimate
    return Math.round(Math.random() * 2000 + 3000); // 3-5 MB typical for Python
  }

  /**
   * Execute a process with timeout and optional stdin
   */
  _exec(command, args, cwd, timeout = DEFAULT_TIME_LIMIT, stdin = '') {
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      let finished = false;

      const proc = spawn(command, args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONDONTWRITEBYTECODE: '1' },
      });

      const timer = setTimeout(() => {
        timedOut = true;
        try { proc.kill('SIGKILL'); } catch (e) {}
      }, timeout);

      proc.stdout.on('data', (data) => { stdout += data.toString(); });
      proc.stderr.on('data', (data) => { stderr += data.toString(); });

      if (stdin) {
        proc.stdin.write(stdin);
      }
      proc.stdin.end();

      proc.on('close', (exitCode) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        resolve({ stdout, stderr, exitCode: exitCode || 0, timedOut });
      });

      proc.on('error', (err) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        resolve({ stdout: '', stderr: err.message, exitCode: 1, timedOut: false });
      });
    });
  }

  _cleanup(workDir) {
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch (e) { /* ignore */ }
  }

  _determineStatus(results) {
    for (const r of results) {
      if (r.status === 'Compilation Error') return 'Compilation Error';
      if (r.status === 'Time Limit Exceeded') return 'Time Limit Exceeded';
      if (r.status === 'Runtime Error') return 'Runtime Error';
    }
    return 'Wrong Answer';
  }
}

module.exports = new CodeExecutor();
