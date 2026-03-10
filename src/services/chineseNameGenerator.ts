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
const prompt = `You are a professional Chinese name consultant. The user has provided their full English name: "${englishName}".

**First**, split the name into first name and last name (if possible). For example, "Kenny Chong" → first name "Kenny", last name "Chong". If the input is a single word, treat it as first name and omit last name.

**Then** generate 3 Chinese names following these strict rules:

1. **Last name (姓)**: Convert the last name to a common Chinese surname that sounds similar. Examples:
   - Chong → 钟, 崇, 丛
   - Lee → 李, 黎
   - Chen → 陈, 谌
   - Zhang → 张, 章
   - Wang → 王, 汪
   - Liu → 刘, 柳
   - Yang → 杨, 阳
   Use the most appropriate character. Do not invent new surnames.

2. **First name (名)**: Create a meaningful given name based on the first name's pronunciation, gender preference, and style. Follow the style definitions below.

3. **Gender preference**: ${gender === 'male' ? 'masculine' : gender === 'female' ? 'feminine' : 'neutral or unisex'}.

4. **Style definitions** (choose the one requested: "${style}"):
   - **traditional**: Classical, elegant characters from ancient literature. Examples: 伟, 杰, 文, 武, 明.
   - **modern**: Trendy, fresh characters popular today. Examples: 轩, 宇, 诺, 梓, 涵.
   - **business**: Professional, trustworthy characters. Examples: 睿, 诚, 信, 毅, 钧.
   - **cute**: Sweet, adorable characters. Examples: 小, 可, 萌, 甜, 乐.
   - **neutral**: Balanced, non-gendered characters. Examples: 思, 悦, 宁, 安, 晨.

5. **Character rules**:
   - All characters must be common in modern Chinese.
   - Avoid negative meanings or embarrassing homophones.
   - Ensure tones are harmonious (avoid consecutive third tones).
   - The three generated names must be significantly different from each other.

Return the result as a JSON array in this exact format:
[
  {
    "chinese_name": "钟凯尼",  // 姓+名，例如姓钟，名凯尼
    "pinyin": "Zhong Kaini",
    "meaning": "Kaini (from Kenny) means victory and perseverance; Zhong is a common surname.",
    "gender": "male"
  },
  ...
]

Only output the JSON array, no other text.`;
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