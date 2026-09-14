import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { styles = [], budget = "80 €", allergies = [], customDislikes = "" } = req.body;

    const prompt = `
Olet suomalaisen arjen ja lapsiperheiden ruokasuunnittelun asiantuntija.
Laadi ateriasuunnitelma ja kauppalista 7 PÄIVÄLLE (Maanantai, Tiistai, Keskiviikko, Torstai, Perjantai, Lauantai, Sunnuntai).

Käyttäjän toiveet:
- Ruokatyylit: ${styles.join(", ") || "Perinteinen kotiruoka"}
- Viikkobudjettiarvio (n. 4 henkeä): ${budget}
- Rajoitteet ja allergiat: ${allergies.join(", ") || "Ei erityisiä"}
- Muut toiveet/huomiot: ${customDislikes || "Ei ole"}

OHJEET:
1. Huomioi EHDOTTOMASTI kaikki ilmoitetut allergiat ja rajoitteet.
2. Ainesosien pitää olla tuttuja ja helposti saatavia suomalaisista S- ja K-ryhmän kaupoista (Prisma, S-market, K-Citymarket, K-Supermarket). Käytä selkeitä määriä (esim. "400g jauhelihaa", "1 prk (2dl) ruokakermaa", "500g porkkanoita").
3. Anna jokaiselle aterialle selkeät ja ytimekkäät valmistusohjeet (3-5 vaihetta), jotka kiireinenkin kotikokki ymmärtää.
4. Yhdistä koko viikon raaka-aineista kattava kauppalista (groceries) kategorioittain tai selkeänä listana.

Palauta vastaus AINOASTAAN JSON-muodossa, ilman markdown-koodiblokkeja:
{
  "meals": [
    {
      "day": "Maanantai",
      "name": "Ruoan nimi",
      "time": "Valmistusaika esim. 25 min",
      "info": "Lyhyt kuvaus miksi tämä sopii arkeen",
      "ingredients": [
        "400 g jauhelihaa",
        "1 pss (400 g) makaronia",
        "5 dl kevytmaitoa (laktoositon)",
        "2 kpl kananmunia"
      ],
      "instructions": [
        "Keitä makaronit suolalla maustetussa vedessä pakkauksen ohjeen mukaan.",
        "Ruskista jauheliha pannulla ja mausta suolalla, pippurilla ja paprikalla.",
        "Sekoita maito ja munat munamaidoksi kulhossa.",
        "Sekoita makaronit ja jauheliha uunivuoassa, kaada munamaito päälle.",
        "Paista 200 asteessa uunin alatasolla noin 40 minuuttia."
      ]
    }
  ],
  "groceries": [
    "400 g jauhelihaa",
    "makaroni 400 g",
    "kevytmaito 1 l"
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(result);
  } catch (error) {
    console.error("OpenAI error:", error);
    return res.status(500).json({ error: "Virhe ruokasuunnitelman luonnissa." });
  }
}