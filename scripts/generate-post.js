/**
 * ClubNou - Script Otonòm pou Piblikasyon Atik AI
 * Orè: 2 fwa pa jou (6:00 AM & 4:00 PM Lè Ayiti / 10:00 & 20:00 UTC)
 * Modèl: Google Gemini API (gemini-2.5-flash)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Chaje varyab anviwònman yo (.env si li egziste)
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemen fichye done yo
const ROOT_ARTICLES_PATH = path.resolve(__dirname, '../data/articles.json');
const PUBLIC_ARTICLES_PATH = path.resolve(__dirname, '../public/data/articles.json');

// Lis sijè kle pou ClubNou (Edikasyon, Tontin, Antreprenarya, Lidèchip)
const TOPICS = [
  {
    theme: "Tontin Modènize & Koperativ Envestisman",
    category: "Tontin & Envestisman Kolektif",
    domain: "Ekonomi Solidè & Koperativ Jèn",
    imageKeywords: "community,investment,growth,handshake,finance",
    fallbackImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80"
  },
  {
    theme: "Kòman pou kòmanse yon ti biznis lokal ak ti kòb (10,000 a 25,000 Goud)",
    category: "Antreprenarya Lokal",
    domain: "Kreyasyon Biznis & Karyè Jèn",
    imageKeywords: "entrepreneur,small business,market,creativity",
    fallbackImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    theme: "Jesyon Bidjè Pèsonèl ak Epany Ijans an Ayiti",
    category: "Edikasyon Finansyè",
    domain: "Finans Pèsonèl & Rezilyans",
    imageKeywords: "budget,saving,money,piggybank,planning",
    fallbackImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    theme: "Oryantasyon Apre Filo: Opòtinite Karyè ak Metye Pratik",
    category: "Oryantasyon & Lidèchip",
    domain: "Devlopman Pèsonèl & Edikasyon",
    imageKeywords: "students,graduation,learning,future,technology",
    fallbackImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
  },
  {
    theme: "Lidèchip Kominotè ak Tèt Ansanm nan 10 Depatman yo",
    category: "Lidèchip & Kominote",
    domain: "Enpak Sosyal & Kolaborasyon",
    imageKeywords: "teamwork,leadership,hands,together,empowerment",
    fallbackImage: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1200&q=80"
  },
  {
    theme: "Valè Transfòmasyon Pwodwi Lokal ak Agrikilti Dirab",
    category: "Biznis Dirab",
    domain: "Pwodiksyon Nasyonal & Agrikilti",
    imageKeywords: "agriculture,farming,local,fresh,harvest",
    fallbackImage: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
  }
];

// Fòmate dat jounen an an Kreyòl Ayisyen
function getHaitianDate() {
  const mwaYo = [
    "Janvye", "Fevriye", "Mas", "Avril", "Me", "Jen",
    "Jiyè", "Out", "Septanm", "Oktòb", "Novanm", "Desanm"
  ];
  const kounyea = new Date();
  // Ajiste pou lè Ayiti (UTC-4)
  const utcOffset = kounyea.getTime() + (kounyea.getTimezoneOffset() * 60000);
  const haitiTime = new Date(utcOffset - (4 * 3600000));
  
  const jou = haitiTime.getDate();
  const mwa = mwaYo[haitiTime.getMonth()];
  const ane = haitiTime.getFullYear();
  return `${jou} ${mwa} ${ane}`;
}

async function generateArticleWithGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ AVÈTISMAN: process.env.GEMINI_API_KEY pa defini.");
    console.warn("Pou mete kle a: ajoute GEMINI_API_KEY nan fichye .env oswa nan GitHub Secrets.");
    throw new Error("GEMINI_API_KEY manke nan anviwònman an.");
  }

  // Chwazi yon sijè o aza oswa baze sou tan
  const selectedTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  console.log(`🎯 Tèm chwazi pou jodi a: ${selectedTopic.theme} (${selectedTopic.category})`);

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Ou se redaktè an chèf ak konseye espesyal pou platfòm "ClubNou" (clubnou.com), yon rezo jèn ak jèn pwofesyonèl nan tout 10 depatman an Ayiti ki ap mobilize pou aprann edikasyon finansyè, kòmanse biznis lokal dirab, epi kreye gwoup envestisman kolektif tankou tontin modènize. Fondatè rezo a se Clauvens EXAUS.

MISYON W:
Ekri yon atik ekselan, motivan, pwofesyonèl, pratik e fasil pou konprann, KONPLÈTMAN AN KREYÒL AYISYEN sou tèm sa a:
"${selectedTopic.theme}"
Kategori: "${selectedTopic.category}"
Domèn: "${selectedTopic.domain}"

KONDISYON POU KONTNI AN:
1. Tit la dwe frapan, motivan epi bay anvi li (pa egzanp: "5 Sekrè pou...", "Kijan pou w...", "Estrateji pratik pou...").
2. Otè: Chwazi swa "Clauvens EXAUS", "Ekip Edikasyon ClubNou", oswa "Komite Finans & Tontin ClubNou".
3. Rezime (excerpt): 1 a 2 fraz pwisan ki rezime lesans atik la (anviwon 30-40 mo).
4. Kontni konplè (content): 
   - Entwodiksyon sou reyalite jèn yo an Ayiti.
   - 3 a 4 pwen aksyonab ak sou-tit (sou fòma Markdown ### Tit).
   - Konsèy konkrè ak chif oswa egzanp lokal (nan goud, kominote, mache lokal).
   - Konklizyon ak yon apèl a laksyon (CTA) pou rantre nan ClubNou ak tontin modènize yo.
5. Tan lekti (readTime): egzanp "4 min lekti".

FÒMA REPONS (JSON STRIK SÈLMAN):
Retounen yon objè JSON san okenn tèks anvan oswa apre, ak estrikti egzak sa a:
{
  "title": "Tit atik la an Kreyòl",
  "author": "Non otè a",
  "authorRole": "Wòl otè a (egz: Fondatè ClubNou oswa Espesyalis Finans)",
  "category": "${selectedTopic.category}",
  "domain": "${selectedTopic.domain}",
  "readTime": "4 min lekti",
  "excerpt": "Kout rezime atik la...",
  "content": "Kontni konplè atik la an Markdown...",
  "image": "${selectedTopic.fallbackImage}"
}
`;

  console.log("🤖 Ap voye demann bay Google Gemini API...");
  
  // Modèl ofisyèl Google Gemini SDK (@google/genai)
  const candidateModels = [
    process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash'
  ];

  let rawText = '';
  let successfulModel = '';

  for (const modelName of candidateModels) {
    try {
      console.log(`📡 Eseye rele modèl: ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      });
      rawText = response.text || '';
      successfulModel = modelName;
      console.log(`✅ Siksè avèk modèl: ${modelName}!`);
      break;
    } catch (err) {
      console.warn(`⚠️ Modèl ${modelName} echwe: ${err.message}`);
    }
  }

  if (!rawText) {
    throw new Error("Pa gen okenn modèl Gemini ki rive reponn.");
  }

  // Netwaye repons lan si gen bwat kòd markdown
  let cleanedJson = rawText.trim();
  if (cleanedJson.startsWith('```json')) {
    cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedJson.startsWith('```')) {
    cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const articleData = JSON.parse(cleanedJson);

  // Asire id ak dat yo byen fòmate
  const timestamp = Date.now();
  articleData.id = `atik-${timestamp}`;
  articleData.date = getHaitianDate();

  if (!articleData.image) {
    articleData.image = selectedTopic.fallbackImage;
  }

  return articleData;
}

async function main() {
  console.log("==================================================");
  console.log("🚀 CLOUBNOU - BOT OTONÒM POU GENERASYON ATIK");
  console.log(`⏰ Lè aktyèl: ${new Date().toISOString()}`);
  console.log("==================================================");

  try {
    const newArticle = await generateArticleWithGemini();
    console.log(`📝 Nouvo atik kreye: "${newArticle.title}" pa ${newArticle.author}`);

    // Li fichye santral data/articles.json
    let articles = [];
    if (fs.existsSync(ROOT_ARTICLES_PATH)) {
      const rawContent = fs.readFileSync(ROOT_ARTICLES_PATH, 'utf-8');
      try {
        articles = JSON.parse(rawContent);
        if (!Array.isArray(articles)) articles = [];
      } catch (e) {
        console.error("⚠️ Fichye articles.json te gen erè JSON, n ap re-inisyalize l.");
        articles = [];
      }
    }

    // MANDAT STRIK: Itilize .unshift() pou nouvo atik la pran pozisyon #1 (anlè nèt)
    articles.unshift(newArticle);
    console.log(`📌 Nouvo atik la plase an premye (#1 avèk .unshift()). Total atik: ${articles.length}`);

    // Sove nan data/articles.json
    fs.mkdirSync(path.dirname(ROOT_ARTICLES_PATH), { recursive: true });
    fs.writeFileSync(ROOT_ARTICLES_PATH, JSON.stringify(articles, null, 2), 'utf-8');
    console.log(`💾 Sove avèk siksè nan: ${ROOT_ARTICLES_PATH}`);

    // Sove tou nan public/data/articles.json si dosye a egziste pou Vite dev/build
    if (fs.existsSync(path.dirname(PUBLIC_ARTICLES_PATH))) {
      fs.writeFileSync(PUBLIC_ARTICLES_PATH, JSON.stringify(articles, null, 2), 'utf-8');
      console.log(`💾 Senkronize tou nan: ${PUBLIC_ARTICLES_PATH}`);
    }

    console.log("🎉 Operasyon an reyisi 100%!");
  } catch (error) {
    console.error("❌ ERÈ PANDAN JENERASYON ATIK LA:", error.message);
    process.exit(1);
  }
}

main();
