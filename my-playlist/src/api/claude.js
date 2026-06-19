import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const SYSTEM_PROMPT = `당신은 음악 큐레이터입니다.
사용자의 오늘 아침 기분과 일정을 읽고, 그 바이브에 맞는 앨범을 15–20개 추천하세요.

반드시 아래 JSON 객체 형식으로만 응답하세요. 마크다운 코드블록 없이, 순수 JSON만.
{
  "summary": "사용자의 기분/일정을 담은 10글자 이내 한 문장 (예: '집중이 필요한 오전')",
  "albums": [
    {
      "title": "앨범 이름",
      "artist": "아티스트 이름",
      "tags": ["태그1", "태그2"],
      "platform": "itunes",
      "reason": "오늘 메모와 연결된 추천 이유 한 문장"
    }
  ]
}

규칙:
- summary는 사용자의 입력에서 핵심 감정/상황을 10글자 이내로 요약
- tags는 한국어 분위기 단어 2–3개 (예: "집중", "잔잔함", "에너지업", "감성", "드라이브")
- platform은 항상 "itunes"
- reason은 사용자 메모에서 읽어낸 구체적인 이유를 한 문장으로
- title과 artist는 실제로 존재하는 앨범과 아티스트 이름으로 정확하게 작성

추천 예시 레퍼런스 (바이브 → 앨범):
- 집중/작업: Brian Eno - Ambient 1, Nils Frahm - All Melody, Tycho - Dive
- 로파이/감성: Nujabes - Modal Soul, J Dilla - Donuts
- 새벽/몽환: Bon Iver - For Emma Forever Ago, Grouper - Dragging a Dead Deer Up a Hill
- 드라이브/에너지: Daft Punk - Random Access Memories, Caribou - Swim
- 잔잔함/힐링: Nick Drake - Pink Moon, Arthur Russell - World of Echo`

function extractJSON(text) {
  const trimmed = text.trim()
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) return codeBlock[1].trim()
  const objMatch = trimmed.match(/\{[\s\S]*\}/)
  if (objMatch) return objMatch[0]
  const arrayMatch = trimmed.match(/\[[\s\S]*\]/)
  if (arrayMatch) return arrayMatch[0]
  return trimmed
}

export async function getRecommendations(memo, signal) {
  console.log('[Claude] 호출:', memo)

  const res = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: `오늘의 바이브 메모: "${memo}"` }
    ],
  }, { signal })

  const raw = res.content[0]?.type === 'text' ? res.content[0].text : ''
  console.log('[Claude] 응답:', raw)

  const parsed = JSON.parse(extractJSON(raw))

  // 이전 배열 형식 호환 처리
  const albumList = Array.isArray(parsed) ? parsed : (parsed.albums ?? [])
  const summary = Array.isArray(parsed) ? null : (parsed.summary ?? null)

  return {
    summary,
    albums: albumList.map((p, i) => ({
      ...p,
      id: `${Date.now()}-${i}`,
    })),
  }
}
