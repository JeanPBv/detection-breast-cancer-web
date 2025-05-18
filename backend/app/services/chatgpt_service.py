from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def interpretation_openIA(resultados: dict) -> str:
    prompt = f"""
    A partir del análisis de imágenes histopatológicas se obtuvieron los siguientes resultados:

    - Benigno: {resultados.get('Benigno', 0):.2f}%
    - Carcinoma ductal: {resultados.get('Carcinoma ductal', 0):.2f}%
    - Carcinoma lobulillar: {resultados.get('Carcinoma lobulillar', 0):.2f}%

    Redacta una interpretación preliminar médica real y bien detallada acerca del diagnóstico.
    """

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Eres un asistente médico experto en patología."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        max_tokens=200,
        n=1,
        stop=None,
    )

    return response['choices'][0]['message']['content'].strip()
