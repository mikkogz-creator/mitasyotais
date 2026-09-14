import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { styles = [], budget = "100 €", allergies = [], customDislikes = "" } = req.body;

    const prompt = `
Olet suomalaisen arjen ja perheruokien huippuasiantuntija.
Laadi ateriasuunnitelma ja kauppalista 7 PÄIVÄLLE (Maanantai - Sunnuntai).

Käyttäjän valinnat:
- Ruokateemat: ${styles.join(", ") || "Perinteinen kotiruoka"}
- Viikkobudjetti (n. 4 hlöä): ${budget}
- Rajoitteet ja allergiat: ${allergies.join(", ") || "Ei erityisiä"}
- Muut toiveet/huomiot: ${customDislikes || "Ei ole"}

KRIITTISET SÄÄNNÖT RAAKA-AINEILLE JA KAUPPALISTALLE:
1. Käytä AINOASTAAN aitoja, tavallisia suomalaisten S-ryhmän (Prisma, S-market) ja K-ryhmän (K-Citymarket, K-Supermarket) valikoimista löytyviä tuotteita.
2. ÄLÄ KOSKAAN keksi ulkomaisia tuotteita (ei kosher-suolaa, heavy creamia tms.). Käytä tuttuja tuotteita: kuohukerma, ruokakerma, naudan jauheliha, kirjolohifilee, maustamaton jogurtti, tomaattimurska jne.
3. Huomioi allergiat (esim. gluteeniton makaroni, laktoositon maito/kerma).
4. Palauta ostoslistalla (groceries) jokaisesta tuotteesta:
   - "name": Selkeä reseptinimi määrineen (esim. "Naudan jauheliha 10% (400 g)", "Gluteeniton makaroni (400 g)", "Porkkana (1 kg)")
   - "searchTerm": Kaupan hakukoneelle sopiva puhdas perusmuotoinen hakusana ILMAN määriä tai pakkauskokoja (esim. "naudan jauheliha", "gluteeniton makaroni", "porkkana", "laktoositon ruokakerma").

Vastaa AINOASTAAN JSON-muodossa:
{
  "meals": [
    {
      "day": "Maanantai",
      "name": "Aterian nimi",
      "time": "Valmistusaika esim. 25 min",
      "info": "Lyhyt kuvaus sopivuudesta arkeen",
      "ingredients": [
        "400 g naudan jauhelihaa",
        "400 g gluteenitonta makaronia",
        "5 dl laktoositonta kevytmaitoa",
        "2 kpl kananmunia"
      ],
      "instructions": [
        "Keitä makaronit suolalla maustetussa vedessä.",
        "Ruskista jauheliha pannulla ja mausta.",
        "Sekoita maito ja munat kulhossa.",
        "Yhdistä ainekset uunivuoassa ja paista 200 asteessa n. 40 min."
      ]
    }
  ],
  "groceries": [
    {
      "name": "Naudan jauheliha (400 g)",
      "searchTerm": "naudan jauheliha"
    },
    {
      "name": "Gluteeniton makaroni (400 g)",
      "searchTerm": "gluteeniton makaroni"
    },
    {
      "name": "Laktoositon kevytmaito (1 l)",
      "searchTerm": "laktoositon kevytmaito"
    }
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