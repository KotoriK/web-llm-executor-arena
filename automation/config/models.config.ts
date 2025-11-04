/**
 * Model configuration for each runtime
 * All runtimes use Qwen2.5-0.5B-Instruct for consistent comparison
 */

export interface ModelConfig {
  url?: string;
  modelId?: string;
  file?: string;
  size?: number;
  quantization: string;
}

export interface RuntimeModels {
  [quantization: string]: ModelConfig;
}

export const models: Record<string, RuntimeModels> = {
  wllama: {
    q8: {
      url: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q8_0.gguf',
      size: 524288000, // ~500MB
      quantization: 'q8_0',
    },
  },
  
  webllm: {
    q0f32: {
      modelId: 'Qwen2.5-0.5B-Instruct-q0f32-MLC',
      quantization: 'q0f32',
    },
  },
  
  transformers: {
    fp32: {
      modelId: 'onnx-community/Qwen2.5-0.5B-Instruct',
      file: 'model.onnx',
      quantization: 'fp32',
    },
    uint8: {
      modelId: 'onnx-community/Qwen2.5-0.5B-Instruct',
      file: 'model_uint8.onnx',
      quantization: 'uint8',
    },
  },
  
  mediapipe: {
    fp32: {
      url: 'https://huggingface.co/litert-community/Qwen2.5-0.5B-Instruct/resolve/main/Qwen2.5-0.5B-Instruct_seq128_f32_ekv1280.tflite',
      quantization: 'fp32',
    },
    int8: {
      url: 'https://huggingface.co/litert-community/Qwen2.5-0.5B-Instruct/resolve/main/Qwen2.5-0.5B-Instruct_seq128_q8_ekv1280.tflite',
      quantization: 'int8',
    },
  },
};
