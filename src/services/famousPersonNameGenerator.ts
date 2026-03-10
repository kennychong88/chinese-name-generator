import axios from 'axios';
import { FamousPerson } from '../data/famousChinesePeople'; // 引入人物类型

// 定义返回的名字数据类型（与普通模式略有不同，包含 inspiredBy 字段）
export interface FamousPersonName {
  id: string;
  name: string;           // 中文名
  pinyin: string;         // 拼音
  meaning: string;        // 寓意
  gender: string;         // 性别
  inspiredBy: string;     // 灵感来源人物
  historicalContext?: string; // 历史背景（可选）
}

export interface FamousPersonNameResponse {
  names: FamousPersonName[];
}

interface GenerateNamesParams {
  englishName: string;
  gender: 'male' | 'female' | 'neutral';
  favoritePersonId: string;          // 所选人物ID
  style: 'traditional' | 'modern' | 'business' | 'cute' | 'neutral';
  // 注意：实际需要传入所选人物的详细信息，但这里我们假设组件会传入 person 对象
  // 由于函数签名不能轻易改，我们可以在内部通过 ID 获取人物信息
  // 但更简单的方法是：在组件中获取人物对象，然后传递给生成函数
  // 不过为了最小改动，我们这里假设函数调用时会传入 person 对象（需要修改组件）
  // 更合理的是：组件中获取 selectedFamousPerson 对象，然后传递给 generateNamesInspiredByFamousPerson
  // 因此我们需要调整 HomePage.tsx 中调用该函数的地方，增加 person 参数。
}

// 为了兼容现有代码，我们保持原有函数签名，但内部需要从某个地方获取人物信息
// 我们可以从 localStorage 或通过 ID 从数据源获取，但最简单的是直接要求组件传入 person 对象
// 因此我建议修改 HomePage.tsx 中的调用，传递 selectedFamousPerson 对象
// 这样就不需要再查询数据。

// 但为了快速实现，我们先假设组件已经能传入 person 对象，函数签名稍作调整：
// 将参数类型改为包含 person 对象
export interface GenerateFamousPersonParams {
  englishName: string;
  gender: 'male' | 'female' | 'neutral';
  favoritePerson: FamousPerson;      // 直接传入人物对象
  style: 'traditional' | 'modern' | 'business' | 'cute' | 'neutral';
}

export async function generateNamesInspiredByFamousPerson(
  params: GenerateFamousPersonParams
): Promise<FamousPersonNameResponse> {
  const { englishName, gender, favoritePerson, style } = params;
  try {
    // 构建提示词，包含人物信息
    const prompt = `You are a professional Chinese name consultant. Based on the user's English name "${englishName}", generate 3 authentic Chinese names inspired by the style and characteristics of the famous historical figure "${favoritePerson.name}" (${favoritePerson.pinyin}).

About this figure: ${favoritePerson.description || 'A renowned historical figure.'}

Requirements:
1. Pronunciation should be close to the original English name.
2. Each character must be common in modern Chinese (avoid rare or archaic characters).
3. The name's meaning should be positive and match the user's gender preference: ${gender === 'male' ? 'masculine' : gender === 'female' ? 'feminine' : 'neutral or unisex'}.
4. The name style should be: ${style} (traditional/modern/business/cute/neutral).
5. The names should evoke the spirit, elegance, or qualities associated with ${favoritePerson.name}. For example, if the figure is known for wisdom, the name should reflect wisdom; if known for bravery, reflect bravery.
6. Ensure the tones are harmonious (avoid consecutive third tones).
7. Absolutely avoid any characters with negative meanings.

Return the result as a JSON array in the following format:
[
  {
    "chinese_name": "李明",
    "pinyin": "Li Ming",
    "meaning": "Bright and intelligent; inspired by the wisdom of ${favoritePerson.name}.",
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
          { role: 'system', content: 'You are a helpful assistant that generates Chinese names inspired by historical figures.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
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
    // 提取 JSON 数组
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    const names = JSON.parse(jsonMatch[0]);

    // 转换为应用内部格式，添加 inspiredBy 字段
    const generatedNames = names.map((item: any, index: number) => ({
  id: `famous-${Date.now()}-${index}`,
  name: item.chinese_name,
  pinyin: item.pinyin,
  meaning: item.meaning,
  gender: item.gender,
  // 修改 inspiredBy 为对象，包含 person.name
  inspiredBy: {
    person: {
      name: favoritePerson.name
    }
  },
  historicalContext: favoritePerson.description 
  ? favoritePerson.description.substring(0, 60) + '...' 
  : 'A figure from Chinese history.',
}));

    return { names: generatedNames };
  } catch (error) {
    console.error('Error generating famous person names:', error);
    return { names: [] };
  }
}