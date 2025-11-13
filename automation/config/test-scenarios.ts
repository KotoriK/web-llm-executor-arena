/**
 * Test scenarios for LLM runtime performance evaluation
 */

export interface TestScenario {
  name: string;
  prompt: string;
  maxTokens: number;
  temperature: number;
}

export interface ContinuousScenario extends Omit<TestScenario, 'prompt'> {
  prompts: string[];
  iterations: number;
}

export const scenarios = {
  basic: {
    name: 'Basic Performance',
    prompt: 'Hello, how are you?',
    maxTokens: 50,
    temperature: 0.7,
  } as TestScenario,
  
  continuous: {
    name: 'Continuous Inference',
    prompts: [
      'What is the capital of France?',
      'Explain quantum computing in simple terms.',
      'Write a short poem about nature.',
      'What are the benefits of exercise?',
      'Describe the water cycle.',
    ],
    iterations: 10,
    maxTokens: 100,
    temperature: 0.7,
  } as ContinuousScenario,
  
  longGeneration: {
    name: 'Long Text Generation',
    prompt: 'Write a detailed essay about the importance of artificial intelligence in modern society.',
    maxTokens: 500,
    temperature: 0.8,
  } as TestScenario,
  
  coding: {
    name: 'Code Generation',
    prompt: 'Write a Python function to calculate the Fibonacci sequence.',
    maxTokens: 200,
    temperature: 0.3,
  } as TestScenario,
};
