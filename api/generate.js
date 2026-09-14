import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Vain POST-pyynnöt sallittu' });
  }

  try {
    const { styles, budget, allergies, customDislikes } = req.body;

    const systemPrompt = `Olet "Mitä syötäis?" -sovelluksen arjen ruoka-apuri suomalaisille lapsiperheille.
Suunnittele 5 arkipäivän (ma-pe) ruokalista ja optimoitu kauppalista.
Säännöt:
1. Suosi tuttuja arkiruokia (makaronilaatikko, lohikeitto, bolognese, kanakastike, tortillat jne.).
2. Huomioi ruokahävikin minimointi ja 2 päivän satsit.
3. Huomioi annettu budjetti ja allergiat.
4. Palauta vastaus AINOASTAAN puhtaana JSON-objektina muodossa:
{
  "meals": [
    {"day": "Maanantai", "name": "Ruoan nimi", "time": "Valmistusaika", "info": "Miksi sopii perheelle / arjen oikotie"}
  ],
  "groceries": [
    "Porkkanapussi 1 kg",
    "Kirjolohifilee 600 g"
  ]
}`;

    const userPrompt = `
Ruokatyylit: ${styles && styles.length > 0 ? styles.join(', ') : 'Tavallinen kotiruoka'}
Viikkobudjetti: ${budget || '80 €'}
Allergiat ja rajoitteet: ${allergies && allergies.length > 0 ? allergies.join(', ') : 'Ei rajoitteita'}
Erityistoiveet: ${customDislikes || 'Ei erikoistoiveita'}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const parsedData = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('Virhe OpenAI-kutsussa:', error);
    return res.status(500).json({ error: 'Aterioiden luonti epäonnistui' });
  }
}
