const { Problem } = require('../models');

const seedProblems = async () => {
  const count = await Problem.count();
  if (count > 0) {
    console.log(`${count} problems already exist, skipping seed.`);
    return;
  }

  const problems = generateProblems();
  await Problem.bulkCreate(problems);
  console.log(`Seeded ${problems.length} problems`);
};

function generateProblems() {
  return [
    // ═══════════════════════════════════════
    // EASY PROBLEMS (1-20)
    // ═══════════════════════════════════════
    {
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: 'Easy',
      tags: ['arrays', 'hash-table'],
      max_score: 100,
      time_limit: 5000,
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.\nReturn the two indices in ascending order, space-separated.\n\nInput format:\n- Line 1: n (array size)\n- Line 2: n space-separated integers\n- Line 3: target integer`,
      constraints: '2 <= n <= 10^4\n-10^9 <= nums[i] <= 10^9',
      examples: [
        { input: '4\n2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
        { input: '3\n3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
      ],
      visible_test_cases: [
        { input: '4\n2 7 11 15\n9', expected_output: '0 1' },
        { input: '3\n3 2 4\n6', expected_output: '1 2' },
        { input: '2\n3 3\n6', expected_output: '0 1' },
      ],
      hidden_test_cases: [
        { input: '4\n1 5 3 7\n8', expected_output: '1 2' },
        { input: '5\n1 2 3 4 5\n9', expected_output: '3 4' },
        { input: '6\n-1 -2 -3 -4 -5 -6\n-9', expected_output: '2 5' },
        { input: '3\n0 4 3\n4', expected_output: '0 1' },
        { input: '4\n100 200 300 400\n700', expected_output: '2 3' },
        { input: '5\n1 1 1 1 2\n3', expected_output: '0 4' },
        { input: '4\n-3 4 3 90\n0', expected_output: '0 2' },
        { input: '3\n2 5 -1\n1', expected_output: '0 2' },
        { input: '6\n10 20 30 40 50 60\n110', expected_output: '4 5' },
        { input: '4\n5 25 75 100\n30', expected_output: '0 1' },
      ],
      starter_code: {
        python: `n = int(input())
nums = list(map(int, input().split()))
target = int(input())

# Your solution here
`,
      },
    },
    {
      title: 'Reverse String',
      slug: 'reverse-string',
      difficulty: 'Easy',
      tags: ['strings'],
      max_score: 100,
      time_limit: 3000,
      description: `Given a string, reverse it and print the result.\n\nInput: A single line containing the string.\nOutput: The reversed string.`,
      constraints: '1 <= len(s) <= 10^5',
      examples: [
        { input: 'hello', output: 'olleh', explanation: '' },
        { input: 'world', output: 'dlrow', explanation: '' },
      ],
      visible_test_cases: [
        { input: 'hello', expected_output: 'olleh' },
        { input: 'world', expected_output: 'dlrow' },
        { input: 'a', expected_output: 'a' },
      ],
      hidden_test_cases: [
        { input: 'abcdef', expected_output: 'fedcba' },
        { input: 'racecar', expected_output: 'racecar' },
        { input: '12345', expected_output: '54321' },
        { input: 'ab', expected_output: 'ba' },
        { input: 'Hello World', expected_output: 'dlroW olleH' },
        { input: 'aabbcc', expected_output: 'ccbbaa' },
        { input: 'x', expected_output: 'x' },
        { input: 'OpenAI', expected_output: 'IAnepO' },
        { input: 'level', expected_output: 'level' },
        { input: 'python', expected_output: 'nohtyp' },
      ],
      starter_code: {
        python: `s = input()

# Your solution here
`,
      },
    },
    {
      title: 'Palindrome Check',
      slug: 'palindrome-check',
      difficulty: 'Easy',
      tags: ['strings'],
      max_score: 100,
      time_limit: 3000,
      description: `Given a string, determine if it is a palindrome (reads the same forwards and backwards). Consider only alphanumeric characters and ignore case.\n\nInput: A single line string.\nOutput: "true" or "false".`,
      constraints: '1 <= len(s) <= 10^5',
      examples: [
        { input: 'racecar', output: 'true', explanation: '' },
        { input: 'hello', output: 'false', explanation: '' },
      ],
      visible_test_cases: [
        { input: 'racecar', expected_output: 'true' },
        { input: 'hello', expected_output: 'false' },
        { input: 'A man a plan a canal Panama', expected_output: 'true' },
      ],
      hidden_test_cases: [
        { input: 'a', expected_output: 'true' },
        { input: 'ab', expected_output: 'false' },
        { input: 'aba', expected_output: 'true' },
        { input: 'Was it a car or a cat I saw', expected_output: 'true' },
        { input: 'No lemon, no melon', expected_output: 'true' },
        { input: 'Not a palindrome', expected_output: 'false' },
        { input: '12321', expected_output: 'true' },
        { input: '12345', expected_output: 'false' },
        { input: '', expected_output: 'true' },
        { input: 'Madam', expected_output: 'true' },
      ],
      starter_code: {
        python: `s = input()

# Your solution here
# Print "true" or "false"
`,
      },
    },
    {
      title: 'FizzBuzz',
      slug: 'fizzbuzz',
      difficulty: 'Easy',
      tags: ['math', 'simulation'],
      max_score: 100,
      time_limit: 3000,
      description: `Given an integer n, print numbers from 1 to n. But for multiples of 3, print "Fizz"; for multiples of 5, print "Buzz"; for multiples of both, print "FizzBuzz".\n\nInput: A single integer n.\nOutput: n lines, each with the number or Fizz/Buzz/FizzBuzz.`,
      constraints: '1 <= n <= 10^4',
      examples: [
        { input: '5', output: '1\n2\nFizz\n4\nBuzz', explanation: '' },
      ],
      visible_test_cases: [
        { input: '5', expected_output: '1\n2\nFizz\n4\nBuzz' },
        { input: '15', expected_output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' },
        { input: '1', expected_output: '1' },
      ],
      hidden_test_cases: [
        { input: '3', expected_output: '1\n2\nFizz' },
        { input: '10', expected_output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz' },
        { input: '20', expected_output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz' },
        { input: '30', expected_output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz' },
        { input: '2', expected_output: '1\n2' },
        { input: '6', expected_output: '1\n2\nFizz\n4\nBuzz\nFizz' },
        { input: '4', expected_output: '1\n2\nFizz\n4' },
        { input: '9', expected_output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz' },
        { input: '7', expected_output: '1\n2\nFizz\n4\nBuzz\nFizz\n7' },
        { input: '16', expected_output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16' },
      ],
      starter_code: {
        python: `n = int(input())

# Your solution here
`,
      },
    },
    {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      difficulty: 'Easy',
      tags: ['strings', 'stack'],
      max_score: 100,
      time_limit: 3000,
      description: `Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nPrint "true" or "false".\n\nInput: A single line string of brackets.`,
      constraints: '0 <= len(s) <= 10^4',
      examples: [
        { input: '()', output: 'true', explanation: '' },
        { input: '(]', output: 'false', explanation: '' },
      ],
      visible_test_cases: [
        { input: '()', expected_output: 'true' },
        { input: '()[]{}', expected_output: 'true' },
        { input: '(]', expected_output: 'false' },
      ],
      hidden_test_cases: [
        { input: '([)]', expected_output: 'false' },
        { input: '{[]}', expected_output: 'true' },
        { input: '', expected_output: 'true' },
        { input: '(', expected_output: 'false' },
        { input: ')', expected_output: 'false' },
        { input: '((()))', expected_output: 'true' },
        { input: '((()', expected_output: 'false' },
        { input: '{}{}{}', expected_output: 'true' },
        { input: '[{()}]', expected_output: 'true' },
        { input: '[(])', expected_output: 'false' },
      ],
      starter_code: {
        python: `s = input().strip()

# Your solution here
# Print "true" or "false"
`,
      },
    },
    {
      title: 'Fibonacci Number',
      slug: 'fibonacci-number',
      difficulty: 'Easy',
      tags: ['dp', 'math', 'recursion'],
      max_score: 100,
      time_limit: 3000,
      description: `Compute the nth Fibonacci number.\nF(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2).\n\nInput: single integer n.\nOutput: F(n).`,
      constraints: '0 <= n <= 45',
      examples: [
        { input: '10', output: '55', explanation: '' },
        { input: '0', output: '0', explanation: '' },
      ],
      visible_test_cases: [
        { input: '0', expected_output: '0' },
        { input: '1', expected_output: '1' },
        { input: '10', expected_output: '55' },
      ],
      hidden_test_cases: [
        { input: '2', expected_output: '1' },
        { input: '5', expected_output: '5' },
        { input: '7', expected_output: '13' },
        { input: '15', expected_output: '610' },
        { input: '20', expected_output: '6765' },
        { input: '25', expected_output: '75025' },
        { input: '30', expected_output: '832040' },
        { input: '35', expected_output: '9227465' },
        { input: '40', expected_output: '102334155' },
        { input: '45', expected_output: '1134903170' },
      ],
      starter_code: {
        python: `n = int(input())

# Your solution here
`,
      },
    },
    {
      title: 'Climbing Stairs',
      slug: 'climbing-stairs',
      difficulty: 'Easy',
      tags: ['dp', 'math'],
      max_score: 100,
      time_limit: 3000,
      description: `You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. How many distinct ways can you reach the top?\n\nInput: integer n.\nOutput: number of distinct ways.`,
      constraints: '1 <= n <= 45',
      examples: [
        { input: '2', output: '2', explanation: '1+1 and 2' },
        { input: '3', output: '3', explanation: '1+1+1, 1+2, 2+1' },
      ],
      visible_test_cases: [
        { input: '2', expected_output: '2' },
        { input: '3', expected_output: '3' },
        { input: '5', expected_output: '8' },
      ],
      hidden_test_cases: [
        { input: '1', expected_output: '1' },
        { input: '4', expected_output: '5' },
        { input: '6', expected_output: '13' },
        { input: '10', expected_output: '89' },
        { input: '15', expected_output: '987' },
        { input: '20', expected_output: '10946' },
        { input: '25', expected_output: '121393' },
        { input: '30', expected_output: '1346269' },
        { input: '35', expected_output: '14930352' },
        { input: '40', expected_output: '165580141' },
      ],
      starter_code: {
        python: `n = int(input())

# Your solution here
`,
      },
    },
    {
      title: 'Binary Search',
      slug: 'binary-search',
      difficulty: 'Easy',
      tags: ['arrays', 'binary-search'],
      max_score: 100,
      time_limit: 3000,
      description: `Given a sorted array and a target, return the index if found, else -1.\n\nInput:\n- Line 1: n\n- Line 2: n sorted integers\n- Line 3: target`,
      constraints: '1 <= n <= 10^4\n-10^4 <= nums[i], target <= 10^4',
      examples: [
        { input: '6\n-1 0 3 5 9 12\n9', output: '4', explanation: '' },
      ],
      visible_test_cases: [
        { input: '6\n-1 0 3 5 9 12\n9', expected_output: '4' },
        { input: '6\n-1 0 3 5 9 12\n2', expected_output: '-1' },
        { input: '1\n5\n5', expected_output: '0' },
      ],
      hidden_test_cases: [
        { input: '5\n1 2 3 4 5\n1', expected_output: '0' },
        { input: '5\n1 2 3 4 5\n5', expected_output: '4' },
        { input: '5\n1 2 3 4 5\n3', expected_output: '2' },
        { input: '5\n1 2 3 4 5\n6', expected_output: '-1' },
        { input: '5\n1 2 3 4 5\n0', expected_output: '-1' },
        { input: '3\n10 20 30\n20', expected_output: '1' },
        { input: '1\n1\n2', expected_output: '-1' },
        { input: '7\n-5 -3 0 2 5 8 10\n-3', expected_output: '1' },
        { input: '7\n-5 -3 0 2 5 8 10\n10', expected_output: '6' },
        { input: '4\n1 3 5 7\n4', expected_output: '-1' },
      ],
      starter_code: {
        python: `n = int(input())
nums = list(map(int, input().split()))
target = int(input())

# Your solution here
`,
      },
    },
    {
      title: 'Count Vowels',
      slug: 'count-vowels',
      difficulty: 'Easy',
      tags: ['strings'],
      max_score: 100,
      time_limit: 3000,
      description: `Count the number of vowels (a, e, i, o, u — case insensitive) in the given string.\n\nInput: A single string.\nOutput: Count of vowels.`,
      constraints: '1 <= len(s) <= 10^5',
      examples: [
        { input: 'hello', output: '2', explanation: 'e, o' },
      ],
      visible_test_cases: [
        { input: 'hello', expected_output: '2' },
        { input: 'AEIOU', expected_output: '5' },
        { input: 'bcdfg', expected_output: '0' },
      ],
      hidden_test_cases: [
        { input: 'a', expected_output: '1' },
        { input: 'b', expected_output: '0' },
        { input: 'aeiou', expected_output: '5' },
        { input: 'Python', expected_output: '1' },
        { input: 'Programming', expected_output: '3' },
        { input: 'aAbBcCeE', expected_output: '4' },
        { input: 'The quick brown fox', expected_output: '5' },
        { input: 'HELLO WORLD', expected_output: '3' },
        { input: 'xyz', expected_output: '0' },
        { input: 'Education', expected_output: '5' },
      ],
      starter_code: {
        python: `s = input()

# Your solution here
`,
      },
    },
    {
      title: 'Maximum Element',
      slug: 'maximum-element',
      difficulty: 'Easy',
      tags: ['arrays'],
      max_score: 100,
      time_limit: 3000,
      description: `Find the maximum element in an array.\n\nInput:\n- Line 1: n\n- Line 2: n integers\nOutput: The maximum value.`,
      constraints: '1 <= n <= 10^5\n-10^9 <= nums[i] <= 10^9',
      examples: [
        { input: '5\n3 1 4 1 5', output: '5', explanation: '' },
      ],
      visible_test_cases: [
        { input: '5\n3 1 4 1 5', expected_output: '5' },
        { input: '1\n42', expected_output: '42' },
        { input: '3\n-1 -2 -3', expected_output: '-1' },
      ],
      hidden_test_cases: [
        { input: '5\n1 2 3 4 5', expected_output: '5' },
        { input: '5\n5 4 3 2 1', expected_output: '5' },
        { input: '4\n0 0 0 0', expected_output: '0' },
        { input: '3\n-100 200 -300', expected_output: '200' },
        { input: '6\n1000000 999999 999998 1000001 999997 999996', expected_output: '1000001' },
        { input: '2\n-1 1', expected_output: '1' },
        { input: '1\n-999999999', expected_output: '-999999999' },
        { input: '4\n7 7 7 7', expected_output: '7' },
        { input: '5\n10 20 30 20 10', expected_output: '30' },
        { input: '3\n-5 0 5', expected_output: '5' },
      ],
      starter_code: {
        python: `n = int(input())
nums = list(map(int, input().split()))

# Your solution here
`,
      },
    },
    {
      title: 'Sum of Digits',
      slug: 'sum-of-digits',
      difficulty: 'Easy',
      tags: ['math'],
      max_score: 100,
      time_limit: 3000,
      description: `Given a non-negative integer, find the sum of its digits.\n\nInput: A single non-negative integer.\nOutput: Sum of digits.`,
      constraints: '0 <= n <= 10^18',
      examples: [
        { input: '123', output: '6', explanation: '1+2+3=6' },
      ],
      visible_test_cases: [
        { input: '123', expected_output: '6' },
        { input: '0', expected_output: '0' },
        { input: '999', expected_output: '27' },
      ],
      hidden_test_cases: [
        { input: '1', expected_output: '1' },
        { input: '10', expected_output: '1' },
        { input: '100', expected_output: '1' },
        { input: '456', expected_output: '15' },
        { input: '9999', expected_output: '36' },
        { input: '1234567890', expected_output: '45' },
        { input: '11111', expected_output: '5' },
        { input: '99', expected_output: '18' },
        { input: '5050', expected_output: '10' },
        { input: '987654321', expected_output: '45' },
      ],
      starter_code: {
        python: `n = input().strip()

# Your solution here
`,
      },
    },
    {
      title: 'Reverse Array',
      slug: 'reverse-array',
      difficulty: 'Easy',
      tags: ['arrays'],
      max_score: 100,
      time_limit: 3000,
      description: `Reverse an array of integers.\n\nInput:\n- Line 1: n\n- Line 2: n integers\nOutput: The reversed array, space-separated.`,
      constraints: '1 <= n <= 10^5',
      examples: [
        { input: '5\n1 2 3 4 5', output: '5 4 3 2 1', explanation: '' },
      ],
      visible_test_cases: [
        { input: '5\n1 2 3 4 5', expected_output: '5 4 3 2 1' },
        { input: '1\n42', expected_output: '42' },
        { input: '3\n10 20 30', expected_output: '30 20 10' },
      ],
      hidden_test_cases: [
        { input: '2\n1 2', expected_output: '2 1' },
        { input: '4\n-1 -2 -3 -4', expected_output: '-4 -3 -2 -1' },
        { input: '6\n1 1 1 1 1 1', expected_output: '1 1 1 1 1 1' },
        { input: '5\n5 4 3 2 1', expected_output: '1 2 3 4 5' },
        { input: '3\n0 0 0', expected_output: '0 0 0' },
        { input: '4\n100 200 300 400', expected_output: '400 300 200 100' },
        { input: '7\n7 6 5 4 3 2 1', expected_output: '1 2 3 4 5 6 7' },
        { input: '3\n-5 0 5', expected_output: '5 0 -5' },
        { input: '2\n999 -999', expected_output: '-999 999' },
        { input: '5\n10 20 30 40 50', expected_output: '50 40 30 20 10' },
      ],
      starter_code: {
        python: `n = int(input())
nums = list(map(int, input().split()))

# Your solution here
`,
      },
    },
    {
      title: 'Count Words',
      slug: 'count-words',
      difficulty: 'Easy',
      tags: ['strings'],
      max_score: 100,
      time_limit: 3000,
      description: `Count the number of words in a string. Words are separated by spaces.\n\nInput: A single line string.\nOutput: Number of words.`,
      constraints: '0 <= len(s) <= 10^5',
      examples: [
        { input: 'hello world', output: '2', explanation: '' },
      ],
      visible_test_cases: [
        { input: 'hello world', expected_output: '2' },
        { input: 'one', expected_output: '1' },
        { input: 'the quick brown fox', expected_output: '4' },
      ],
      hidden_test_cases: [
        { input: 'a b c d e', expected_output: '5' },
        { input: 'hello', expected_output: '1' },
        { input: '  spaces  everywhere  ', expected_output: '2' },
        { input: 'one two three four five six', expected_output: '6' },
        { input: 'word', expected_output: '1' },
        { input: 'a b', expected_output: '2' },
        { input: 'test   multiple   spaces', expected_output: '3' },
        { input: 'Python is fun', expected_output: '3' },
        { input: 'I love coding challenges', expected_output: '4' },
        { input: 'x', expected_output: '1' },
      ],
      starter_code: {
        python: `s = input()

# Your solution here
`,
      },
    },
    {
      title: 'Even or Odd',
      slug: 'even-or-odd',
      difficulty: 'Easy',
      tags: ['math'],
      max_score: 100,
      time_limit: 3000,
      description: `Given n integers, for each one print "Even" if even or "Odd" if odd.\n\nInput:\n- Line 1: n\n- Line 2: n integers\nOutput: n lines, each "Even" or "Odd".`,
      constraints: '1 <= n <= 1000\n-10^9 <= nums[i] <= 10^9',
      examples: [
        { input: '3\n1 2 3', output: 'Odd\nEven\nOdd', explanation: '' },
      ],
      visible_test_cases: [
        { input: '3\n1 2 3', expected_output: 'Odd\nEven\nOdd' },
        { input: '1\n0', expected_output: 'Even' },
        { input: '4\n10 15 20 25', expected_output: 'Even\nOdd\nEven\nOdd' },
      ],
      hidden_test_cases: [
        { input: '2\n-1 -2', expected_output: 'Odd\nEven' },
        { input: '5\n2 4 6 8 10', expected_output: 'Even\nEven\nEven\nEven\nEven' },
        { input: '5\n1 3 5 7 9', expected_output: 'Odd\nOdd\nOdd\nOdd\nOdd' },
        { input: '1\n1000000000', expected_output: 'Even' },
        { input: '1\n999999999', expected_output: 'Odd' },
        { input: '3\n0 0 0', expected_output: 'Even\nEven\nEven' },
        { input: '2\n100 101', expected_output: 'Even\nOdd' },
        { input: '6\n-10 -9 -8 -7 -6 -5', expected_output: 'Even\nOdd\nEven\nOdd\nEven\nOdd' },
        { input: '1\n-4', expected_output: 'Even' },
        { input: '3\n7 14 21', expected_output: 'Odd\nEven\nOdd' },
      ],
      starter_code: {
        python: `n = int(input())
nums = list(map(int, input().split()))

# Your solution here
# Print "Even" or "Odd" for each number
`,
      },
    },
    {
      title: 'Factorial',
      slug: 'factorial',
      difficulty: 'Easy',
      tags: ['math', 'recursion'],
      max_score: 100,
      time_limit: 3000,
      description: `Compute the factorial of n (n!).\n\nInput: A single integer n.\nOutput: n!`,
      constraints: '0 <= n <= 20',
      examples: [
        { input: '5', output: '120', explanation: '5! = 5*4*3*2*1 = 120' },
      ],
      visible_test_cases: [
        { input: '5', expected_output: '120' },
        { input: '0', expected_output: '1' },
        { input: '1', expected_output: '1' },
      ],
      hidden_test_cases: [
        { input: '2', expected_output: '2' },
        { input: '3', expected_output: '6' },
        { input: '4', expected_output: '24' },
        { input: '6', expected_output: '720' },
        { input: '10', expected_output: '3628800' },
        { input: '12', expected_output: '479001600' },
        { input: '15', expected_output: '1307674368000' },
        { input: '18', expected_output: '6402373705728000' },
        { input: '20', expected_output: '2432902008176640000' },
        { input: '7', expected_output: '5040' },
      ],
      starter_code: {
        python: `n = int(input())

# Your solution here
`,
      },
    },
    {
      title: 'Power of Two',
      slug: 'power-of-two',
      difficulty: 'Easy',
      tags: ['math', 'bit-manipulation'],
      max_score: 100,
      time_limit: 3000,
      description: `Check if a given integer is a power of two.\n\nInput: A single integer n.\nOutput: "true" or "false".`,
      constraints: '-2^31 <= n <= 2^31 - 1',
      examples: [
        { input: '16', output: 'true', explanation: '2^4 = 16' },
        { input: '5', output: 'false', explanation: '' },
      ],
      visible_test_cases: [
        { input: '16', expected_output: 'true' },
        { input: '5', expected_output: 'false' },
        { input: '1', expected_output: 'true' },
      ],
      hidden_test_cases: [
        { input: '0', expected_output: 'false' },
        { input: '2', expected_output: 'true' },
        { input: '4', expected_output: 'true' },
        { input: '8', expected_output: 'true' },
        { input: '32', expected_output: 'true' },
        { input: '64', expected_output: 'true' },
        { input: '100', expected_output: 'false' },
        { input: '1024', expected_output: 'true' },
        { input: '-1', expected_output: 'false' },
        { input: '3', expected_output: 'false' },
      ],
      starter_code: {
        python: `n = int(input())

# Your solution here
# Print "true" or "false"
`,
      },
    },
    {
      title: 'Remove Duplicates',
      slug: 'remove-duplicates',
      difficulty: 'Easy',
      tags: ['arrays', 'hash-table'],
      max_score: 100,
      time_limit: 3000,
      description: `Remove duplicates from an array while preserving order. Print the unique elements space-separated.\n\nInput:\n- Line 1: n\n- Line 2: n integers`,
      constraints: '1 <= n <= 10^4',
      examples: [
        { input: '6\n1 2 2 3 3 4', output: '1 2 3 4', explanation: '' },
      ],
      visible_test_cases: [
        { input: '6\n1 2 2 3 3 4', expected_output: '1 2 3 4' },
        { input: '5\n5 5 5 5 5', expected_output: '5' },
        { input: '4\n1 2 3 4', expected_output: '1 2 3 4' },
      ],
      hidden_test_cases: [
        { input: '1\n42', expected_output: '42' },
        { input: '3\n1 1 2', expected_output: '1 2' },
        { input: '7\n3 1 4 1 5 9 2', expected_output: '3 1 4 5 9 2' },
        { input: '5\n10 20 10 30 20', expected_output: '10 20 30' },
        { input: '8\n1 2 3 4 1 2 3 4', expected_output: '1 2 3 4' },
        { input: '6\n-1 -2 -1 -2 -3 -3', expected_output: '-1 -2 -3' },
        { input: '3\n0 0 0', expected_output: '0' },
        { input: '4\n100 200 100 200', expected_output: '100 200' },
        { input: '5\n5 4 3 2 1', expected_output: '5 4 3 2 1' },
        { input: '6\n1 2 1 3 2 4', expected_output: '1 2 3 4' },
      ],
      starter_code: {
        python: `n = int(input())
nums = list(map(int, input().split()))

# Your solution here
`,
      },
    },
    {
      title: 'Merge Two Sorted Arrays',
      slug: 'merge-sorted-arrays',
      difficulty: 'Easy',
      tags: ['arrays', 'two-pointers', 'sorting'],
      max_score: 100,
      time_limit: 3000,
      description: `Merge two sorted arrays into one sorted array.\n\nInput:\n- Line 1: n m\n- Line 2: n sorted integers (or empty if n=0)\n- Line 3: m sorted integers (or empty if m=0)\nOutput: Merged sorted array.`,
      constraints: '0 <= n, m <= 10^4',
      examples: [
        { input: '3 3\n1 3 5\n2 4 6', output: '1 2 3 4 5 6', explanation: '' },
      ],
      visible_test_cases: [
        { input: '3 3\n1 3 5\n2 4 6', expected_output: '1 2 3 4 5 6' },
        { input: '2 3\n1 5\n2 3 4', expected_output: '1 2 3 4 5' },
        { input: '4 0\n1 2 3 4\n', expected_output: '1 2 3 4' },
      ],
      hidden_test_cases: [
        { input: '0 3\n\n1 2 3', expected_output: '1 2 3' },
        { input: '1 1\n1\n2', expected_output: '1 2' },
        { input: '3 3\n1 1 1\n2 2 2', expected_output: '1 1 1 2 2 2' },
        { input: '4 4\n1 3 5 7\n2 4 6 8', expected_output: '1 2 3 4 5 6 7 8' },
        { input: '5 5\n1 2 3 4 5\n6 7 8 9 10', expected_output: '1 2 3 4 5 6 7 8 9 10' },
        { input: '3 2\n-5 -3 -1\n-4 -2', expected_output: '-5 -4 -3 -2 -1' },
        { input: '2 2\n1 1\n1 1', expected_output: '1 1 1 1' },
        { input: '1 5\n3\n1 2 4 5 6', expected_output: '1 2 3 4 5 6' },
        { input: '3 3\n10 20 30\n5 15 25', expected_output: '5 10 15 20 25 30' },
        { input: '0 0\n\n', expected_output: '' },
      ],
      starter_code: {
        python: `n, m = map(int, input().split())
a = list(map(int, input().split())) if n > 0 else []
b = list(map(int, input().split())) if m > 0 else []

# Your solution here
`,
      },
    },
    {
      title: 'Roman to Integer',
      slug: 'roman-to-integer',
      difficulty: 'Easy',
      tags: ['strings', 'math', 'hash-table'],
      max_score: 100,
      time_limit: 3000,
      description: `Convert a Roman numeral string to an integer.\n\nI=1, V=5, X=10, L=50, C=100, D=500, M=1000\n\nInput: A roman numeral string.\nOutput: The integer value.`,
      constraints: '1 <= len(s) <= 15\nValid Roman numeral in range [1, 3999]',
      examples: [
        { input: 'III', output: '3', explanation: '' },
        { input: 'MCMXCIV', output: '1994', explanation: 'M=1000 CM=900 XC=90 IV=4' },
      ],
      visible_test_cases: [
        { input: 'III', expected_output: '3' },
        { input: 'IV', expected_output: '4' },
        { input: 'MCMXCIV', expected_output: '1994' },
      ],
      hidden_test_cases: [
        { input: 'I', expected_output: '1' },
        { input: 'V', expected_output: '5' },
        { input: 'IX', expected_output: '9' },
        { input: 'XL', expected_output: '40' },
        { input: 'XC', expected_output: '90' },
        { input: 'CD', expected_output: '400' },
        { input: 'CM', expected_output: '900' },
        { input: 'LVIII', expected_output: '58' },
        { input: 'MMMCMXCIX', expected_output: '3999' },
        { input: 'DCCC', expected_output: '800' },
      ],
      starter_code: {
        python: `s = input().strip()

# Your solution here
`,
      },
    },

    // ═══════════════════════════════════════
    // MEDIUM PROBLEMS (21-40)
    // ═══════════════════════════════════════
    {
      title: 'Maximum Subarray',
      slug: 'maximum-subarray',
      difficulty: 'Medium',
      tags: ['arrays', 'dp'],
      max_score: 150,
      time_limit: 5000,
      description: `Find the contiguous subarray with the largest sum.\n\nInput:\n- Line 1: n\n- Line 2: n integers\nOutput: The maximum subarray sum.`,
      constraints: '1 <= n <= 10^5\n-10^4 <= nums[i] <= 10^4',
      examples: [
        { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4,-1,2,1] has sum 6' },
      ],
      visible_test_cases: [
        { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expected_output: '6' },
        { input: '1\n1', expected_output: '1' },
        { input: '5\n5 4 -1 7 8', expected_output: '23' },
      ],
      hidden_test_cases: [
        { input: '5\n-1 -2 -3 -4 -5', expected_output: '-1' },
        { input: '3\n-2 1 -1', expected_output: '1' },
        { input: '6\n1 2 3 -6 4 5', expected_output: '9' },
        { input: '4\n-1 2 3 -5', expected_output: '5' },
        { input: '1\n-100', expected_output: '-100' },
        { input: '8\n1 -1 1 -1 1 -1 1 -1', expected_output: '1' },
        { input: '5\n10 -3 10 -3 10', expected_output: '24' },
        { input: '3\n100 -1 100', expected_output: '199' },
        { input: '6\n-2 -1 -3 -4 -1 -2', expected_output: '-1' },
        { input: '7\n3 -1 -1 -1 3 -1 3', expected_output: '5' },
      ],
      starter_code: {
        python: `n = int(input())
nums = list(map(int, input().split()))

# Your solution here
`,
      },
    },
    {
      title: 'Number of Islands',
      slug: 'number-of-islands',
      difficulty: 'Medium',
      tags: ['graphs', 'bfs', 'dfs', 'matrix'],
      max_score: 150,
      time_limit: 5000,
      description: `Given an m x n grid of '1' (land) and '0' (water), count the number of islands.\n\nInput:\n- Line 1: m n\n- Next m lines: n space-separated 0s and 1s\nOutput: Number of islands.`,
      constraints: '1 <= m, n <= 300',
      examples: [
        { input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', output: '3', explanation: '' },
      ],
      visible_test_cases: [
        { input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', expected_output: '1' },
        { input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', expected_output: '3' },
        { input: '1 1\n0', expected_output: '0' },
      ],
      hidden_test_cases: [
        { input: '1 1\n1', expected_output: '1' },
        { input: '3 3\n1 0 1\n0 1 0\n1 0 1', expected_output: '5' },
        { input: '3 3\n1 1 1\n1 1 1\n1 1 1', expected_output: '1' },
        { input: '3 3\n0 0 0\n0 0 0\n0 0 0', expected_output: '0' },
        { input: '2 4\n1 0 1 0\n0 1 0 1', expected_output: '4' },
        { input: '4 4\n1 0 0 1\n0 0 0 0\n0 0 0 0\n1 0 0 1', expected_output: '4' },
        { input: '3 5\n1 1 0 1 1\n1 0 0 0 1\n1 1 0 1 1', expected_output: '2' },
        { input: '2 2\n1 1\n1 1', expected_output: '1' },
        { input: '5 1\n1\n0\n1\n0\n1', expected_output: '3' },
        { input: '1 5\n1 0 1 0 1', expected_output: '3' },
      ],
      starter_code: {
        python: `m, n = map(int, input().split())
grid = []
for _ in range(m):
    grid.append(list(map(int, input().split())))

# Your solution here
`,
      },
    },
    {
      title: 'Longest Common Subsequence',
      slug: 'longest-common-subsequence',
      difficulty: 'Medium',
      tags: ['dp', 'strings'],
      max_score: 150,
      time_limit: 5000,
      description: `Find the length of the longest common subsequence of two strings.\n\nInput: Two lines, each a string.\nOutput: Length of LCS.`,
      constraints: '1 <= len <= 1000',
      examples: [
        { input: 'abcde\nace', output: '3', explanation: 'LCS is "ace"' },
      ],
      visible_test_cases: [
        { input: 'abcde\nace', expected_output: '3' },
        { input: 'abc\nabc', expected_output: '3' },
        { input: 'abc\ndef', expected_output: '0' },
      ],
      hidden_test_cases: [
        { input: 'a\na', expected_output: '1' },
        { input: 'a\nb', expected_output: '0' },
        { input: 'abcba\nabcbcba', expected_output: '5' },
        { input: 'oxcpqrsvwf\nshmtulqrypy', expected_output: '2' },
        { input: 'abcdefgh\nbdfh', expected_output: '4' },
        { input: 'aaa\naaaa', expected_output: '3' },
        { input: 'programming\ncontest', expected_output: '2' },
        { input: 'kitten\nsitting', expected_output: '4' },
        { input: 'abcdef\nfedcba', expected_output: '1' },
        { input: 'xmjyauz\nmzjawxu', expected_output: '4' },
      ],
      starter_code: {
        python: `s1 = input().strip()
s2 = input().strip()

# Your solution here
`,
      },
    },
    {
      title: 'Sort Array',
      slug: 'sort-array',
      difficulty: 'Medium',
      tags: ['sorting', 'arrays'],
      max_score: 150,
      time_limit: 5000,
      description: `Sort an array of integers in ascending order. Implement a sorting algorithm (not just using built-in sort).\n\nInput:\n- Line 1: n\n- Line 2: n integers\nOutput: Sorted array space-separated.`,
      constraints: '1 <= n <= 5*10^4\n-10^5 <= nums[i] <= 10^5',
      examples: [
        { input: '5\n5 2 3 1 4', output: '1 2 3 4 5', explanation: '' },
      ],
      visible_test_cases: [
        { input: '5\n5 2 3 1 4', expected_output: '1 2 3 4 5' },
        { input: '3\n3 1 2', expected_output: '1 2 3' },
        { input: '1\n42', expected_output: '42' },
      ],
      hidden_test_cases: [
        { input: '5\n1 2 3 4 5', expected_output: '1 2 3 4 5' },
        { input: '5\n5 4 3 2 1', expected_output: '1 2 3 4 5' },
        { input: '4\n0 0 0 0', expected_output: '0 0 0 0' },
        { input: '6\n-3 -1 -2 0 2 1', expected_output: '-3 -2 -1 0 1 2' },
        { input: '3\n100 -100 0', expected_output: '-100 0 100' },
        { input: '8\n8 7 6 5 4 3 2 1', expected_output: '1 2 3 4 5 6 7 8' },
        { input: '5\n5 5 5 5 5', expected_output: '5 5 5 5 5' },
        { input: '7\n3 1 4 1 5 9 2', expected_output: '1 1 2 3 4 5 9' },
        { input: '6\n-5 10 -3 8 -1 6', expected_output: '-5 -3 -1 6 8 10' },
        { input: '4\n1000 -1000 500 -500', expected_output: '-1000 -500 500 1000' },
      ],
      starter_code: {
        python: `n = int(input())
nums = list(map(int, input().split()))

# Your solution here
`,
      },
    },
    {
      title: 'Matrix Transpose',
      slug: 'matrix-transpose',
      difficulty: 'Medium',
      tags: ['matrix', 'arrays'],
      max_score: 150,
      time_limit: 5000,
      description: `Given a matrix, compute its transpose.\n\nInput:\n- Line 1: m n\n- Next m lines: n integers each\nOutput: n lines, each with m integers (the transposed matrix).`,
      constraints: '1 <= m, n <= 100',
      examples: [
        { input: '2 3\n1 2 3\n4 5 6', output: '1 4\n2 5\n3 6', explanation: '' },
      ],
      visible_test_cases: [
        { input: '2 3\n1 2 3\n4 5 6', expected_output: '1 4\n2 5\n3 6' },
        { input: '1 3\n1 2 3', expected_output: '1\n2\n3' },
        { input: '3 1\n1\n2\n3', expected_output: '1 2 3' },
      ],
      hidden_test_cases: [
        { input: '2 2\n1 2\n3 4', expected_output: '1 3\n2 4' },
        { input: '1 1\n5', expected_output: '5' },
        { input: '3 3\n1 2 3\n4 5 6\n7 8 9', expected_output: '1 4 7\n2 5 8\n3 6 9' },
        { input: '2 4\n1 2 3 4\n5 6 7 8', expected_output: '1 5\n2 6\n3 7\n4 8' },
        { input: '4 2\n1 2\n3 4\n5 6\n7 8', expected_output: '1 3 5 7\n2 4 6 8' },
        { input: '3 2\n0 0\n0 0\n0 0', expected_output: '0 0 0\n0 0 0' },
        { input: '2 2\n-1 -2\n-3 -4', expected_output: '-1 -3\n-2 -4' },
        { input: '1 5\n10 20 30 40 50', expected_output: '10\n20\n30\n40\n50' },
        { input: '5 1\n10\n20\n30\n40\n50', expected_output: '10 20 30 40 50' },
        { input: '3 4\n1 0 0 0\n0 1 0 0\n0 0 1 0', expected_output: '1 0 0\n0 1 0\n0 0 1\n0 0 0' },
      ],
      starter_code: {
        python: `m, n = map(int, input().split())
matrix = []
for _ in range(m):
    matrix.append(list(map(int, input().split())))

# Your solution here
`,
      },
    },
    {
      title: 'Longest Palindromic Substring Length',
      slug: 'longest-palindromic-substring',
      difficulty: 'Medium',
      tags: ['strings', 'dp'],
      max_score: 150,
      time_limit: 5000,
      description: `Find the length of the longest palindromic substring in a string.\n\nInput: A single string.\nOutput: Length of longest palindromic substring.`,
      constraints: '1 <= len(s) <= 1000',
      examples: [
        { input: 'babad', output: '3', explanation: '"bab" or "aba"' },
        { input: 'cbbd', output: '2', explanation: '"bb"' },
      ],
      visible_test_cases: [
        { input: 'babad', expected_output: '3' },
        { input: 'cbbd', expected_output: '2' },
        { input: 'a', expected_output: '1' },
      ],
      hidden_test_cases: [
        { input: 'racecar', expected_output: '7' },
        { input: 'abcba', expected_output: '5' },
        { input: 'abcd', expected_output: '1' },
        { input: 'aaa', expected_output: '3' },
        { input: 'aaaa', expected_output: '4' },
        { input: 'abacaba', expected_output: '7' },
        { input: 'ab', expected_output: '1' },
        { input: 'bb', expected_output: '2' },
        { input: 'forgeeksskeegfor', expected_output: '10' },
        { input: 'abcdefedcba', expected_output: '11' },
      ],
      starter_code: {
        python: `s = input().strip()

# Your solution here
`,
      },
    },
    {
      title: 'Coin Change',
      slug: 'coin-change',
      difficulty: 'Medium',
      tags: ['dp', 'greedy'],
      max_score: 150,
      time_limit: 5000,
      description: `Given coin denominations and an amount, find the minimum number of coins needed to make that amount. If impossible, return -1.\n\nInput:\n- Line 1: n (number of coin types)\n- Line 2: n coin denominations\n- Line 3: amount\nOutput: Minimum coins or -1.`,
      constraints: '1 <= n <= 12\n1 <= coins[i] <= 2^31-1\n0 <= amount <= 10^4',
      examples: [
        { input: '3\n1 2 5\n11', output: '3', explanation: '5+5+1' },
      ],
      visible_test_cases: [
        { input: '3\n1 2 5\n11', expected_output: '3' },
        { input: '1\n2\n3', expected_output: '-1' },
        { input: '1\n1\n0', expected_output: '0' },
      ],
      hidden_test_cases: [
        { input: '3\n1 2 5\n0', expected_output: '0' },
        { input: '3\n1 2 5\n1', expected_output: '1' },
        { input: '3\n1 2 5\n5', expected_output: '1' },
        { input: '3\n1 2 5\n6', expected_output: '2' },
        { input: '3\n1 2 5\n100', expected_output: '20' },
        { input: '2\n3 7\n10', expected_output: '-1' },
        { input: '2\n3 7\n21', expected_output: '3' },
        { input: '4\n1 5 10 25\n30', expected_output: '2' },
        { input: '4\n1 5 10 25\n99', expected_output: '9' },
        { input: '1\n1\n10000', expected_output: '10000' },
      ],
      starter_code: {
        python: `n = int(input())
coins = list(map(int, input().split()))
amount = int(input())

# Your solution here
`,
      },
    },
    {
      title: 'Anagram Check',
      slug: 'anagram-check',
      difficulty: 'Medium',
      tags: ['strings', 'hash-table', 'sorting'],
      max_score: 150,
      time_limit: 3000,
      description: `Check if two strings are anagrams of each other (contain same characters with same frequency).\n\nInput: Two lines, each a string.\nOutput: "true" or "false".`,
      constraints: '1 <= len <= 10^5\nLowercase English letters only.',
      examples: [
        { input: 'listen\nsilent', output: 'true', explanation: '' },
      ],
      visible_test_cases: [
        { input: 'listen\nsilent', expected_output: 'true' },
        { input: 'hello\nworld', expected_output: 'false' },
        { input: 'anagram\nnagaram', expected_output: 'true' },
      ],
      hidden_test_cases: [
        { input: 'a\na', expected_output: 'true' },
        { input: 'a\nb', expected_output: 'false' },
        { input: 'ab\nba', expected_output: 'true' },
        { input: 'abc\nabd', expected_output: 'false' },
        { input: 'aabb\nbbaa', expected_output: 'true' },
        { input: 'rat\ntar', expected_output: 'true' },
        { input: 'rat\ncar', expected_output: 'false' },
        { input: 'aaa\naaaa', expected_output: 'false' },
        { input: 'cinema\niceman', expected_output: 'true' },
        { input: 'abc\ncba', expected_output: 'true' },
      ],
      starter_code: {
        python: `s1 = input().strip()
s2 = input().strip()

# Your solution here
# Print "true" or "false"
`,
      },
    },
    {
      title: 'Spiral Matrix',
      slug: 'spiral-matrix',
      difficulty: 'Medium',
      tags: ['matrix', 'simulation'],
      max_score: 150,
      time_limit: 5000,
      description: `Print elements of a matrix in spiral order.\n\nInput:\n- Line 1: m n\n- Next m lines: n integers\nOutput: Elements in spiral order, space-separated.`,
      constraints: '1 <= m, n <= 100',
      examples: [
        { input: '3 3\n1 2 3\n4 5 6\n7 8 9', output: '1 2 3 6 9 8 7 4 5', explanation: '' },
      ],
      visible_test_cases: [
        { input: '3 3\n1 2 3\n4 5 6\n7 8 9', expected_output: '1 2 3 6 9 8 7 4 5' },
        { input: '2 3\n1 2 3\n4 5 6', expected_output: '1 2 3 6 5 4' },
        { input: '1 4\n1 2 3 4', expected_output: '1 2 3 4' },
      ],
      hidden_test_cases: [
        { input: '1 1\n5', expected_output: '5' },
        { input: '2 2\n1 2\n3 4', expected_output: '1 2 4 3' },
        { input: '3 1\n1\n2\n3', expected_output: '1 2 3' },
        { input: '4 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16', expected_output: '1 2 3 4 8 12 16 15 14 13 9 5 6 7 11 10' },
        { input: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12', expected_output: '1 2 3 4 8 12 11 10 9 5 6 7' },
        { input: '4 3\n1 2 3\n4 5 6\n7 8 9\n10 11 12', expected_output: '1 2 3 6 9 12 11 10 7 4 5 8' },
        { input: '2 4\n1 2 3 4\n5 6 7 8', expected_output: '1 2 3 4 8 7 6 5' },
        { input: '1 1\n0', expected_output: '0' },
        { input: '2 1\n1\n2', expected_output: '1 2' },
        { input: '3 2\n1 2\n3 4\n5 6', expected_output: '1 2 4 6 5 3' },
      ],
      starter_code: {
        python: `m, n = map(int, input().split())
matrix = []
for _ in range(m):
    matrix.append(list(map(int, input().split())))

# Your solution here
`,
      },
    },
    {
      title: 'Product of Array Except Self',
      slug: 'product-except-self',
      difficulty: 'Medium',
      tags: ['arrays', 'prefix-sum'],
      max_score: 150,
      time_limit: 5000,
      description: `Given an array, return an array where each element is the product of all elements except itself. Do not use division.\n\nInput:\n- Line 1: n\n- Line 2: n integers\nOutput: Space-separated result.`,
      constraints: '2 <= n <= 10^5\n-30 <= nums[i] <= 30',
      examples: [
        { input: '4\n1 2 3 4', output: '24 12 8 6', explanation: '' },
      ],
      visible_test_cases: [
        { input: '4\n1 2 3 4', expected_output: '24 12 8 6' },
        { input: '5\n-1 1 0 -3 3', expected_output: '0 0 9 0 0' },
        { input: '3\n2 3 4', expected_output: '12 8 6' },
      ],
      hidden_test_cases: [
        { input: '2\n1 2', expected_output: '2 1' },
        { input: '4\n0 0 0 0', expected_output: '0 0 0 0' },
        { input: '3\n1 1 1', expected_output: '1 1 1' },
        { input: '4\n-1 -1 -1 -1', expected_output: '-1 -1 -1 -1' },
        { input: '5\n1 2 3 4 5', expected_output: '120 60 40 30 24' },
        { input: '3\n5 0 3', expected_output: '0 15 0' },
        { input: '4\n2 2 2 2', expected_output: '8 8 8 8' },
        { input: '3\n-1 2 -3', expected_output: '-6 3 -2' },
        { input: '5\n10 1 1 1 1', expected_output: '1 10 10 10 10' },
        { input: '4\n3 -1 4 -2', expected_output: '8 -24 6 -12' },
      ],
      starter_code: {
        python: `n = int(input())
nums = list(map(int, input().split()))

# Your solution here
# Do not use division
`,
      },
    },

    // ═══════════════════════════════════════
    // HARD PROBLEMS (31-40)
    // ═══════════════════════════════════════
    {
      title: 'N-Queens Count',
      slug: 'n-queens-count',
      difficulty: 'Hard',
      tags: ['backtracking', 'recursion'],
      max_score: 200,
      time_limit: 10000,
      description: `Count the number of distinct solutions to the N-Queens puzzle (placing N queens on an NxN board so no two attack each other).\n\nInput: A single integer n.\nOutput: Number of solutions.`,
      constraints: '1 <= n <= 12',
      examples: [
        { input: '4', output: '2', explanation: '' },
        { input: '1', output: '1', explanation: '' },
      ],
      visible_test_cases: [
        { input: '4', expected_output: '2' },
        { input: '1', expected_output: '1' },
        { input: '8', expected_output: '92' },
      ],
      hidden_test_cases: [
        { input: '2', expected_output: '0' },
        { input: '3', expected_output: '0' },
        { input: '5', expected_output: '10' },
        { input: '6', expected_output: '4' },
        { input: '7', expected_output: '40' },
        { input: '9', expected_output: '352' },
        { input: '10', expected_output: '724' },
        { input: '11', expected_output: '2680' },
        { input: '12', expected_output: '14200' },
        { input: '1', expected_output: '1' },
      ],
      starter_code: {
        python: `n = int(input())

# Your solution here
`,
      },
    },
    {
      title: 'Longest Increasing Subsequence',
      slug: 'longest-increasing-subsequence',
      difficulty: 'Hard',
      tags: ['dp', 'binary-search', 'arrays'],
      max_score: 200,
      time_limit: 5000,
      description: `Find the length of the longest strictly increasing subsequence.\n\nInput:\n- Line 1: n\n- Line 2: n integers\nOutput: Length of LIS.`,
      constraints: '1 <= n <= 2500\n-10^4 <= nums[i] <= 10^4',
      examples: [
        { input: '8\n10 9 2 5 3 7 101 18', output: '4', explanation: '[2,3,7,101] or [2,3,7,18]' },
      ],
      visible_test_cases: [
        { input: '8\n10 9 2 5 3 7 101 18', expected_output: '4' },
        { input: '6\n0 1 0 3 2 3', expected_output: '4' },
        { input: '4\n7 7 7 7', expected_output: '1' },
      ],
      hidden_test_cases: [
        { input: '1\n5', expected_output: '1' },
        { input: '5\n1 2 3 4 5', expected_output: '5' },
        { input: '5\n5 4 3 2 1', expected_output: '1' },
        { input: '9\n3 10 2 1 20 4 6 7 5', expected_output: '5' },
        { input: '6\n1 3 2 4 3 5', expected_output: '4' },
        { input: '8\n2 6 3 4 1 7 8 5', expected_output: '5' },
        { input: '10\n1 2 3 1 2 3 1 2 3 4', expected_output: '4' },
        { input: '7\n-5 -3 -1 0 2 4 6', expected_output: '7' },
        { input: '6\n3 1 4 1 5 9', expected_output: '4' },
        { input: '5\n10 20 10 30 20', expected_output: '3' },
      ],
      starter_code: {
        python: `n = int(input())
nums = list(map(int, input().split()))

# Your solution here
`,
      },
    },
    {
      title: 'Edit Distance',
      slug: 'edit-distance',
      difficulty: 'Hard',
      tags: ['dp', 'strings'],
      max_score: 200,
      time_limit: 5000,
      description: `Find the minimum number of operations (insert, delete, replace) to convert word1 to word2.\n\nInput: Two lines, each a string.\nOutput: Minimum edit distance.`,
      constraints: '0 <= len <= 500',
      examples: [
        { input: 'horse\nros', output: '3', explanation: 'horse -> rorse -> rose -> ros' },
      ],
      visible_test_cases: [
        { input: 'horse\nros', expected_output: '3' },
        { input: 'intention\nexecution', expected_output: '5' },
        { input: 'abc\nabc', expected_output: '0' },
      ],
      hidden_test_cases: [
        { input: '\na', expected_output: '1' },
        { input: 'a\n', expected_output: '1' },
        { input: '\n', expected_output: '0' },
        { input: 'kitten\nsitting', expected_output: '3' },
        { input: 'sunday\nsaturday', expected_output: '3' },
        { input: 'abcdef\nazced', expected_output: '3' },
        { input: 'a\nb', expected_output: '1' },
        { input: 'abc\ndef', expected_output: '3' },
        { input: 'dinitrophenylhydrazine\nacetylaminophenol', expected_output: '12' },
        { input: 'abcde\nedcba', expected_output: '4' },
      ],
      starter_code: {
        python: `word1 = input().strip()
word2 = input().strip()

# Your solution here
`,
      },
    },
  ];
}

module.exports = seedProblems;
