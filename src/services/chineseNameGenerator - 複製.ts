import axios from 'axios';

// 定义返回的名字数据类型
export interface GeneratedName {
  id: string;
  name: string;
  pinyin: string;
  meaning: string;
  gender: string;
}

interface GenerateNamesParams {
  englishName: string;
  gender: 'male' | 'female' | 'neutral';
  style: 'traditional' | 'modern' | 'business' | 'cute' | 'neutral';
}

// 调用 DeepSeek API 生成名字
export async function generateNames({ englishName, gender, style }: GenerateNamesParams): Promise<{ names: GeneratedName[] }> {
  try {
    // 构建提示词
    const prompt = `You are a professional Chinese name consultant. Based on the user's English name "${englishName}", generate 3 authentic Chinese names.

Requirements:
1. Pronunciation should be close to the original English name.
2. Each character must be common in modern Chinese (avoid rare or archaic characters).
3. The name's meaning should be positive and match the user's gender preference: ${gender === 'male' ? 'masculine' : gender === 'female' ? 'feminine' : 'neutral or unisex'}.
4. The name style should be: ${style} (traditional/modern/business/cute/neutral).
5. Ensure the tones are harmonious (avoid consecutive third tones).
6. Absolutely avoid any characters with negative meanings (like death, ghost, evil, etc.) or embarrassing homophones.

Return the result as a JSON array in the following format:
[
  {
    "chinese_name": "李明",
    "pinyin": "Li Ming",
    "meaning": "Bright and intelligent; the character 明 symbolizes light and wisdom.",
    "gender": "male"
  },
  ...
]

Only output the JSON array, no other text.`;

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat', // 使用 DeepSeek 的对话模型
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates Chinese names.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}` // 从环境变量读取 API Key
        }
      }
    );

    // 解析 API 返回的内容
    const content = response.data.choices[0].message.content;
    // 提取 JSON 数组（有时 AI 会返回包含 markdown 代码块，需要清理）
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    const names = JSON.parse(jsonMatch[0]);

    // 转换为应用内部格式（添加 id 字段）
    const generatedNames = names.map((item: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      name: item.chinese_name,
      pinyin: item.pinyin,
      meaning: item.meaning,
      gender: item.gender,
    }));

    return { names: generatedNames };
  } catch (error) {
    console.error('Error generating names:', error);
    // 返回空数组或抛出错误，界面会显示加载失败
    return { names: [] };
  }
}