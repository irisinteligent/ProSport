/**
 * Mapa de modalidade → cenário fotográfico usado na composição automática do
 * hero do atleta (ver `compose-hero.ts`). Cada cenário descreve o ambiente que
 * substitui o fundo da foto original, mantendo o atleta e reiluminando-o.
 *
 * COBERTURA UNIVERSAL: este mapa é apenas um "afinamento" dos esportes mais
 * comuns (cenário escrito à mão para máxima qualidade). QUALQUER esporte fora da
 * lista é coberto automaticamente pelo fallback dinâmico em `getScenePrompt`, que
 * usa o próprio nome da modalidade para o modelo inferir o ambiente. Adicionar uma
 * entrada aqui é opcional e serve só para refinar um esporte específico.
 * Chaves são normalizadas (sem acento, minúsculas).
 */

const SCENES: Record<string, string> = {
  futebol: 'a professional football (soccer) stadium at golden hour, blurred cheering crowd in the stands, dramatic floodlights, shallow depth of field',
  'jiu-jitsu': 'a cinematic Brazilian jiu-jitsu dojo, green tatami floor, warm wooden walls, dramatic low-key lighting and atmospheric haze',
  'jiu jitsu': 'a cinematic Brazilian jiu-jitsu dojo, green tatami floor, warm wooden walls, dramatic low-key lighting and atmospheric haze',
  jiujitsu: 'a cinematic Brazilian jiu-jitsu dojo, green tatami floor, warm wooden walls, dramatic low-key lighting and atmospheric haze',
  judo: 'a traditional judo dojo with tatami mats and wooden walls, soft directional light, atmospheric',
  karate: 'a traditional martial arts dojo with wooden floor and shoji screens, dramatic directional light',
  mma: 'a dark MMA arena with an octagon cage and dramatic spotlights, atmospheric smoke and haze',
  boxe: 'a dramatic boxing arena with a ring under bright spotlights, dark blurred crowd, smoke',
  natacao: 'an indoor olympic swimming pool, blue water reflections, bright clean light, blurred lane ropes, shallow depth of field',
  basquete: 'an indoor basketball arena with a polished hardwood court, dramatic spotlights and blurred crowd',
  volei: 'an indoor volleyball arena court under dramatic lighting with a blurred crowd',
  handebol: 'an indoor handball arena court under dramatic sports lighting with a blurred crowd',
  corrida: 'an athletics running track stadium at sunset, blurred crowd, dramatic warm light, lens flare',
  atletismo: 'an athletics track and field stadium at golden hour, blurred crowd, dramatic light',
  ciclismo: 'an open road cycling scene at golden hour with motion-blurred background and dramatic light',
  tenis: 'a professional tennis court under dramatic stadium lights with a blurred crowd',
  surfe: 'a dramatic ocean surf scene with a breaking wave and golden hour backlight',
  skate: 'a concrete skatepark at golden hour with dramatic light and shallow depth of field',
  ginastica: 'a gymnastics arena with apparatus under dramatic spotlights and a blurred crowd',
};

const DEFAULT_SCENE =
  'a dramatic professional sports arena with cinematic lighting, blurred crowd and shallow depth of field';

function normalize(sport: string): string {
  return sport
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/**
 * Devolve a descrição do cenário fotográfico para QUALQUER modalidade.
 * Ordem: 1) cenário curado exato → 2) correspondência parcial curada →
 * 3) fallback dinâmico universal (usa o próprio nome do esporte).
 */
export function getScenePrompt(sport: string): string {
  const key = normalize(sport);
  if (key in SCENES) return SCENES[key];
  // tenta casar por correspondência parcial (ex.: "jiu-jitsu brasileiro" -> "jiu-jitsu")
  for (const [k, v] of Object.entries(SCENES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  // Cobertura universal: qualquer esporte não listado usa o próprio nome para o
  // modelo inferir o ambiente correto (quadra, campo, pista, tatame, piscina...).
  const clean = sport.trim();
  if (!clean) return DEFAULT_SCENE;
  return (
    `the typical professional setting for the sport of ${clean} — its arena, ` +
    'court, field, track, mat, pool or natural environment — with cinematic ' +
    'dramatic lighting, blurred background and shallow depth of field'
  );
}

/**
 * Monta o prompt de edição (image-to-image) para o modelo Kontext: troca o fundo
 * pelo cenário da modalidade, preservando atleta/uniforme/pose e reiluminando.
 */
export function buildKontextPrompt(sport: string): string {
  return (
    `Replace the plain studio background with ${getScenePrompt(sport)}. ` +
    'Keep the athlete exactly the same — preserve the face, body, uniform and pose — ' +
    'and relight them to match the new scene with realistic shadows and rim light. ' +
    'Frame the FULL athlete in a vertical 4:5 portrait, with the head and face FULLY visible and NEVER cropped. ' +
    'Photorealistic, cinematic, professional sports photography.'
  );
}
