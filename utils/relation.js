/**
 * 亲属关系解析引擎 (修复版)
 * 核心思想：状态机 + 属性叠加
 */
const RelationCalculator = {
  // 基础状态：以“我”为原点
  // generation: 辈分差 (0=自己, 1=父母辈, -1=子女辈)
  // side: 父系(paternal)/母系(maternal)/自身(self)
  // gender: 男(male)/女(female)
  // birthOrder: 长幼 (elder/younger/null)
  BASE_STATE: {
    generation: 0,
    side: 'self',
    gender: 'male', // 默认假设“我”是男性，用于计算称呼（如哥哥/弟弟）
    birthOrder: null,
    isSelf: true
  },

  // 关系词定义：描述这个词对当前状态做了什么改变
  // 注意：这里定义的是“相对关系”
  RELATION_DEFS: {
    // --- 直系亲属 ---
    '爸爸': { generation: 1, side: 'paternal', gender: 'male', type: 'parent' },
    '妈妈': { generation: 1, side: 'maternal', gender: 'female', type: 'parent' },
    '爷爷': { generation: 2, side: 'paternal', gender: 'male', type: 'grandparent' },
    '奶奶': { generation: 2, side: 'paternal', gender: 'female', type: 'grandparent' },
    '外公': { generation: 2, side: 'maternal', gender: 'male', type: 'grandparent' },
    '外婆': { generation: 2, side: 'maternal', gender: 'female', type: 'grandparent' },
    '儿子': { generation: -1, side: 'self', gender: 'male', type: 'child' },
    '女儿': { generation: -1, side: 'self', gender: 'female', type: 'child' },

    // --- 旁系亲属 (同代) ---
    '哥哥': { generation: 0, side: 'self', gender: 'male', birthOrder: 'elder', type: 'sibling' },
    '姐姐': { generation: 0, side: 'self', gender: 'female', birthOrder: 'elder', type: 'sibling' },
    '弟弟': { generation: 0, side: 'self', gender: 'male', birthOrder: 'younger', type: 'sibling' },
    '妹妹': { generation: 0, side: 'self', gender: 'female', birthOrder: 'younger', type: 'sibling' },

    // --- 旁系亲属 (父代) ---
    // 爸爸的兄弟姐妹
    '伯伯': { generation: 1, side: 'paternal', gender: 'male', birthOrder: 'elder', type: 'uncle' },
    '叔叔': { generation: 1, side: 'paternal', gender: 'male', birthOrder: 'younger', type: 'uncle' },
    '姑姑': { generation: 1, side: 'paternal', gender: 'female', type: 'aunt' },
    // 妈妈的兄弟姐妹
    '舅舅': { generation: 1, side: 'maternal', gender: 'male', type: 'uncle' },
    '姨妈': { generation: 1, side: 'maternal', gender: 'female', type: 'aunt' },

    // --- 旁系亲属 (子代/孙代) ---
    // 兄弟姐妹的子女
    '侄子': { generation: -1, side: 'self', gender: 'male', type: 'nephew' },
    '侄女': { generation: -1, side: 'self', gender: 'female', type: 'niece' },
    '外甥': { generation: -1, side: 'maternal', gender: 'male', type: 'nephew' }, // 姐妹的儿子
    '外甥女': { generation: -1, side: 'maternal', gender: 'female', type: 'niece' }, // 姐妹的女儿

    // --- 表亲/堂亲 (需要特殊逻辑) ---
    // 默认表亲，具体是堂还是表由算法推导
    '堂哥': { generation: 0, side: 'paternal', gender: 'male', type: 'cousin' },
    '堂弟': { generation: 0, side: 'paternal', gender: 'male', type: 'cousin' },
    '堂姐': { generation: 0, side: 'paternal', gender: 'female', type: 'cousin' },
    '堂妹': { generation: 0, side: 'paternal', gender: 'female', type: 'cousin' },
    '表哥': { generation: 0, side: 'maternal', gender: 'male', type: 'cousin' },
    '表弟': { generation: 0, side: 'maternal', gender: 'male', type: 'cousin' },
    '表姐': { generation: 0, side: 'maternal', gender: 'female', type: 'cousin' },
    '表妹': { generation: 0, side: 'maternal', gender: 'female', type: 'cousin' },
  },

  /**
   * 主解析函数
   * @param {string} text - 如 "爸爸的姐姐"
   */
  parse(text) {
    if (!text || !text.trim()) return { success: false, error: '输入不能为空' };
    text = text.trim();

    // 特殊处理：我
    if (text === '我' || text === '自己') {
      return {
        success: true,
        title: '自己',
        path: ['我'],
        state: this.BASE_STATE
      };
    }

    const parts = text.split('的').filter(p => p);
    let currentState = { ...this.BASE_STATE };
    const path = ['我'];

    // 遍历关系链
    for (let i = 0; i < parts.length; i++) {
      const word = parts[i];
      const def = this.RELATION_DEFS[word];

      if (!def) {
        return { success: false, error: `无法识别: "${word}"` };
      }

      // --- 核心状态更新逻辑 ---
      // 1. 辈分叠加
      const newGeneration = currentState.generation + def.generation;

      // 2. 父系/母系传递逻辑 (关键!)
      let newSide = currentState.side;
      // 如果当前是“自身”侧，且关系词带有side，则覆盖
      if (currentState.side === 'self' && def.side !== 'self') {
        newSide = def.side;
      } 
      // 如果当前不是自身侧（已经是父系或母系），且关系词也是父系/母系，则保持或切换
      // 例如：妈妈(母系) 的 弟弟(母系) -> 保持母系
      // 例如：爸爸(父系) 的 姐姐(父系) -> 保持父系
      // 例如：爸爸(父系) 的 妈妈(母系) -> 切换到母系 (这种情况较少，但逻辑要支持)
      else if (def.side !== 'self') {
        // 只有当关系词明确指定了side，且当前不是self时，才更新side
        // 这一步主要用于处理“表哥”这种直接指定side的词
        // 对于“姐姐”这种side=self的词，沿用父节点的side
        if (def.side !== 'self') {
            // 特殊处理：如果是从父母辈下来的子女，side沿用父母
            if (def.type === 'child' || def.type === 'cousin') {
                newSide = currentState.side; // 子女/侄子的side继承自父亲/叔叔
            } else {
                newSide = def.side;
            }
        }
      }

      // 3. 性别更新
      const newGender = def.gender || currentState.gender;

      // 4. 长幼更新 (如果有)
      const newBirthOrder = def.birthOrder || currentState.birthOrder;

      // 5. 更新状态
      currentState = {
        generation: newGeneration,
        side: newSide,
        gender: newGender,
        birthOrder: newBirthOrder,
        isSelf: false,
        lastRelationType: def.type // 记录最后一步的关系类型，用于推导堂/表
      };

      // 生成路径描述 (简化版)
      path.push(word);
    }

    // 推导最终称谓
  const title = this.deriveTitle(currentState);

  return {
    success: true,
    title: title,
    path: path.join(' -> '),
    generationDiff: currentState.generation,
    state: currentState
  };
  },

  /**
   * 根据最终状态推导称谓 (最复杂的部分)
   */
  deriveTitle(state) {
    const { generation, side, gender, birthOrder, lastRelationType } = state;

    // 1. 自己
    if (state.isSelf) return '自己';

    // 2. 直系长辈
    if (generation > 0) {
      if (lastRelationType === 'parent') {
        return side === 'paternal' ? (gender === 'male' ? '父亲' : '母亲') 
                               : (gender === 'male' ? '父亲' : '母亲'); // 母亲这边也叫父亲/母亲，或者叫爸爸/妈妈，这里简化为父亲/母亲
      }
      if (lastRelationType === 'grandparent') {
        if (side === 'paternal') return gender === 'male' ? '爷爷' : '奶奶';
        return gender === 'male' ? '外公' : '外婆';
      }
      if (lastRelationType === 'uncle' || lastRelationType === 'aunt') {
        // 伯伯/叔叔/姑姑/舅舅/姨妈
        if (side === 'paternal') {
          if (gender === 'male') return birthOrder === 'elder' ? '伯伯' : '叔叔';
          return '姑姑';
        } else {
          if (gender === 'male') return '舅舅';
          return '姨妈';
        }
      }
    }

    // 3. 直系晚辈
    if (generation < 0) {
      if (lastRelationType === 'child') {
        return gender === 'male' ? '儿子' : '女儿';
      }
      if (lastRelationType === 'nephew' || lastRelationType === 'niece') {
        // 区分侄子/外甥
        if (side === 'paternal') {
          return gender === 'male' ? '侄子' : '侄女';
        } else {
          return gender === 'male' ? '外甥' : '外甥女';
        }
      }
    }

    // 4. 同代 (兄弟姐妹)
    if (generation === 0 && !state.isSelf) {
      if (lastRelationType === 'sibling') {
        if (gender === 'male') return birthOrder === 'elder' ? '哥哥' : '弟弟';
        return birthOrder === 'elder' ? '姐姐' : '妹妹';
      }
      // 5. 同代 (表亲/堂亲) - 这是最难的
      if (lastRelationType === 'cousin') {
        // 判断堂/表：
        // 如果side是paternal，且是通过父亲的兄弟(叔伯)传下来的 -> 堂
        // 如果side是paternal，且是通过父亲的姐妹(姑姑)传下来的 -> 表 (旧习俗有时也叫堂，这里按标准区分)
        // 如果side是maternal -> 表
        
        // 简化逻辑：
        // 如果 state.side === 'paternal' 且 路径中没有经过女性传递(简化处理)，默认为堂
        // 否则为表
        // 由于我们没有记录完整路径的性别传递，这里用一个启发式规则：
        // 如果 lastRelationType 是 cousin，且 side 是 paternal，我们默认为“堂”，否则为“表”
        // 但是“爸爸的姐姐的儿子” side是paternal，但应该是表。
        
        // 精确逻辑：检查上一代的side是否一致
        // 这里为了简化，我们假设输入如果是“堂哥”则side=paternal，“表哥”则side=maternal
        // 如果用户输入的是“爸爸的姐姐的儿子”，我们需要推导side
        
        // 修正：在状态更新时，对于cousin，side应该继承自父节点(叔叔/舅舅)
        // 所以在 deriveTitle 时，如果 side === 'paternal' -> 堂; side === 'maternal' -> 表
        
        const prefix = (side === 'paternal') ? '堂' : '表';
        
        if (gender === 'male') {
          return prefix + (birthOrder === 'elder' ? '哥' : '弟');
        } else {
          return prefix + (birthOrder === 'elder' ? '姐' : '妹');
        }
      }
    }
    
    // 6. 配偶 (简化)
    if (lastRelationType === 'spouse') {
        return gender === 'male' ? '丈夫' : '妻子';
    }

    return '亲戚';
  }
};

module.exports = {
  parseRelation: (text) => RelationCalculator.parse(text)
};
