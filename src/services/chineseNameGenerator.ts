import axios from 'axios';

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

export async function generateNames({ englishName, gender, style }: GenerateNamesParams): Promise<{ names: GeneratedName[] }> {
  try {
const prompt = `You are a professional Chinese name consultant. Based on the user's English name "${englishName}", generate 3 Chinese names that STRICTLY follow the requested style: "${style}".

The user's gender preference is: ${gender === 'male' ? 'masculine' : gender === 'female' ? 'feminine' : 'neutral or unisex'}.

You MUST generate names that are **exclusively** in the given style, using characteristic characters and avoiding overlap with other styles.

### Style Definitions and Examples:
- **traditional**: Use classical, elegant characters often found in ancient literature and poetry. Examples: 明, 伟, 杰, 文, 武, 德, 仁, 义, 礼, 智, 信. Avoid modern trendy characters.
- **modern**: Use contemporary, fashionable characters popular in recent decades. Examples: 轩, 宇, 诺, 梓, 涵, 睿, 熙, 辰, 一, 依. Avoid overly classical or rustic characters.
- **business**: Use professional, sophisticated, and trustworthy characters, often with meanings related to success, wisdom, and reliability. Examples: 睿, 诚, 信, 毅, 钧, 铭, 博, 硕, 乾, 坤. Avoid cute or playful characters.
- **cute**: Use sweet, adorable, and endearing characters, often with soft sounds or meanings related to happiness and loveliness. Examples: 小, 可, 萌, 甜, 乐, 欢, 欣, 怡, 宝, 贝. Avoid serious or formal characters.
- **neutral**: Use balanced, harmonious characters that are not strongly gendered and work well for anyone. Examples: 思, 悦, 宁, 安, 晨, 曦, 然, 若, 清, 和. Avoid overly masculine or feminine characters.

### Critical Rules:
1. **No character reuse across the three names** – each of the three names should use different characters from the others.
2. All three names must be significantly different from each other in sound and meaning.
3. The names must be distinctively aligned with the selected style. If you see characters from other styles in your output, you are violating the instruction.
4. Ensure pronunciation is close to the original English name.
5. All characters must be common in modern Chinese (avoid rare/archaic).
6. Meanings must be positive and match gender preference.
7. Tones should be harmonious (avoid consecutive third tones).
8. Absolutely avoid negative meanings or embarrassing homophones.

Return ONLY a JSON array in this exact format:
[
  {
    "chinese_name": "李明",
    "pinyin": "Li Ming",
    "meaning": "Bright and intelligent; the character 明 symbolizes light and wisdom.",
    "gender": "male"
  },
  ...
]

Only output the JSON array, no other text.`;  // ← 唯一的反引号在最后
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates Chinese names.' },
          { role: 'user', content: prompt }
        ],
        temperature: 1.2,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        }
      }
    );

    const content = response.data.choices[0].message.content;
    // 提取 JSON 数组（AI 有时会返回 markdown 代码块，需要清理）
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    const names = JSON.parse(jsonMatch[0]);

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
    return { names: [] };
  }
}